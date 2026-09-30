"""
SpaceGeo AI - Local CAD Bridge Server
Run this on your Windows PC to enable real CAD software detection.
python bridge_server.py

Detects running CAD software by checking Windows processes and registry.
Exposes HTTP API at http://localhost:7800
"""

import json
import os
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

CAD_DEFINITIONS = {
    "solidworks": {
        "display": "SolidWorks",
        "processes": ["SLDWORKS.exe", "sldworks.exe"],
        "registry": [
            r"SOFTWARE\SolidWorks\SOLIDWORKS",
            r"SOFTWARE\WOW6432Node\SolidWorks\SOLIDWORKS",
        ],
    },
    "spaceclaim": {
        "display": "SpaceClaim",
        "processes": ["SpaceClaim.exe", "spaceclaim.exe"],
        "registry": [
            r"SOFTWARE\ANSYS Inc\ANSYS SpaceClaim",
            r"SOFTWARE\Ansys Inc",
        ],
    },
    "inventor": {
        "display": "Autodesk Inventor",
        "processes": ["Inventor.exe", "inventor.exe"],
        "registry": [
            r"SOFTWARE\Autodesk\Inventor",
            r"SOFTWARE\WOW6432Node\Autodesk\Inventor",
        ],
    },
    "catia": {
        "display": "CATIA",
        "processes": ["CNEXT.exe", "catia.exe", "CATIA.exe", "cnext.exe"],
        "registry": [
            r"SOFTWARE\Dassault Systemes",
            r"SOFTWARE\WOW6432Node\Dassault Systemes",
        ],
    },
    "fusion360": {
        "display": "Fusion 360",
        "processes": [
            "Fusion360.exe",
            "FusionLauncher.exe",
            "fusion360.exe",
            "Fusion.exe",
        ],
        "registry": [
            r"SOFTWARE\Autodesk\Fusion360",
            r"SOFTWARE\WOW6432Node\Autodesk\Fusion360",
        ],
    },
    "creo": {
        "display": "PTC Creo",
        "processes": [
            "xtop.exe",
            "nitro_proe.exe",
            "creo.exe",
            "Creo.exe",
            "proe.exe",
        ],
        "registry": [
            r"SOFTWARE\PTC\Creo",
            r"SOFTWARE\WOW6432Node\PTC\Creo",
        ],
    },
    "nx": {
        "display": "Siemens NX",
        "processes": ["ugraf.exe", "nxl.exe", "nx.exe", "NX.exe", "ugraf64.exe"],
        "registry": [
            r"SOFTWARE\Siemens\NX",
            r"SOFTWARE\Unigraphics Solutions",
        ],
    },
    "onshape": {
        "display": "Onshape",
        "processes": [],
        "registry": [],
        "is_cloud": True,
    },
    "solidedge": {
        "display": "Solid Edge",
        "processes": ["Edge.exe", "SolidEdge.exe", "solidedge.exe"],
        "registry": [
            r"SOFTWARE\Siemens\Solid Edge",
            r"SOFTWARE\WOW6432Node\Siemens\Solid Edge",
            r"SOFTWARE\UGS\Solid Edge",
        ],
    },
}


def get_running_processes():
    running = set()
    if HAS_PSUTIL:
        for proc in psutil.process_iter(["name"]):
            try:
                running.add(proc.info["name"].lower())
            except Exception:
                pass
    else:
        try:
            output = subprocess.check_output(
                ["tasklist", "/fo", "csv", "/nh"],
                creationflags=subprocess.CREATE_NO_WINDOW,
                stderr=subprocess.DEVNULL,
            ).decode(errors="ignore")
            for line in output.splitlines():
                parts = line.split(",")
                if parts:
                    running.add(parts[0].strip('"').lower())
        except Exception:
            pass
    return running


def check_registry_key(key_path):
    try:
        import winreg
        parts = key_path.split("\\", 1)
        hive_map = {
            "HKEY_LOCAL_MACHINE": winreg.HKEY_LOCAL_MACHINE,
            "SOFTWARE": winreg.HKEY_LOCAL_MACHINE,
        }
        hive = winreg.HKEY_LOCAL_MACHINE
        winreg.OpenKey(hive, key_path)
        return True
    except Exception:
        return False


