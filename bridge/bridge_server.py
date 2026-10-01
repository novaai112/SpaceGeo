import json, os, subprocess, sys, tempfile
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

CAD_DEFINITIONS = {
    "solidworks": {"display": "SolidWorks", "processes": ["SLDWORKS.exe", "sldworks.exe"], "registry": [r"SOFTWARE\SolidWorks\SOLIDWORKS", r"SOFTWARE\WOW6432Node\SolidWorks\SOLIDWORKS"]},
    "spaceclaim": {"display": "SpaceClaim", "processes": ["SpaceClaim.exe", "spaceclaim.exe"], "registry": [r"SOFTWARE\ANSYS Inc\ANSYS SpaceClaim"]},
    "inventor": {"display": "Autodesk Inventor", "processes": ["Inventor.exe"], "registry": [r"SOFTWARE\Autodesk\Inventor"]},
    "catia": {"display": "CATIA", "processes": ["CNEXT.exe", "CATIA.exe"], "registry": [r"SOFTWARE\Dassault Systemes"]},
    "fusion360": {"display": "Fusion 360", "processes": ["Fusion360.exe", "Fusion.exe"], "registry": [r"SOFTWARE\Autodesk\Fusion360"]},
    "creo": {"display": "PTC Creo", "processes": ["xtop.exe", "creo.exe"], "registry": [r"SOFTWARE\PTC\Creo"]},
    "nx": {"display": "Siemens NX", "processes": ["ugraf.exe", "NX.exe"], "registry": [r"SOFTWARE\Siemens\NX"]},
    "onshape": {"display": "Onshape", "processes": [], "registry": [], "is_cloud": True},
    "solidedge": {"display": "Solid Edge", "processes": ["Edge.exe", "SolidEdge.exe"], "registry": [r"SOFTWARE\Siemens\Solid Edge"]},
}

def get_running_processes():
    running = set()
    if HAS_PSUTIL:
        for proc in psutil.process_iter(["name"]):
            try: running.add(proc.info["name"].lower())
            except: pass
    else:
        try:
            out = subprocess.check_output(["tasklist","/fo","csv","/nh"], creationflags=subprocess.CREATE_NO_WINDOW, stderr=subprocess.DEVNULL).decode(errors="ignore")
            for line in out.splitlines():
                parts = line.split(",")
                if parts: running.add(parts[0].strip('"').lower())
        except: pass
    return running

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
                    try: versions.append(winreg.EnumKey(key, i)); i += 1
                    except OSError: break
                key.Close()
            except: pass
    except ImportError: pass
    return versions

def check_cad_status(cad_id):
    cad = CAD_DEFINITIONS.get(cad_id)
    if not cad: return {"running": False, "installed": False, "versions": [], "error": "Unknown"}
    if cad.get("is_cloud"): return {"running": True, "installed": True, "versions": ["Cloud"], "name": cad["display"]}
    procs = get_running_processes()
    is_running = any(p.lower() in procs for p in cad["processes"])
    vers = get_installed_versions(cad_id)
    return {"running": is_running, "installed": bool(vers) or is_running, "versions": vers, "name": cad["display"]}

def check_all_status():
    return {cid: check_cad_status(cid) for cid in CAD_DEFINITIONS}

