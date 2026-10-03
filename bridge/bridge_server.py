import json, os, subprocess, sys, tempfile, threading, time
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
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

# ---------------------------------------------------------------------------
# SpaceClaim helpers
# ---------------------------------------------------------------------------

def _find_sc_hwnd():
    """Return the HWND of the main SpaceClaim window, or None."""
    try:
        import win32gui
        results = []
        def cb(hwnd, _):
            try:
                if win32gui.IsWindowVisible(hwnd):
                    title = win32gui.GetWindowText(hwnd)
                    if "SpaceClaim" in title and "Bridge" not in title:
                        results.append((hwnd, title))
            except Exception:
                pass
        win32gui.EnumWindows(cb, None)
        return results[0][0] if results else None
    except Exception:
        return None

def _find_sc_exe():
    """Return the path to SpaceClaim.exe if installed, or None."""
    if HAS_PSUTIL:
        for proc in psutil.process_iter(["name", "exe"]):
            try:
                if "spaceclaim" in proc.info["name"].lower():
                    exe = proc.info.get("exe")
                    if exe:
                        return exe
            except Exception:
                pass

    # Comprehensive list of known installation paths (ANSYS 2019‒2024)
    known = []
    for ver in ["v251", "v242", "v241", "v232", "v231", "v222", "v221", "v212", "v211",
                "v202", "v201", "v195", "v194", "v193", "v192", "v191"]:
        known.append(rf"C:\Program Files\ANSYS Inc\{ver}\scdm\SpaceClaim.exe")
        known.append(rf"C:\Program Files\Ansys Inc\{ver}\scdm\SpaceClaim.exe")
    known += [
        r"C:\Program Files\SpaceClaim\SpaceClaim.exe",
        r"C:\Program Files (x86)\SpaceClaim\SpaceClaim.exe",
    ]
    for p in known:
        if os.path.exists(p):
            return p

    # Last-resort: registry search
    try:
        import winreg
        for reg_root in [winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER]:
            for reg_path in [r"SOFTWARE\ANSYS Inc\ANSYS SpaceClaim",
                              r"SOFTWARE\WOW6432Node\ANSYS Inc\ANSYS SpaceClaim"]:
                try:
                    key = winreg.OpenKey(reg_root, reg_path)
                    i = 0
                    while True:
                        try:
                            ver_name = winreg.EnumKey(key, i)
                            ver_key = winreg.OpenKey(key, ver_name)
                            exe_path, _ = winreg.QueryValueEx(ver_key, "InstallPath")
                            candidate = os.path.join(exe_path, "SpaceClaim.exe")
                            if os.path.exists(candidate):
                                return candidate
                            i += 1
                        except OSError:
                            break
                except Exception:
                    pass
    except ImportError:
        pass

    return None

# ---------------------------------------------------------------------------
# Method 1: SpaceClaim COM automation (best – no keyboard/mouse interaction)
# ---------------------------------------------------------------------------

def _execute_via_com(macro_path):
    """
    Try several known SpaceClaim COM ProgIDs.
    Returns (success: bool, message: str)
    """
    progids = [
        "SpaceClaim.Application",
        "SpaceClaim.Application.1",
        "AnsysSpaceClaim.Application",
    ]
    try:
        import win32com.client, pythoncom
        pythoncom.CoInitialize()
        try:
            for pid in progids:
                try:
                    sc_app = win32com.client.GetActiveObject(pid)
                    sc_app.RunScript(macro_path)
                    return True, f"Script executed via COM ProgID '{pid}'."
                except Exception:
                    pass
            return False, "No working SpaceClaim COM ProgID found."
        finally:
            pythoncom.CoUninitialize()
    except ImportError:
        return False, "win32com not available"

# ---------------------------------------------------------------------------
# Method 2: pywinauto click-only navigation (no keyboard shortcuts)
# ---------------------------------------------------------------------------

def _sc_find(parent, titles, ctrl_types, timeout=3.0):
    """Find first control matching any title+ctrl_type combo inside parent."""
    start = time.time()
    while time.time() - start < timeout:
        for title in titles:
            for ct in ctrl_types:
                try:
                    c = parent.child_window(title=title, control_type=ct)
                    if c.exists(timeout=0.1): return c
                except Exception: pass
                if time.time() - start >= timeout: return None
            try:
                c = parent.child_window(title=title)
                if c.exists(timeout=0.1): return c
            except Exception: pass
            if time.time() - start >= timeout: return None
    return None