def get_installed_versions(cad_id):
    cad = CAD_DEFINITIONS.get(cad_id, {})
    versions = []
    try:
        import winreg
        for reg_path in cad.get("registry", []):
            try:
                key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, reg_path)
                i = 0
                while True:
                    try:
                        sub = winreg.EnumKey(key, i)
                        versions.append(sub)
                        i += 1
                    except OSError:
                        break
                key.Close()
            except Exception:
                pass
    except ImportError:
        pass
    return versions


def check_cad_status(cad_id):
    cad = CAD_DEFINITIONS.get(cad_id)
    if not cad:
        return {"running": False, "installed": False, "versions": [], "error": "Unknown CAD software"}

    if cad.get("is_cloud"):
        return {"running": True, "installed": True, "versions": ["Cloud"], "name": cad["display"]}

    running_procs = get_running_processes()
    is_running = any(p.lower() in running_procs for p in cad["processes"])
    installed_versions = get_installed_versions(cad_id)
    is_installed = bool(installed_versions) or is_running

    return {
        "running": is_running,
        "installed": is_installed,
        "versions": installed_versions,
        "name": cad["display"],
        "processes_checked": cad["processes"],
    }


def check_all_status():
    result = {}
    for cad_id in CAD_DEFINITIONS:
        result[cad_id] = check_cad_status(cad_id)
    return result


class BridgeHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[SpaceGeo Bridge] {format % args}")

    def send_json(self, data, status=200):
        body = json.dumps(data, indent=2).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        if parsed.path == "/status":
            software = params.get("software", [None])[0]
            if software:
                result = check_cad_status(software)
            else:
                result = check_all_status()
            self.send_json(result)

        elif parsed.path == "/all":
            self.send_json(check_all_status())

        elif parsed.path == "/health":
            self.send_json({"status": "ok", "bridge": "SpaceGeo CAD Bridge v1.0", "psutil": HAS_PSUTIL})

        elif parsed.path == "/installed":
            installed = {}
            for cad_id, cad in CAD_DEFINITIONS.items():
                versions = get_installed_versions(cad_id)
                if versions or cad.get("is_cloud"):
                    installed[cad_id] = {"name": cad["display"], "versions": versions}
            self.send_json(installed)

        else:
            self.send_json({"error": "Unknown endpoint"}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length else b"{}"

        try:
            data = json.loads(body)
        except Exception:
            data = {}

        if parsed.path == "/execute":
            software = data.get("software", "")
            script = data.get("script", "")
            if not script:
                self.send_json({"error": "No script provided"}, 400)
                return

            result = self.execute_cad_script(software, script)
            self.send_json(result)
        else:
            self.send_json({"error": "Unknown endpoint"}, 404)

    def execute_cad_script(self, software, script):
        try:
            if software == "solidworks":
                script_path = os.path.join(os.environ.get("TEMP", "C:\\Temp"), "sg_macro.swb")
                with open(script_path, "w") as f:
                    f.write(script)
                return {"success": True, "message": f"SolidWorks macro saved to {script_path}. Run it from Tools > Macros > Run."}

            elif software in ("inventor", "catia", "nx", "spaceclaim", "solidedge", "fusion360", "creo"):
                script_path = os.path.join(os.environ.get("TEMP", "C:\\Temp"), f"sg_script_{software}.py")
                with open(script_path, "w") as f:
                    f.write(script)
                return {"success": True, "message": f"Script saved to {script_path}"}

            return {"success": False, "error": f"Execution not implemented for {software}"}
        except Exception as e:
            return {"success": False, "error": str(e)}


def main():
    port = 7800
    print("=" * 55)
    print("  SpaceGeo AI - Local CAD Bridge Server")
    print("=" * 55)
    print(f"  Listening on: http://localhost:{port}")
    print(f"  psutil available: {HAS_PSUTIL}")
    print()
    print("  Endpoints:")
    print("    GET  /health           - Check bridge status")
    print("    GET  /status?software= - Check specific CAD")
    print("    GET  /all              - Check all CAD software")
    print("    GET  /installed        - List installed CAD")
    print("    POST /execute          - Run CAD script")
    print()
    print("  Press Ctrl+C to stop")
    print("=" * 55)

    if not HAS_PSUTIL:
        print()
        print("  TIP: Install psutil for better process detection:")
        print("       pip install psutil")
        print()

    server = HTTPServer(("localhost", port), BridgeHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Bridge server stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