def get_solidworks_context():
    script = r'''
import win32com.client, pythoncom, json, sys
def run():
    pythoncom.CoInitialize()
    r = {"running": False, "active_doc": None, "doc_type": None, "doc_path": None, "features": [], "bodies": [], "components": [], "configurations": [], "active_config": None, "units": "mm", "material": None, "selection": [], "open_documents": []}
    try:
        sw = win32com.client.GetActiveObject("SldWorks.Application")
        r["running"] = True
        r["version"] = str(sw.RevisionNumber())
        odocs = []
        try:
            for i in range(1, sw.GetDocumentCount()+1):
                d = sw.IGetDocumentByIndex(i)
                if d: odocs.append(d.GetPathName() or d.GetTitle())
        except: pass
        r["open_documents"] = odocs
        doc = sw.ActiveDoc
        if doc is None:
            r["active_doc"] = "No active document"
            print(json.dumps(r)); return
        dmap = {1:"Part", 2:"Assembly", 3:"Drawing"}
        r["doc_type"] = dmap.get(doc.GetType(), "Unknown")
        r["active_doc"] = doc.GetTitle()
        r["doc_path"] = doc.GetPathName() or ""
        try: r["active_config"] = doc.IGetActiveConfiguration().Name
        except: pass
        try:
            cn = doc.GetConfigurationNames()
            r["configurations"] = list(cn) if cn and isinstance(cn,(list,tuple)) else ([cn] if cn else [])
        except: pass
        try:
            umap={0:"mm",1:"cm",2:"m",3:"in",4:"ft"}
            r["units"] = umap.get(doc.GetUnits(0),"mm")
        except: pass
        if r["doc_type"] == "Part":
            feats=[]
            try:
                f=doc.FirstFeature()
                c=0
                while f and c<60:
                    feats.append({"name":f.Name,"type":f.GetTypeName2()})
                    f=f.GetNextFeature(); c+=1
            except: pass
            r["features"]=feats
            try:
                b=doc.GetBodies2(1,False)
                if b: r["bodies"]=[f"Body{i+1}" for i in range(len(b))]
            except: pass
            try:
                m=doc.GetMaterialPropertyName2("","")
                if m: r["material"]=m
            except: pass
        elif r["doc_type"] == "Assembly":
            try:
                c=doc.GetComponents(True)
                if c: r["components"]=[x.GetModelDoc2().GetTitle() if x.GetModelDoc2() else "Unknown" for x in c[:20]]
            except: pass
        try:
            sm=doc.SelectionManager
            sc=sm.GetSelectedObjectCount2(-1)
            sel=[]
            for i in range(1,min(sc+1,11)):
                try: sel.append({"index":i,"type":sm.GetSelectedObjectType3(i,-1)})
                except: pass
            r["selection"]=sel
        except: pass
    except Exception as e:
        r["error"]=str(e)
    pythoncom.CoUninitialize()
    print(json.dumps(r))
run()
'''
    try:
        p = os.path.join(tempfile.gettempdir(), "sg_ctx.py")
        with open(p,"w") as f: f.write(script)
        proc = subprocess.run([sys.executable, p], capture_output=True, text=True, timeout=10, creationflags=subprocess.CREATE_NO_WINDOW if sys.platform=="win32" else 0)
        out = proc.stdout.strip()
        if out: return json.loads(out)
        return {"running": False, "error": proc.stderr.strip() or "No output"}
    except subprocess.TimeoutExpired: return {"running": False, "error": "Timed out"}
    except Exception as e: return {"running": False, "error": str(e)}

def execute_python_script(script, software):
    try:
        p = os.path.join(tempfile.gettempdir(), f"sg_run_{software}.py")
        with open(p, "w", encoding="utf-8") as f: f.write(script)
        flags = subprocess.CREATE_NO_WINDOW if sys.platform=="win32" else 0
        proc = subprocess.run([sys.executable, p], capture_output=True, text=True, timeout=60, creationflags=flags)
        stdout = proc.stdout.strip()
        stderr = proc.stderr.strip()
        success = proc.returncode == 0 and "Traceback" not in stderr and "Error" not in stderr
        msg = stdout if stdout else (stderr if stderr else "Script executed")
        if "Traceback" in stderr or "Error" in stderr: success=False; msg=stderr
        return {"success": success, "message": msg[:600], "returncode": proc.returncode}
    except subprocess.TimeoutExpired: return {"success": False, "message": "Script timed out after 60s"}
    except Exception as e: return {"success": False, "message": str(e)}

def _find_sc_hwnd():
    try:
        import win32gui
        result = []
        def cb(hwnd, _):
            try:
                import win32gui as wg
                if wg.IsWindowVisible(hwnd):
                    title = wg.GetWindowText(hwnd)
                    if "SpaceClaim" in title and "Bridge" not in title:
                        result.append((hwnd, title))
            except Exception: pass
        win32gui.EnumWindows(cb, None)
        return result[0][0] if result else None
    except Exception: return None

