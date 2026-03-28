# /home/daytona/skills/server.py

from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

PORT = 8080

Handler = SimpleHTTPRequestHandler

with TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()