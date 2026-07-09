"""Pixel Portrait — Local dev server (Python 3.13+ compatible)"""
import os, base64, json, http.server, io, re
import requests

AGNES_API_KEY = os.environ.get("AGNES_API_KEY", "")
API_BASE = "https://apihub.agnes-ai.com/v1"
HTML_DIR = os.path.dirname(os.path.abspath(__file__))


def parse_multipart(body, content_type):
    """Minimal multipart/form-data parser."""
    boundary = re.search(r'boundary=([^;\s]+)', content_type)
    if not boundary:
        return None, None
    b = boundary.group(1).encode()

    # Split body by boundary
    parts = body.split(b'--' + b)
    image_data = None
    prompt = None

    for part in parts:
        if not part or part == b'--\r\n' or part == b'--\n':
            continue
        # Split headers and content
        header_end = part.find(b'\r\n\r\n')
        if header_end == -1:
            header_end = part.find(b'\n\n')
            if header_end == -1:
                continue
            headers = part[:header_end].decode('utf-8', errors='ignore')
            content = part[header_end + 2:]
        else:
            headers = part[:header_end].decode('utf-8', errors='ignore')
            content = part[header_end + 4:]

        # Remove trailing CRLF before boundary
        content = content.rstrip(b'\r\n')

        if 'name="image"' in headers:
            image_data = content
        elif 'name="prompt"' in headers:
            prompt = content.decode('utf-8', errors='ignore')

    return image_data, prompt


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=HTML_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/generate':
            self.handle_generate()
        else:
            self.send_error(404)

    def handle_generate(self):
        content_type = self.headers.get('Content-Type', '')
        if 'multipart/form-data' not in content_type:
            return self.send_json_error(400, "Expected multipart form data")

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)

        image_data, prompt = parse_multipart(body, content_type)
        if not image_data or not prompt:
            return self.send_json_error(400, "Missing image or prompt")

        # Call Agnes img2img
        data_url = f"data:image/png;base64,{base64.b64encode(image_data).decode()}"
        try:
            resp = requests.post(
                f"{API_BASE}/images/generations",
                headers={
                    "Authorization": f"Bearer {AGNES_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "agnes-image-2.0-flash",
                    "prompt": prompt,
                    "size": "1024x1024",
                    "extra_body": {
                        "tags": ["img2img"],
                        "image": [data_url],
                        "response_format": "url",
                        "strength": 0.5
                    }
                },
                timeout=120
            )
            resp.raise_for_status()
            result = resp.json()
            image_url = result["data"][0]["url"]
        except Exception as e:
            return self.send_json_error(502, str(e))

        self.send_json(200, {"url": image_url})

    def send_json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_json_error(self, code, msg):
        self.send_json(code, {"error": msg})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"Pixel Portrait local server: http://localhost:{port}")
    print(f"Set AGNES_API_KEY env var before running.")
    http.server.HTTPServer(('', port), Handler).serve_forever()