def _find_sc_exe():
    if HAS_PSUTIL:
        for proc in psutil.process_iter(["name","exe"]):
            try:
                if "spaceclaim" in proc.info["name"].lower():
                    return proc.info["exe"]
            except Exception: pass
    known = [
        r"C:\Program Files\ANSYS Inc\v241\scdm\SpaceClaim.exe",
        r"C:\Program Files\ANSYS Inc\v232\scdm\SpaceClaim.exe",
        r"C:\Program Files\ANSYS Inc\v231\scdm\SpaceClaim.exe",
        r"C:\Program Files\ANSYS Inc\v222\scdm\SpaceClaim.exe",
        r"C:\Program Files\ANSYS Inc\v221\scdm\SpaceClaim.exe",
        r"C:\Program Files\ANSYS Inc\v212\scdm\SpaceClaim.exe",
        r"C:\Program Files\SpaceClaim\SpaceClaim.exe",
    ]
    for p in known:
        if os.path.exists(p): return p
    return None

def execute_spaceclaim_script(script, script_name="sg_macro.py"):
    import time, ctypes
    macro_dir = os.path.join(os.environ.get("APPDATA", tempfile.gettempdir()), "SpaceClaim", "Macros")
    os.makedirs(macro_dir, exist_ok=True)
    macro_path = os.path.join(macro_dir, script_name)
    with open(macro_path, "w", encoding="utf-8") as f:
        f.write(script)

    clipboard_ok = False
    try:
        import win32clipboard
        win32clipboard.OpenClipboard()
        win32clipboard.EmptyClipboard()
        win32clipboard.SetClipboardText(macro_path)
        win32clipboard.CloseClipboard()
        clipboard_ok = True
    except Exception:
        pass

    sc_hwnd = _find_sc_hwnd()

    def _clipboard_fallback():
        return {
            "success": True,
            "message": f"SpaceClaim focused. Path copied to clipboard.\n\nIn SpaceClaim:\nFile \u2192 Scripting \u2192 Run Script \u2192 Ctrl+V \u2192 Enter",
            "scriptPath": macro_path,
            "clipboardReady": clipboard_ok,
            "method": "manual_with_clipboard",
        }

    if not sc_hwnd:
        sc_exe = _find_sc_exe()
        if sc_exe:
            subprocess.Popen([sc_exe, f"/RunScript={macro_path}"])
            return {
                "success": True,
                "message": "SpaceClaim launching with your script. A new window will open.",
                "scriptPath": macro_path,
                "method": "launch_with_script",
            }
        return {
            "success": False,
            "message": f"SpaceClaim not found.\nScript saved to: {macro_path}\nOpen SpaceClaim \u2192 File \u2192 Scripting \u2192 Run Script",
            "scriptPath": macro_path,
            "clipboardReady": clipboard_ok,
        }

    try:
        from pywinauto import Desktop
        from pywinauto.keyboard import send_keys
        import time

        app_desktop = Desktop(backend="uia")
        sc_win = app_desktop.window(handle=sc_hwnd)
        sc_win.set_focus()
        time.sleep(1.0)
        send_keys("{ESC}", pause=0.05)
        time.sleep(0.3)

        ran_ok = False

        try:
            sc_win.menu_select("File->Scripting->Run Script")
            time.sleep(1.5)
            ran_ok = True
        except Exception:
            pass

        if not ran_ok:
            for seq in [
                "%fsr",
                "%{F10}sr",
            ]:
                try:
                    send_keys("{ESC}", pause=0.05)
                    time.sleep(0.2)
                    sc_win.set_focus()
                    time.sleep(0.3)
                    send_keys(seq, pause=0.15)
                    time.sleep(1.5)
                    ran_ok = True
                    break
                except Exception:
                    pass

        open_dialog = None
        for title_re in [r"Run Script", r"Open", r"Select.*Script", r"Python"]:
            try:
                dlg = app_desktop.window(title_re=title_re, top_level_only=True)
                if dlg.exists(timeout=2):
                    open_dialog = dlg
                    break
            except Exception:
                pass

        if open_dialog:
            try:
                fn_edit = open_dialog.child_window(control_type="Edit")
                fn_edit.set_text("")
                fn_edit.type_keys(macro_path, with_spaces=True)
                time.sleep(0.2)
                try:
                    open_dialog.child_window(title_re="Open|Run|OK").click_input()
                except Exception:
                    send_keys("{ENTER}", pause=0.05)
                time.sleep(4.0)
                return {
                    "success": True,
                    "message": "Script executed in SpaceClaim. Model should appear now.",
                    "scriptPath": macro_path,
                    "method": "keyboard_automation",
                }
            except Exception as e:
                send_keys("^v{ENTER}", pause=0.1)
                time.sleep(4.0)
                return {
                    "success": True,
                    "message": "Script sent to SpaceClaim dialog. Check for new model.",
                    "scriptPath": macro_path,
                    "method": "keyboard_automation",
                }
        else:
            send_keys("^v{ENTER}", pause=0.1)
            time.sleep(4.0)
            return {
                "success": True,
                "message": "Script command sent. If model didn\u2019t appear, use the 4-step guide below.",
                "scriptPath": macro_path,
                "method": "manual_with_clipboard",
                "clipboardReady": clipboard_ok,
            }

    except ImportError:
        try:
            import win32gui, win32api, win32con
            ctypes.windll.user32.ShowWindow(sc_hwnd, 9)
            ctypes.windll.user32.SetForegroundWindow(sc_hwnd)
            time.sleep(1.2)
        except Exception:
            pass
        return _clipboard_fallback()
    except Exception:
        return _clipboard_fallback()



class BridgeHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args): print(f"[Bridge] {fmt % args}")
    def log_error(self, fmt, *args): pass
    def send_json(self, data, status=200):
        try:
            body = json.dumps(data, indent=2).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(body)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass
    def do_OPTIONS(self):
        try:
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        if parsed.path == "/status":
            sw = params.get("software",[None])[0]
            self.send_json(check_cad_status(sw) if sw else check_all_status())
        elif parsed.path == "/all": self.send_json(check_all_status())
        elif parsed.path == "/health": self.send_json({"status":"ok","bridge":"SpaceGeo CAD Bridge v2.0","psutil":HAS_PSUTIL})
        elif parsed.path == "/installed":
            inst = {}
            for cid,cad in CAD_DEFINITIONS.items():
                v=get_installed_versions(cid)
                if v or cad.get("is_cloud"): inst[cid]={"name":cad["display"],"versions":v}
            self.send_json(inst)
        elif parsed.path == "/context":
            sw = params.get("software",["solidworks"])[0]
            self.send_json(get_solidworks_context() if sw=="solidworks" else {"running":check_cad_status(sw).get("running",False),"software":sw})
        else: self.send_json({"error":"Unknown endpoint"},404)
    def do_POST(self):
        parsed = urlparse(self.path)
        cl = int(self.headers.get("Content-Length",0))
        body = self.rfile.read(cl) if cl else b"{}"
        try: data = json.loads(body)
        except: data = {}
        if parsed.path == "/execute":
            script = data.get("script","")
            if not script: self.send_json({"error":"No script"},400); return
            self.send_json(execute_python_script(script, data.get("software","")))
        elif parsed.path == "/spaceclaim":
            script = data.get("script","")
            if not script: self.send_json({"error":"No script"},400); return
            script_name = data.get("scriptName", "sg_macro.py")
            self.send_json(execute_spaceclaim_script(script, script_name))
        else: self.send_json({"error":"Unknown endpoint"},404)

def main():
    port = 7800
    print("="*55)
    print("  SpaceGeo AI - Local CAD Bridge Server v2.1")
    print("="*55)
    print(f"  Listening on: http://localhost:{port}")
    print(f"  psutil: {HAS_PSUTIL}")
    print()
    print("  GET  /health  /status?software=  /all  /installed")
    print("  GET  /context?software=solidworks")
    print("  POST /execute       { software, script }")
    print("  POST /spaceclaim    { script, scriptName }")
    print()
    print("  Press Ctrl+C to stop")
    print("="*55)
    server = HTTPServer(("localhost", port), BridgeHandler)
    try: server.serve_forever()
    except KeyboardInterrupt: print("\n  Bridge stopped."); server.server_close()


if __name__ == "__main__": main()
