export interface CADSoftware {
  id: string
  name: string
  displayName: string
  icon: string
  color: string
  description: string
  processNames: string[]
  comProgId?: string // Windows COM ProgID for direct connection
  apiType: "com" | "rest" | "plugin" | "none"
  connectionMethod: string
  scriptLanguage: string
  fileExtensions: string[]
  macroTemplate: string
}

export const CAD_SOFTWARE_LIST: CADSoftware[] = [
  {
    id: "solidworks",
    name: "SolidWorks",
    displayName: "SolidWorks",
    icon: "SW",
    color: "#C00000",
    description: "Dassault Systèmes SolidWorks",
    processNames: ["SLDWORKS", "sldworks"],
    comProgId: "SldWorks.Application",
    apiType: "com",
    connectionMethod: "Windows COM API (win32com)",
    scriptLanguage: "python",
    fileExtensions: [".SLDPRT", ".SLDASM", ".SLDDRW"],
    macroTemplate: `import win32com.client
import pythoncom
import time, subprocess, os

def create_model():
    pythoncom.CoInitialize()
    try:
        swApp = win32com.client.GetActiveObject("SldWorks.Application")
        print("✅ Connected to running SolidWorks")
    except:
        print("🚀 Launching SolidWorks...")
        for path in [
            r"C:\\Program Files\\SOLIDWORKS Corp\\SOLIDWORKS\\SLDWORKS.EXE",
            r"C:\\Program Files\\SOLIDWORKS Corp\\SOLIDWORKS 2024\\SLDWORKS.EXE",
            r"C:\\Program Files\\SOLIDWORKS Corp\\SOLIDWORKS 2023\\SLDWORKS.EXE",
        ]:
            if os.path.exists(path):
                subprocess.Popen(path)
                break
        time.sleep(10)
        swApp = win32com.client.Dispatch("SldWorks.Application")
    
    swApp.Visible = True
    template = swApp.GetUserPreferenceStringValue(9)
    swDoc = swApp.NewDocument(template, 0, 0, 0)
    swModel = swDoc
    
    # === YOUR CODE HERE ===
    
    swModel.ClearSelection2(True)
    errors, warnings = 0, 0
    swModel.Save3(1, errors, warnings)
    print("✅ Model created!")
    pythoncom.CoUninitialize()

create_model()`,
  },
  {
    id: "spaceclaim",
    name: "SpaceClaim",
    displayName: "SpaceClaim",
    icon: "SC",
    color: "#0078D7",
    description: "Ansys SpaceClaim Direct Modeler",
    processNames: ["SpaceClaim", "spaceclaim"],
    comProgId: "SpaceClaim.Application",
    apiType: "com",
    connectionMethod: "SpaceClaim Scripting API (IronPython)",
    scriptLanguage: "python",
    fileExtensions: [".scdoc", ".scdocx"],
    macroTemplate: `# SpaceClaim Script (run inside SpaceClaim > Script Editor)
# Uses SpaceClaim's built-in IronPython scripting

import SpaceClaim.Api.V19 as sc
from SpaceClaim.Api.V19.Geometry import *

def create_model():
    # Get the main window
    Window.ActiveWindow.Document
    selection = sc.Selection.Empty()
    
    # === YOUR CODE HERE ===
    # Example: Create a box
    # body = ShapeHelper.MakeBox(Point.Create(0,0,0), Point.Create(0.1, 0.05, 0.02))
    
    print("SpaceClaim model created!")

create_model()`,
  },
  {
    id: "inventor",
    name: "Inventor",
    displayName: "Autodesk Inventor",
    icon: "IN",
    color: "#FF6D00",
    description: "Autodesk Inventor Professional",
    processNames: ["Inventor", "inventor"],
    comProgId: "Inventor.Application",
    apiType: "com",
    connectionMethod: "Inventor COM API (win32com)",
    scriptLanguage: "python",
    fileExtensions: [".ipt", ".iam", ".idw", ".ipn"],
    macroTemplate: `import win32com.client
import pythoncom
import subprocess, time, os

def create_inventor_model():
    pythoncom.CoInitialize()
    try:
        invApp = win32com.client.GetActiveObject("Inventor.Application")
        print("✅ Connected to running Inventor")
    except:
        print("🚀 Launching Autodesk Inventor...")
        paths = [
            r"C:\\Program Files\\Autodesk\\Inventor 2024\\Bin\\Inventor.exe",
            r"C:\\Program Files\\Autodesk\\Inventor 2023\\Bin\\Inventor.exe",
        ]
        for path in paths:
            if os.path.exists(path):
                subprocess.Popen(path)
                break
        time.sleep(15)
        invApp = win32com.client.Dispatch("Inventor.Application")
    
    invApp.Visible = True
    
    # Create new Part document
    partDoc = invApp.Documents.Add(
        win32com.client.constants.kPartDocumentObject,
        invApp.FileManager.GetTemplateFile(
            win32com.client.constants.kPartDocumentObject
        )
    )
    compDef = partDoc.ComponentDefinition
    
    # === YOUR CODE HERE ===
    
    partDoc.Save()
    print("✅ Inventor model created!")
    pythoncom.CoUninitialize()

create_inventor_model()`,
  },
  {
    id: "catia",
    name: "CATIA",
    displayName: "CATIA V5/V6",
    icon: "CA",
    color: "#003B8E",
    description: "Dassault Systèmes CATIA",
    processNames: ["CATIA", "catia", "CNEXT"],
    comProgId: "CATIA.Application",
    apiType: "com",
    connectionMethod: "CATIA COM Automation (win32com/VBA)",
    scriptLanguage: "python",
    fileExtensions: [".CATPart", ".CATProduct", ".CATDrawing"],
    macroTemplate: `import win32com.client
import pythoncom
import subprocess, time, os

def create_catia_model():
    pythoncom.CoInitialize()
    try:
        catia = win32com.client.GetActiveObject("CATIA.Application")
        print("✅ Connected to running CATIA")
    except:
        print("🚀 Launching CATIA...")
        catia = win32com.client.Dispatch("CATIA.Application")
        catia.Visible = True
        time.sleep(10)
    
    catia.Visible = True
    
    # Create new Part document
    documents = catia.Documents
    partDoc = documents.Add("Part")
    part = partDoc.Part
    
    # Access sketch workbench
    bodies = part.Bodies
    body = bodies.Item(1)
    sketches = body.Sketches
    
    # Reference planes
    xyPlane = part.OriginElements.PlaneXY
    
    # === YOUR CODE HERE ===
    
    part.Update()
    partDoc.Save()
    print("✅ CATIA model created!")
    pythoncom.CoUninitialize()

create_catia_model()`,
  },
  {
    id: "fusion360",
    name: "Fusion360",
    displayName: "Fusion 360",
    icon: "F3",
    color: "#F6821F",
    description: "Autodesk Fusion 360",
    processNames: ["Fusion360", "fusion360", "Fusion"],
    comProgId: null,
    apiType: "plugin",
    connectionMethod: "Fusion 360 API (Add-In)",
    scriptLanguage: "python",
    fileExtensions: [".f3d", ".f3z"],
    macroTemplate: `# Fusion 360 Script - Run via Tools > Scripts and Add-Ins
import adsk.core, adsk.fusion, adsk.cam, traceback

def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface
        design = app.activeProduct
        
        if not isinstance(design, adsk.fusion.Design):
            ui.messageBox("No active Fusion 360 design!")
            return
        
        rootComp = design.rootComponent
        sketches = rootComp.sketches
        
        # Get XY plane
        xyPlane = rootComp.xYConstructionPlane
        sketch = sketches.add(xyPlane)
        
        # === YOUR CODE HERE ===
        
        ui.messageBox("✅ Model created successfully!")
        
    except Exception:
        if ui:
            ui.messageBox('Failed:\\n{}'.format(traceback.format_exc()))`,
  },
  {
    id: "creo",
    name: "Creo",
    displayName: "PTC Creo",
    icon: "CR",
    color: "#00843D",
    description: "PTC Creo Parametric",
    processNames: ["xtop", "creo", "Creo"],
    comProgId: null,
    apiType: "rest",
    connectionMethod: "Creo REST API (Creo toolkit)",
    scriptLanguage: "python",
    fileExtensions: [".prt", ".asm", ".drw"],
    macroTemplate: `# PTC Creo Script via Creo REST API
import requests
import json

CREO_REST_BASE = "http://localhost:9056/creoson"

def check_creo_connection():
    """Check if Creo REST server is running"""
    try:
        response = requests.post(f"{CREO_REST_BASE}/connect", 
                                json={"sessionId": ""}, timeout=5)
        data = response.json()
        return data.get("sessionId")
    except:
        return None

def create_creo_model():
    session_id = check_creo_connection()
    if not session_id:
        print("❌ Creo REST API not available. Start Creo with REST server enabled.")
        print("   Run: creoson_server.bat")
        return
    
    headers = {"Content-Type": "application/json"}
    
    # === YOUR CODE HERE ===
    # Example: Create a file
    payload = {
        "sessionId": session_id,
        "command": "file",
        "function": "open",
        "data": {"dirname": ".", "filename": "new_part.prt"}
    }
    response = requests.post(CREO_REST_BASE, json=payload, headers=headers)
    print("✅ Creo model created:", response.json())

create_creo_model()`,
  },
  {
    id: "nx",
    name: "NX",
    displayName: "Siemens NX",
    icon: "NX",
    color: "#00629B",
    description: "Siemens NX (Unigraphics)",
    processNames: ["ugraf", "NX", "nx"],
    comProgId: null,
    apiType: "plugin",
    connectionMethod: "NX Open API (Python/C++/VB)",
    scriptLanguage: "python",
    fileExtensions: [".prt"],
    macroTemplate: `# Siemens NX Open Python Script
# Run via: File > Execute > NX Open Python

import NXOpen
import NXOpen.Features
import NXOpen.GeometricUtilities

def create_nx_model():
    theSession = NXOpen.Session.GetSession()
    workPart = theSession.Parts.Work
    displayPart = theSession.Parts.Display
    
    # Start modeling
    markId1 = theSession.SetUndoMark(
        NXOpen.Session.MarkVisibility.Invisible, "Start"
    )
    
    # === YOUR CODE HERE ===
    # Example: Create body
    # builder = workPart.Features.CreateBlockFeatureBuilder(NXOpen.Features.Block.Null)
    # builder.BooleanOption.Type = NXOpen.GeometricUtilities.BooleanOperation.BooleanType.Create
    
    theSession.SetUndoMarkName(markId1, "SpaceGeo AI Model")
    print("✅ NX model created!")

create_nx_model()`,
  },
  {
    id: "onshape",
    name: "Onshape",
    displayName: "Onshape",
    icon: "OS",
    color: "#FF5722",
    description: "PTC Onshape (Cloud CAD)",
    processNames: [],
    comProgId: null,
    apiType: "rest",
    connectionMethod: "Onshape REST API",
    scriptLanguage: "python",
    fileExtensions: [".onshape"],
    macroTemplate: `# Onshape REST API Script
import requests
import json
import base64
import hashlib
import hmac
import datetime

# Get from: https://dev-portal.onshape.com/keys
ONSHAPE_ACCESS_KEY = "YOUR_ACCESS_KEY"
ONSHAPE_SECRET_KEY = "YOUR_SECRET_KEY"
BASE_URL = "https://cad.onshape.com"

def make_onshape_request(method, endpoint, body=None):
    """Make authenticated Onshape API request"""
    date = datetime.datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
    nonce = base64.b64encode(hashlib.sha256(date.encode()).digest()).decode()
    
    content_type = "application/json" if body else ""
    string_to_sign = f"{method}\\n{nonce}\\n{date}\\n{content_type}\\n{endpoint}\\n"
    signature = base64.b64encode(
        hmac.new(ONSHAPE_SECRET_KEY.encode(), string_to_sign.encode(), hashlib.sha256).digest()
    ).decode()
    
    headers = {
        "Date": date, "On-Nonce": nonce,
        "Authorization": f"On {ONSHAPE_ACCESS_KEY}:{signature}",
        "Content-Type": content_type
    }
    
    url = f"{BASE_URL}{endpoint}"
    if body:
        return requests.request(method, url, headers=headers, json=body)
    return requests.request(method, url, headers=headers)

def create_onshape_model():
    # Create a new document
    body = {"name": "SpaceGeo AI Model", "ownerType": 0, "isPublic": False}
    response = make_onshape_request("POST", "/api/documents", body)
    doc = response.json()
    
    print(f"✅ Onshape document created: {doc.get('name')}")
    print(f"   URL: https://cad.onshape.com/documents/{doc.get('id')}")
    
    # === YOUR CODE HERE ===

create_onshape_model()`,
  },
  {
    id: "solidedge",
    name: "SolidEdge",
    displayName: "Solid Edge",
    icon: "SE",
    color: "#0099CC",
    description: "Siemens Solid Edge",
    processNames: ["Edge", "SolidEdge", "solidedge"],
    comProgId: "SolidEdge.Application",
    apiType: "com",
    connectionMethod: "Solid Edge COM API (win32com)",
    scriptLanguage: "python",
    fileExtensions: [".par", ".psm", ".asm", ".dft"],
    macroTemplate: `import win32com.client
import pythoncom
import subprocess, time, os

def create_solidedge_model():
    pythoncom.CoInitialize()
    try:
        seApp = win32com.client.GetActiveObject("SolidEdge.Application")
        print("✅ Connected to running Solid Edge")
    except:
        print("🚀 Launching Solid Edge...")
        paths = [
            r"C:\\Program Files\\Siemens\\Solid Edge 2024\\Program\\Edge.exe",
            r"C:\\Program Files\\Siemens\\Solid Edge ST10\\Program\\Edge.exe",
        ]
        for path in paths:
            if os.path.exists(path):
                subprocess.Popen(path)
                break
        time.sleep(12)
        seApp = win32com.client.Dispatch("SolidEdge.Application")
    
    seApp.Visible = True
    
    # Create new Part document
    docs = seApp.Documents
    partDoc = docs.Add("SolidEdge.PartDocument")
    model = partDoc.Model
    
    # === YOUR CODE HERE ===
    
    partDoc.Save()
    print("✅ Solid Edge model created!")
    pythoncom.CoUninitialize()

create_solidedge_model()`,
  },
]

