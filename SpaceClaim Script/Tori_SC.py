import math
SH = SF + S_H
RC = H_ID
H_IR = H_ID / 2
K_O = H_IR - H_KR
ah = H_IR + H_THK
r_out = H_KR + H_THK
L_out = RC + H_THK
H2 = math.sqrt((RC - H_KR)**2 - (K_O)**2)
cc_x = 0.0
ck_x = H_IR - H_KR
ck_y = -RC + H2
def get_profile_points(crown_r, knuckle_r, flange_x):
    vec_x = ck_x - cc_x
    vec_y = ck_y - (-RC)
    dist_centers = math.sqrt(vec_x**2 + vec_y**2)
    scale = crown_r / dist_centers
    pt_x = cc_x + (vec_x * scale)
    pt_y = -RC + (vec_y * scale)
    apex_x = 0.0
    apex_y = -RC + crown_r
    pf_x = flange_x
    pf_y = ck_y
    pend_x = flange_x
    pend_y = pf_y - SF
    return (apex_x, apex_y), (pt_x, pt_y), (pf_x, pf_y), (pend_x, pend_y)
def draw_arc_ccw(center_x, center_y, start_pt, end_pt):
    cent = Point2D.Create(MM(center_x), MM(center_y))
    s = Point2D.Create(MM(start_pt[0]), MM(start_pt[1]))
    e = Point2D.Create(MM(end_pt[0]), MM(end_pt[1]))
    SketchArc.Create(cent, s, e)
def draw_line(p1, p2):
    s = Point2D.Create(MM(p1[0]), MM(p1[1]))
    e = Point2D.Create(MM(p2[0]), MM(p2[1]))
    SketchLine.Create(s, e)
