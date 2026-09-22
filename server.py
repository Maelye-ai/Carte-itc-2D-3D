#!/usr/bin/env python3
"""
Serveur HTTP local léger pour la cartographie 3D/2D de Lagunes Exploration Afrique (LEA).
Permet de visualiser le projet sur n'importe quel navigateur à l'adresse : http://localhost:8080
"""

import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # En-têtes pour éviter les problèmes de cache pendant le développement
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    print(f"=====================================================================")
    print(f"  LAGUNES EXPLORATION AFRIQUE (LEA) - VISUALISATION 3D & 2D")
    print(f"=====================================================================")
    print(f"  Serveur démarré avec succès !")
    print(f"  Ouvrez votre navigateur sur : http://localhost:{PORT}")
    print(f"  Dossier racine : {DIRECTORY}")
    print(f"  Appuyez sur Ctrl+C pour arrêter le serveur.")
    print(f"=====================================================================")
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur.")
        sys.exit(0)