def _sc_find_re(parent, pattern, ctrl_types, timeout=3.0):
    """Find first control whose title matches regex pattern inside parent."""
    start = time.time()
    while time.time() - start < timeout:
        for ct in ctrl_types:
            try:
                c = parent.child_window(title_re=pattern, control_type=ct)
                if c.exists(timeout=0.1): return c
            except Exception: pass
            if time.time() - start >= timeout: return None
        try:
            c = parent.child_window(title_re=pattern)
            if c.exists(timeout=0.1): return c
        except Exception: pass
        if time.time() - start >= timeout: return None
    return None


def _fill_open_dialog(desktop, macro_path):
    """
    Wait for SpaceClaim's file-open dialog, type the macro path,
    and click Open — no keyboard used.
    Returns (success, message).
    """
    dlg = None
    for _ in range(14):
        try:
            top = desktop.top_window()
            t = top.window_text()
            if any(kw in t for kw in ["Open", "Run", "Select", "Browse", "Script", "File"]):
                dlg = top; break
        except Exception: pass
        time.sleep(0.5)
    if dlg is None:
        return False, "File dialog did not appear."

    fn_edit = None
    for ct in ["Edit", "ComboBox"]:
        try:
            e = dlg.child_window(control_type=ct, found_index=0)
            if e.exists(timeout=2): fn_edit = e; break
        except Exception: pass
    if fn_edit is None:
        return False, "No filename field found in dialog."

    fn_edit.click_input()
    time.sleep(0.2)
    try:
        fn_edit.set_edit_text(macro_path)
    except Exception:
        try: fn_edit.set_text(macro_path)
        except Exception: return False, "Could not set path in dialog."
    time.sleep(0.3)

    open_btn = _sc_find(dlg,
        titles=["Open", "Run", "OK", "&Open", "&Run", "Run Script"],
        ctrl_types=["Button"])
    if open_btn is None:
        return False, "Open/Run button not found in dialog."
    open_btn.click_input()
    time.sleep(8.0)
    return True, "Script submitted via file dialog."