in_apex, in_trans, in_fs, in_fe = get_profile_points(RC, H_KR, H_IR)
out_apex, out_trans, out_fs, out_fe = get_profile_points(L_out, r_out, ah)
shell_in_start = in_fe
shell_in_end = (in_fe[0], in_fe[1] - S_H)
shell_out_start = out_fe
shell_out_end = (in_fe[0] + S_THK, out_fe[1] - S_H)
sectionPlane = Plane.PlaneXY
result = ViewHelper.SetSketchPlane(sectionPlane, None)
draw_arc_ccw(cc_x, -RC, in_trans, in_apex)
draw_arc_ccw(ck_x, ck_y, in_fs, in_trans)
draw_line(in_fs, in_fe)
draw_arc_ccw(cc_x, -RC, out_trans, out_apex)
draw_arc_ccw(ck_x, ck_y, out_fs, out_trans)
draw_line(out_fs, out_fe)
draw_line(shell_in_start, shell_in_end)
draw_line(shell_out_start, shell_out_end)
draw_line(in_apex, out_apex)
draw_line(shell_in_end, shell_out_end)
mode = InteractionMode.Solid
result = ViewHelper.SetViewMode(mode, None)
selection = Selection.Create(GetRootPart().Bodies[0].Faces[0])
axis=Line.Create(Point.Origin, Direction.DirY)
options = RevolveFaceOptions()
options.ExtrudeType = ExtrudeType.Add
result = RevolveFaces.Execute(selection, axis, DEG(360), options)
SH = SF + S_H
RC = H_ID
H_IR = H_ID / 2
K_O = H_IR - H_KR
H2 = (RC - H_KR)**2 - K_O**2
H1 = H2**0.5
H3 = RC - H1
TD = H_THK - S_THK
ah = H_IR + H_THK
sh = H_IR + S_THK
import math
Rd = RC - H_KR
rad = math.acos(K_O / Rd)
deg = rad * 180 / math.pi
N_OR = N_OD / 2
N_IR = N_OR - N_THK
Hub_OR = Hub_OD / 2
if N_TYPE == "Straight":
    sectionPlane = Plane.PlaneXY
    result = ViewHelper.SetSketchPlane(sectionPlane, None)
    point1 = Point2D.Create(MM(N_IR), MM(N_P))
    point2 = Point2D.Create(MM(N_OR), MM(N_P))
    point3 = Point2D.Create(MM(N_OR), MM(N_P * 0.75))
    result = SketchRectangle.Create(point1, point2, point3)
    start = Point2D.Create(MM(0), MM(0))
    end = Point2D.Create(MM(0), MM(N_P))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
    axis=Line.Create(Point.Origin, Direction.DirY)
    options = RevolveFaceOptions()
    options.ExtrudeType = ExtrudeType.Add
    result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    selection = Selection.Create(GetRootPart().Bodies[1].Faces[2])
    upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[0])
    options = ExtrudeFaceOptions()
    result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
    selection = Selection.Create(GetRootPart().Bodies[0])
    toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[10])
    result = SplitBody.ByCutter(selection, toolFaces, True)
    selection = Selection.Create(GetRootPart().Bodies[0])
    result = Delete.Execute(selection)
    selection = Selection.Create(GetRootPart().Curves[0])
    result = DatumPlaneCreator.Create(selection, False, None)
    start = Point.Create(MM(0), MM(0),MM(0))
    end = Point.Create(MM(200), MM(0),MM(0))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    selection = Selection.Create(GetRootPart().Curves[1])
    result = DatumPlaneCreator.Create(selection, False, None)
    if pad == "NO":
        selection = Selection.Create(GetRootPart().CoordinateSystems[0].Axes[2])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[4])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[7])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[5])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = BodySelection.Create(GetRootPart().Bodies[0])
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3]])
        datum = Selection.Create(GetRootPart().DatumPlanes[4])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[6],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[2].Faces[1])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11]])
        datum = Selection.Create(GetRootPart().DatumPlanes[5])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11]])
        datum = Selection.Create(GetRootPart().DatumPlanes[3])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11],
            GetRootPart().Bodies[12],
            GetRootPart().Bodies[13],
            GetRootPart().Bodies[14],
            GetRootPart().Bodies[15],
            GetRootPart().Bodies[16],
            GetRootPart().Bodies[17],
            GetRootPart().Bodies[18],
            GetRootPart().Bodies[19]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Torispherical Straight Nozzle")
    if pad =="YES":
        P_D= 2*P_W + N_OD
        P_OR = P_D/2
        selection = Selection.Create(GetRootPart().Bodies[0].Edges[7])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = Selection.Create(GetRootPart().DatumPlanes[2])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(-(P_THK)), options)
        selection = Selection.Create(GetRootPart().DatumPlanes[2])
        result = ViewHelper.SetSketchPlane(selection, None)
        origin = Point2D.Create(MM(0), MM(0))
        result = SketchCircle.Create(origin, MM(P_OR))
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[7])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[14])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create(GetRootPart().Bodies[0])
        result = Delete.Execute(selection)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[11])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[4])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[5])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = Selection.Create(GetRootPart().CoordinateSystems[0].Axes[2])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = BodySelection.Create(GetRootPart().Bodies[0])
        datum = Selection.Create(GetRootPart().DatumPlanes[6])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3]])
        datum = Selection.Create(GetRootPart().DatumPlanes[4])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[7],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[4]])
        datum = Selection.Create(GetRootPart().DatumPlanes[5])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11]])
        datum = Selection.Create(GetRootPart().DatumPlanes[3])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[12],
            GetRootPart().Bodies[13],
            GetRootPart().Bodies[14],
            GetRootPart().Bodies[15]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[8].Faces[0])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[11],
            GetRootPart().Bodies[10]])
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[20],
            GetRootPart().Bodies[23],
            GetRootPart().Bodies[21],
            GetRootPart().Bodies[22]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[8].Faces[0])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11],
            GetRootPart().Bodies[12],
            GetRootPart().Bodies[13],
            GetRootPart().Bodies[14],
            GetRootPart().Bodies[15],
            GetRootPart().Bodies[16],
            GetRootPart().Bodies[17],
            GetRootPart().Bodies[18],
            GetRootPart().Bodies[19],
            GetRootPart().Bodies[20],
            GetRootPart().Bodies[21],
            GetRootPart().Bodies[22],
            GetRootPart().Bodies[23],
            GetRootPart().Bodies[24],
            GetRootPart().Bodies[25],
            GetRootPart().Bodies[26],
            GetRootPart().Bodies[27]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"torispherical Straight Nozzle with Pad")
    comp = GetRootPart().Components[0]
    comp.Content.ShareTopology =comp.Content.ShareTopology.Share
