#!/usr/bin/env python3
# Dev server that tells browsers never to cache — so edits always show up.
import http.server
import sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8791
http.server.test(HandlerClass=NoCacheHandler, port=port)
