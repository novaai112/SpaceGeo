# SpaceGeo AI — Local CAD Bridge Setup

## What is this?

The **bridge server** lets SpaceGeo AI detect your running CAD software (SolidWorks, CATIA, Inventor, etc.) by scanning Windows processes on your local PC.

## Setup (One-Time)

### Option A — Double-Click (Easiest)
1. Double-click **`START_BRIDGE.bat`**
2. A console window opens — keep it running while using SpaceGeo AI

### Option B — Manual Python
```bash
pip install psutil
python bridge_server.py
```

## How It Works

The bridge server:
- Scans running Windows processes for CAD software executables
- Checks registry for installed versions
- Exposes HTTP API at `http://localhost:7800`
- SpaceGeo AI web app connects to it automatically

## Supported CAD Software

| Software | Process Detected |
|---|---|
| SolidWorks | `SLDWORKS.exe` |
| SpaceClaim | `SpaceClaim.exe` |
| Autodesk Inventor | `Inventor.exe` |
| CATIA | `CNEXT.exe` |
| Fusion 360 | `Fusion360.exe` |
| PTC Creo | `xtop.exe` |
| Siemens NX | `ugraf.exe` |
| Onshape | Cloud — always connected |
| Solid Edge | `Edge.exe` |

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /health` | Check bridge is running |
| `GET /status?software=solidworks` | Check specific CAD |
| `GET /all` | Check all CAD software |
| `GET /installed` | List installed versions |
| `POST /execute` | Run a CAD script |

## Troubleshooting

- **"Bridge not running"** — Start `START_BRIDGE.bat` first
- **CAD shown as offline even when open** — Make sure the CAD executable name matches above
- **Permission error** — Run as Administrator