def _execute_via_ui_clicks(sc_hwnd, macro_path):
    """
    Navigate SpaceClaim menus using purely click_input() – no keyboard shortcuts.
    Path: File menu → Scripting → Run Script… → select file → click Open/Run
    Returns (success: bool, message: str)
    """
    try:
        from pywinauto import Desktop
    except ImportError:
        return False, "pywinauto not installed"

    import ctypes
    # Restore + foreground SpaceClaim
    try:
        ctypes.windll.user32.ShowWindow(sc_hwnd, 9)
        time.sleep(0.4)
        ctypes.windll.user32.SetForegroundWindow(sc_hwnd)
        time.sleep(0.9)
    except Exception: pass

    desktop = Desktop(backend="uia")
    sc_win  = desktop.window(handle=sc_hwnd)
    sc_win.set_focus()
    time.sleep(0.6)

    BTN = ["Button", "MenuItem", "SplitButton", "ListItem"]

    # ── Path A: 'Run Script' button already visible in current ribbon ──────
    print("[Bridge] Path A: Run Script button in current ribbon ...")
    btn = _sc_find(sc_win,
        titles=["Run Script", "Run Script...", "Run Script\u2026"],
        ctrl_types=BTN)
    if btn:
        print("[Bridge] Path A: found, clicking ...")
        btn.click_input(); time.sleep(1.5)
        ok, msg = _fill_open_dialog(desktop, macro_path)
        if ok: return True, "Script executed via ribbon Run Script button."
        print(f"[Bridge] Path A dialog failed: {msg}")

    # ── Path B: Design tab → Script group ─────────────────────────────────
    print("[Bridge] Path B: Design tab → Script button ...")
    tab = _sc_find(sc_win,
        titles=["Design", "Design "],
        ctrl_types=["TabItem", "Button", "MenuItem"])
    if tab:
        tab.click_input(); time.sleep(0.7)

    for title in ["Run Script", "Run Script...", "Script", "Scripting",
                   "Script Editor", "Edit Script", "Run Script\u2026"]:
        btn = _sc_find(sc_win, titles=[title], ctrl_types=BTN)
        if btn:
            print(f"[Bridge] Path B: found '{title}', clicking ...")
            btn.click_input(); time.sleep(1.5)
            ok, msg = _fill_open_dialog(desktop, macro_path)
            if ok: return True, f"Script executed via Design tab → {title}."
            # Script Editor panel opened; look for Open/Browse inside it
            for sub in ["Open", "Open Script", "Open File", "Browse", "Load"]:
                sb = _sc_find(sc_win, titles=[sub], ctrl_types=["Button", "MenuItem"])
                if sb:
                    sb.click_input(); time.sleep(1.2)
                    ok2, _ = _fill_open_dialog(desktop, macro_path)
                    if ok2: return True, f"Script executed via Script Editor → {sub}."
            break

    # ── Path C: File backstage (WPF — stays inside sc_win, not a popup) ───
    print("[Bridge] Path C: File backstage → Scripting → Run Script ...")
    file_btn = _sc_find(sc_win,
        titles=["File", "FILE", "File "],
        ctrl_types=["Button", "MenuItem", "TabItem"])
    if file_btn is None:
        return False, "Cannot locate the File button in SpaceClaim."

    file_btn.click_input(); time.sleep(1.2)

    # SpaceClaim's WPF Backstage keeps items as children of sc_win.
    # Search sc_win first, then any new top window as fallback.
    scripting = _sc_find(sc_win,
        titles=["Scripting", "Script", "Scripting "],
        ctrl_types=["MenuItem", "Button", "ListItem", "TabItem", "Text"])
    if scripting is None:
        scripting = _sc_find_re(sc_win, pattern=r"Script.*",
                                ctrl_types=["MenuItem", "Button", "ListItem"])
    if scripting is None:
        try:
            top = desktop.top_window()
            if top.handle != sc_hwnd:
                scripting = _sc_find(top,
                    titles=["Scripting", "Script"],
                    ctrl_types=["MenuItem", "Button", "ListItem"])
        except Exception: pass

    if scripting is None:
        return False, (
            "Opened File menu but could not find 'Scripting' item.\n"
            "Please run manually: File \u2192 Scripting \u2192 Run Script."
        )

    print("[Bridge] Path C: clicking Scripting ...")
    scripting.click_input(); time.sleep(0.9)

    run_item = _sc_find(sc_win,
        titles=["Run Script", "Run Script...", "Run Script\u2026", "Run"],
        ctrl_types=["MenuItem", "Button", "ListItem"])
    if run_item is None:
        try:
            top = desktop.top_window()
            if top.handle != sc_hwnd:
                run_item = _sc_find(top,
                    titles=["Run Script", "Run Script...", "Run Script\u2026"],
                    ctrl_types=["MenuItem", "Button", "ListItem"])
        except Exception: pass

    if run_item is None:
        return False, "Found 'Scripting' but could not find 'Run Script' sub-item."

    print("[Bridge] Path C: clicking Run Script ...")
    run_item.click_input(); time.sleep(1.5)

    ok, msg = _fill_open_dialog(desktop, macro_path)
    if ok: return True, "Script executed via File \u2192 Scripting \u2192 Run Script."
    return False, f"File dialog error: {msg}"


# ---------------------------------------------------------------------------
# Method 3: Launch SpaceClaim with /RunScript= command-line argument
# ---------------------------------------------------------------------------

def _launch_sc_with_script(sc_exe, macro_path):
    """Launch SpaceClaim.exe with /RunScript= flag. Returns (success, message)."""
    try:
        subprocess.Popen(
            [sc_exe, f"/RunScript={macro_path}"],
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
        )
        return True, (
            "SpaceClaim is launching with your script attached.\n"
            "The model will be created automatically once SpaceClaim finishes loading."
        )
    except Exception as exc:
        return False, f"Failed to launch SpaceClaim: {exc}"


# ---------------------------------------------------------------------------
# Main orchestration: tries COM → UI clicks → launch with script
# ---------------------------------------------------------------------------

