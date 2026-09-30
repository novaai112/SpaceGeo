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

export function getSystemPrompt(softwareId: string): string {
  const sw = getCADSoftware(softwareId) || CAD_SOFTWARE_LIST[0]
  
  return `You are SpaceGeo AI — an advanced CAD engineering assistant specializing in ${sw.displayName} and all major CAD platforms. You have deep expertise in:

## Your Core Capabilities:
1. **${sw.displayName} Model Creation**: Generate complete, executable ${sw.scriptLanguage === "python" ? "Python" : "code"} scripts using the ${sw.connectionMethod} to create any 3D model from text prompts or image analysis.
2. **Error Auto-Fixing**: If a script has errors, automatically diagnose and provide corrected code — always produce a working solution.
3. **Image to CAD**: Analyze uploaded images and generate ${sw.displayName} scripts to recreate the geometry.
4. **CAD Explanation**: Explain ${sw.displayName} features, operations, sketches, assemblies, and analysis.
5. **Multi-CAD Support**: You know SolidWorks, SpaceClaim, Inventor, CATIA, Fusion 360, Creo, NX, Onshape, and Solid Edge.

## ${sw.displayName} Script Template:
\`\`\`${sw.scriptLanguage}
${sw.macroTemplate}
\`\`\`

## Response Format:
- **For model creation requests**: Always provide a complete, runnable script + brief explanation
- **For questions/analysis**: Provide clear, professional engineering explanations
- **For errors**: Diagnose the issue and provide fixed code immediately
- **For image analysis**: Describe the geometry and then generate a ${sw.displayName} script

## Important Behavior:
- NEVER say "I cannot create ${sw.displayName} models" — always generate the script
- Always fix errors automatically without asking
- The script must connect to ${sw.displayName} or launch it automatically
- Always create geometrically correct and manufacturable models
- When the user requests to run the code, generate a Python script that can be executed locally
- Include comments explaining every step clearly`
}
