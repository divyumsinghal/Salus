#!/usr/bin/env python3
# Salus proxy server - runs inside Daytona sandbox on port 8080
# Serves voice UI and proxies /api/prompt to OpenCode on localhost:3000

import json
import os
import time
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import urlopen, Request

OPENCODE_URL = "http://localhost:3000"
PORT = 8080
DIR = os.path.dirname(os.path.abspath(__file__))

session_id = None

def oc_post(path, data):
    body = json.dumps(data).encode()
    req = Request(OPENCODE_URL + path, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(req, timeout=120) as r:
        return json.loads(r.read())

def init_session():
    global session_id
    for i in range(60):
        try:
            result = oc_post("/session", {})
            session_id = result.get("id") or result.get("sessionID")
            print(f"[Salus] Session ready: {session_id}", flush=True)
            return
        except Exception as e:
            print(f"[Salus] Waiting for OpenCode ({i+1}/60): {e}", flush=True)
            time.sleep(2)
    print("[Salus] ERROR: OpenCode never became ready", flush=True)

class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress access logs

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            html_path = os.path.join(DIR, "index.html")
            try:
                with open(html_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/prompt":
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            prompt = body.get("prompt", "")

            if not session_id:
                self.send_response(503)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Session not ready yet, please wait a moment"}).encode())
                return

            try:
                result = oc_post(f"/session/{session_id}/message", {
                    "parts": [{"type": "text", "text": prompt}]
                })
                parts = result.get("parts", [])
                text = " ".join(p["text"] for p in parts if p.get("type") == "text")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"response": text or "No response"}).encode())
            except Exception as e:
                print(f"[Salus] API error: {e}", flush=True)
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

threading.Thread(target=init_session, daemon=True).start()

print(f"[Salus] UI server starting on port {PORT}", flush=True)
HTTPServer(("", PORT), Handler).serve_forever()