def execute_spaceclaim_script(script, script_name="sg_macro.py"):
    """
    Save the script to the SpaceClaim Macros folder, then execute it using
    the best available method:
      1. SpaceClaim COM API  (best – fully silent, no UI interaction)
      2. pywinauto click-only navigation  (no keyboard shortcuts)
      3. Launch SpaceClaim.exe /RunScript=  (if not already running)
    Returns a JSON-serialisable dict with keys: success, message, method, scriptPath
    """
    # ---- Save script to a stable path SpaceClaim can access ----
    macro_dir = os.path.join(
        os.environ.get("APPDATA", tempfile.gettempdir()),
        "SpaceClaim", "Macros"
    )
    os.makedirs(macro_dir, exist_ok=True)
    macro_path = os.path.join(macro_dir, script_name)
    with open(macro_path, "w", encoding="utf-8") as f:
        f.write(script)

    print(f"[Bridge] Script saved → {macro_path}")

    # ---- Detect SpaceClaim state ----
    sc_hwnd = _find_sc_hwnd()
    sc_exe  = _find_sc_exe()
    is_running = sc_hwnd is not None

    print(f"[Bridge] SpaceClaim running={is_running}  exe={sc_exe}")

    if is_running:
        # --- Method 1: COM API ---
        print("[Bridge] Trying Method 1: COM API ...")
        ok, msg = _execute_via_com(macro_path)
        if ok:
            print(f"[Bridge] COM success: {msg}")
            return {
                "success": True,
                "message": "✅ Script executed in SpaceClaim via COM API — model created.",
                "method": "com_api",
                "scriptPath": macro_path,
            }
        print(f"[Bridge] COM failed: {msg}")

        # --- Method 2: UI click navigation (no keyboard shortcuts) ---
        print("[Bridge] Trying Method 2: UI click navigation ...")
        ok, msg = _execute_via_ui_clicks(sc_hwnd, macro_path)
        if ok:
            print(f"[Bridge] UI click success: {msg}")
            return {
                "success": True,
                "message": "✅ Script executed in SpaceClaim via File → Scripting → Run Script.",
                "method": "ui_clicks",
                "scriptPath": macro_path,
            }
        print(f"[Bridge] UI click failed: {msg}")

        # Both automation methods failed — return instructions
        return {
            "success": False,
            "message": (
                f"Script saved to:\n{macro_path}\n\n"
                "SpaceClaim is running but automation could not execute the script.\n"
                "Please manually: File → Scripting → Run Script → select the path above."
            ),
            "method": "manual_required",
            "scriptPath": macro_path,
            "automationError": msg,
        }

    else:
        # SpaceClaim is NOT running — launch it with the script
        if sc_exe:
            print("[Bridge] Trying Method 3: Launch SpaceClaim with /RunScript ...")
            ok, msg = _launch_sc_with_script(sc_exe, macro_path)
            if ok:
                return {
                    "success": True,
                    "message": msg,
                    "method": "launch_with_script",
                    "scriptPath": macro_path,
                }
            return {
                "success": False,
                "message": msg,
                "method": "launch_failed",
                "scriptPath": macro_path,
            }

        # SpaceClaim not found anywhere
        return {
            "success": False,
            "message": (
                "SpaceClaim is not running and could not be found on this system.\n\n"
                f"Script has been saved to:\n{macro_path}\n\n"
                "Steps to run manually:\n"
                "  1. Open SpaceClaim\n"
                "  2. File → Scripting → Run Script\n"
                "  3. Browse to the path above and click Open"
            ),
            "method": "not_found",
            "scriptPath": macro_path,
        }


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
        elif parsed.path == "/health": self.send_json({"status":"ok","bridge":"SpaceGeo CAD Bridge v3.0","psutil":HAS_PSUTIL})
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
            # Run synchronously so the response reflects actual execution result
            result = execute_spaceclaim_script(script, script_name)
            self.send_json(result)
        else: self.send_json({"error":"Unknown endpoint"},404)

def main():
    port = 7800
    print("="*60)
    print("  SpaceGeo AI - Local CAD Bridge Server v3.0")
    print("="*60)
    print(f"  Listening on: http://localhost:{port}")
    print(f"  psutil available: {HAS_PSUTIL}")
    print()
    print("  Execution methods (in priority order):")
    print("    1. SpaceClaim COM API       (silent, no UI interaction)")
    print("    2. pywinauto click-only     (no keyboard shortcuts)")
    print("    3. Launch with /RunScript=  (if SpaceClaim not open)")
    print()
    print("  GET  /health  /status?software=  /all  /installed")
    print("  GET  /context?software=solidworks")
    print("  POST /execute       { software, script }")
    print("  POST /spaceclaim    { script, scriptName }")
    print()
    print("  Press Ctrl+C to stop")
    print("="*60)
    class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
        daemon_threads = True
    server = ThreadingHTTPServer(("localhost", port), BridgeHandler)
    try: server.serve_forever()
    except KeyboardInterrupt: print("\n  Bridge stopped."); server.server_close()


if __name__ == "__main__": main()