export function getCADSoftware(id: string): CADSoftware | undefined {
  return CAD_SOFTWARE_LIST.find((s) => s.id === id)
}

export function getSystemPrompt(softwareId: string, cadContext?: Record<string, unknown>): string {
  const sw = getCADSoftware(softwareId) || CAD_SOFTWARE_LIST[0]

  let contextBlock = ""
  if (cadContext && cadContext.running) {
    const lines: string[] = []
    if (cadContext.active_doc) lines.push(`- Active Document: ${cadContext.active_doc} (${cadContext.doc_type || "Unknown"})`)
    if (cadContext.doc_path) lines.push(`- File Path: ${cadContext.doc_path}`)
    if (cadContext.active_config) lines.push(`- Active Configuration: ${cadContext.active_config}`)
    if (cadContext.units) lines.push(`- Units: ${cadContext.units}`)
    if (cadContext.material) lines.push(`- Material: ${cadContext.material}`)
    if (Array.isArray(cadContext.open_documents) && (cadContext.open_documents as string[]).length > 0) {
      lines.push(`- Open Documents: ${(cadContext.open_documents as string[]).join(", ")}`)
    }
    if (Array.isArray(cadContext.configurations) && (cadContext.configurations as string[]).length > 0) {
      lines.push(`- Configurations: ${(cadContext.configurations as string[]).join(", ")}`)
    }
    if (Array.isArray(cadContext.features) && (cadContext.features as unknown[]).length > 0) {
      const featList = (cadContext.features as Array<{name: string; type: string}>).slice(0, 20).map(f => `${f.name}(${f.type})`).join(", ")
      lines.push(`- Existing Features: ${featList}`)
    }
    if (Array.isArray(cadContext.bodies) && (cadContext.bodies as string[]).length > 0) {
      lines.push(`- Solid Bodies: ${(cadContext.bodies as string[]).join(", ")}`)
    }
    if (Array.isArray(cadContext.components) && (cadContext.components as string[]).length > 0) {
      lines.push(`- Assembly Components: ${(cadContext.components as string[]).join(", ")}`)
    }
    if (Array.isArray(cadContext.selection) && (cadContext.selection as unknown[]).length > 0) {
      lines.push(`- Selected Objects: ${(cadContext.selection as unknown[]).length} object(s) currently selected`)
    }
    if (lines.length > 0) {
      contextBlock = `\n\n## LIVE ${sw.displayName} STATE (currently open on user machine):\n${lines.join("\n")}\n\nIMPORTANT: Use this live context. Connect to this EXACT open document. Respect the existing features, units, and configuration. Do not create a new document unless the user explicitly asks.`
    }
  } else if (cadContext && !cadContext.running) {
    contextBlock = `\n\n## ${sw.displayName} STATE: Not currently running. Your code MUST launch it automatically.`
  }

  return `You are SpaceGeo AI — an elite ${sw.displayName} automation engineer. You write production-quality Python scripts that run immediately and produce correct 3D geometry.
${contextBlock}

## ABSOLUTE CODE RULES — NEVER BREAK THESE:
1. Write COMPLETE, FULLY RUNNABLE Python code — every line, no truncation, no "add rest here"
2. ZERO comments in code — no # comments, no docstrings, nothing — ONLY executable code
3. ZERO placeholder values — use real numbers, real paths, real API calls
4. Code MUST connect to ${sw.displayName} via COM (win32com.client.GetActiveObject) or launch it automatically
5. Code MUST actually create/modify geometry — not just print success messages
6. If image provided: analyze exact dimensions/geometry and generate code matching that shape precisely
7. Never refuse — always generate working code

## When ${sw.displayName} is running with an open document:
- Use GetActiveObject("SldWorks.Application") and swApp.ActiveDoc
- Work on the EXISTING document unless user says to create new
- Respect current units from context

## When ${sw.displayName} is NOT running:
- Launch it: subprocess.Popen(path); time.sleep(12); swApp = win32com.client.Dispatch("SldWorks.Application")

## After every code block: Write 1 sentence describing what the script creates.

## For errors/regeneration: Write ONLY the corrected complete code. No explanations of what was wrong.

## Multi-CAD support: SolidWorks, Inventor, CATIA, Fusion 360, SpaceClaim, Creo, NX, Solid Edge, Onshape`
}