elif N_TYPE == "Radial":
    y = N_P**2 - N_OFF**2
    y1 = y**0.5
    if N_OFF != 0:
        theta = math.atan(y1 / N_OFF)
        beta = theta * 180 / math.pi
        deg = 90 - beta
    else:
        deg = 0
    selection = Selection.Create(GetRootPart().DatumPlanes[1])
    result = ViewHelper.SetSketchPlane(selection, None)
    point1 = Point2D.Create(MM(N_IR), MM(N_P))
    point2 = Point2D.Create(MM(N_OR), MM(N_P))
    point3 = Point2D.Create(MM(N_OR), MM(N_P * 0.75))
    result = SketchRectangle.Create(point1, point2, point3)
    start = Point2D.Create(MM(0), MM(0))
    end = Point2D.Create(MM(0), MM(N_P))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    ViewHelper.SetSketchPlane(Plane.PlaneXY)
    selection = Selection.Create(GetRootPart().DatumPlanes[1].GetChildren[DatumPoint]()[0])
    hingePoint = Move.GetAnchorPoint2D(selection)
    options = MoveOptions()
    result = Move.Rotate2D(selection, hingePoint, DEG(-deg), options)
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    selection = Selection.Create(GetRootPart().Bodies[4].Faces[0])
    axisSelection = Selection.Create(GetRootPart().Curves[0])
    axis = RevolveFaces.GetAxisFromSelection(selection, axisSelection)
    options = RevolveFaceOptions()
    options.ExtrudeType = ExtrudeType.ForceIndependent
    result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    selection = Selection.Create(GetRootPart().Bodies[4].Faces[1])
    upToSelection = Selection.Create(GetRootPart().Bodies[3].Faces[4])
    options = ExtrudeFaceOptions()
    options.ExtrudeType = ExtrudeType.ForceIndependent
    result = ExtrudeFaces.UpTo(selection, Direction.Create(-0.3, -0.9539, 0), upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
    selection = Selection.Create(GetRootPart().Bodies)
    toolFaces = Selection.Create(GetRootPart().Bodies[4].Faces[0])
    result = SplitBody.ByCutter(selection, toolFaces, True)
    selection = Selection.Create(GetRootPart().Bodies)
    toolFaces = Selection.Create(GetRootPart().Bodies[4].Faces[2])
    result = SplitBody.ByCutter(selection, toolFaces, True)
    selection = Selection.Create([GetRootPart().Bodies[5], GetRootPart().Bodies[6]])
    result = Delete.Execute(selection)
    selection = Selection.Create(GetRootPart().Bodies[4].Faces[3])
    result = ViewHelper.SetSketchPlane(selection, None)
    P_OD = N_OD + 20
    origin = Point2D.Create(MM(0), MM(0))
    result = SketchCircle.Create(origin, MM(P_OD / 2))
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    selection = Selection.Create(GetRootPart().Bodies[7].Faces[1])
    options = ExtrudeFaceOptions()
    options.ExtrudeType = ExtrudeType.ForceIndependent
    result = ExtrudeFaces.Execute(selection, MM(10), options)
    selection = Selection.Create(GetRootPart().Bodies)
    toolFaces = Selection.Create(GetRootPart().Bodies[8].Faces[3])
    result = SplitBody.ByCutter(selection, toolFaces, True)
    selection = Selection.Create([GetRootPart().Bodies[10], GetRootPart().Bodies[8], GetRootPart().Bodies[7], GetRootPart().Bodies[3]])
    result = Delete.Execute(selection)
    selection = Selection.Create(GetRootPart().DatumPlanes[0])
    direction = Move.GetDirection(selection)
    options = MoveOptions()
    result = Move.Translate(selection, direction, MM(-SF), options)
    selection = Selection.Create(GetRootPart().Bodies)
    datum = Selection.Create(GetRootPart().DatumPlanes[0])
    result = SplitBody.ByCutter(selection, datum)
    y1 = 3 * TD
    selection = Selection.Create(GetRootPart().DatumPlanes[0])
    direction = Move.GetDirection(selection)
    options = MoveOptions()
    result = Move.Translate(selection, direction, MM(y1), options)
    for i in range(0, 3, 1):
        selection = Selection.Create(GetRootPart().Bodies)
        datum = Selection.Create(GetRootPart().DatumPlanes[i])
        result = SplitBody.ByCutter(selection, datum)
elif N_TYPE == "Barrel":
    H4 = H3 + H_THK + 10
    sectionPlane = Plane.PlaneXY
    result = ViewHelper.SetSketchPlane(sectionPlane, None)
    start = Point2D.Create(MM(N_IR), MM(N_P))
    end = Point2D.Create(MM(N_OR), MM(N_P))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_IR), MM(N_P))
    end = Point2D.Create(MM(N_IR), MM(H4 + (Hub_LEN / 2)))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_IR), MM(H4 + (Hub_LEN / 2)))
    end = Point2D.Create(MM(Hub_OR), MM(H4 + (Hub_LEN / 2)))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(Hub_OR), MM(H4 + (Hub_LEN / 2)))
    end = Point2D.Create(MM(Hub_OR), MM(H4 + Hub_LEN))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_OR), MM(N_P))
    end = Point2D.Create(MM(N_OR), MM(H4 + Hub_LEN + T_LEN))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_OR), MM(H4 + Hub_LEN + T_LEN))
    end = Point2D.Create(MM(Hub_OR), MM(H4 + Hub_LEN))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(0), MM(0))
    end = Point2D.Create(MM(0), MM(N_P))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
    axis=Line.Create(Point.Origin, Direction.DirY)
    options = RevolveFaceOptions()
    options.ExtrudeType = ExtrudeType.Add
    result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    selection = Selection.Create(GetRootPart().Bodies[1].Faces[2])
    upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[7])
    options = ExtrudeFaceOptions()
    result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
    selection = Selection.Create(GetRootPart().Bodies[0])
    toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[8])
    result = SplitBody.ByCutter(selection, toolFaces, True)
    selection = Selection.Create(GetRootPart().Bodies[0])
    result = Delete.Execute(selection)
    selection = Selection.Create(GetRootPart().Curves[0])
    result = DatumPlaneCreator.Create(selection, False, None)
    start = Point.Create(MM(0), MM(0),MM(0))
    end = Point.Create(MM(200), MM(0),MM(0))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    selection = Selection.Create(GetRootPart().Curves[1])
    result = DatumPlaneCreator.Create(selection, False, None)
    if pad == "NO":
        selection = Selection.Create(GetRootPart().CoordinateSystems[0].Axes[2])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[11])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[9])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[10])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[4])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[5])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = BodySelection.Create(GetRootPart().Bodies[0])
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[0]])
        datum = Selection.Create(GetRootPart().DatumPlanes[3])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[1],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[2]])
        datum = Selection.Create(GetRootPart().DatumPlanes[4])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[9],
            GetRootPart().Bodies[8],
            GetRootPart().Bodies[11],
            GetRootPart().Bodies[10]])
        datum = Selection.Create(GetRootPart().DatumPlanes[5])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[6],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[7]])
        datum = Selection.Create(GetRootPart().DatumPlanes[7])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[7]])
        datum = Selection.Create(GetRootPart().DatumPlanes[6])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[17],
            GetRootPart().Bodies[16],
            GetRootPart().Bodies[19],
            GetRootPart().Bodies[18]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[3].Faces[0])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11],
            GetRootPart().Bodies[12],
            GetRootPart().Bodies[13],
            GetRootPart().Bodies[14],
            GetRootPart().Bodies[15],
            GetRootPart().Bodies[16],
            GetRootPart().Bodies[17],
            GetRootPart().Bodies[18],
            GetRootPart().Bodies[19],
            GetRootPart().Bodies[20],
            GetRootPart().Bodies[21],
            GetRootPart().Bodies[22],
            GetRootPart().Bodies[23],
            GetRootPart().Bodies[24],
            GetRootPart().Bodies[25],
            GetRootPart().Bodies[26],
            GetRootPart().Bodies[27]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Torispherical Barrel Nozzle")
    else:
        P_D= 2*P_W + N_OD
        P_OR = P_D/2
        selection = Selection.Create(GetRootPart().Bodies[0].Edges[11])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = Selection.Create(GetRootPart().DatumPlanes[2])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(-(P_THK)), options)
        selection = Selection.Create(GetRootPart().DatumPlanes[2])
        result = ViewHelper.SetSketchPlane(selection, None)
        origin = Point2D.Create(MM(0), MM(0))
        result = SketchCircle.Create(origin, MM((P_OR)))
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[11])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[16])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create(GetRootPart().Bodies[0])
        result = Delete.Execute(selection)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[12])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        plane = Selection.Create(GetRootPart().Bodies[1].Edges[6])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2]])
        plane = Selection.Create(GetRootPart().Bodies[1].Edges[5])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3]])
        plane = Selection.Create(GetRootPart().Bodies[1].Edges[2])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4]])
        plane = Selection.Create(GetRootPart().Bodies[0].Edges[5])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5]])
        plane = Selection.Create(GetRootPart().Bodies[5].Edges[2])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6]])
        plane = Selection.Create(GetRootPart().Bodies[6].Edges[3])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11],
            GetRootPart().Bodies[12],
            GetRootPart().Bodies[13],
            GetRootPart().Bodies[14],
            GetRootPart().Bodies[15]])
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[24],
            GetRootPart().Bodies[8],
            GetRootPart().Bodies[16],
            GetRootPart().Bodies[0]])
        toolFaces = Selection.Create(GetRootPart().Bodies[13].Faces[5])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create(GetRootPart().Bodies[2].Edges[10])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = Selection.Create([GetRootPart().Bodies[8],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[16],
            GetRootPart().Bodies[24]])
        datum = Selection.Create(GetRootPart().DatumPlanes[3])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11],
            GetRootPart().Bodies[12],
            GetRootPart().Bodies[13],
            GetRootPart().Bodies[14],
            GetRootPart().Bodies[15],
            GetRootPart().Bodies[16],
            GetRootPart().Bodies[17],
            GetRootPart().Bodies[18],
            GetRootPart().Bodies[19],
            GetRootPart().Bodies[20],
            GetRootPart().Bodies[21],
            GetRootPart().Bodies[22],
            GetRootPart().Bodies[23],
            GetRootPart().Bodies[24],
            GetRootPart().Bodies[25],
            GetRootPart().Bodies[26],
            GetRootPart().Bodies[27],
            GetRootPart().Bodies[28],
            GetRootPart().Bodies[29],
            GetRootPart().Bodies[30],
            GetRootPart().Bodies[31],
            GetRootPart().Bodies[32],
            GetRootPart().Bodies[33],
            GetRootPart().Bodies[34],
            GetRootPart().Bodies[35],
            GetRootPart().Bodies[36],
            GetRootPart().Bodies[37],
            GetRootPart().Bodies[38],
            GetRootPart().Bodies[39]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Torosherical Barrel Nozzle With Pad")
    comp = GetRootPart().Components[0]
    comp.Content.ShareTopology =comp.Content.ShareTopology.Share