import math
SF = S_OFF
a1 = a / 2
b = a1 / ratio
a2 = a1 + THK
b1 = b + THK
a3 = a1 + S_THK
TD = THK - S_THK
SD = S_H + SF
plane = Plane.PlaneZX
result = DatumPlaneCreator.Create(plane, False, None)
plane = Plane.PlaneXY
result = DatumPlaneCreator.Create(plane, False, None)
plane = Plane.PlaneYZ
result = DatumPlaneCreator.Create(plane, False, None)
sectionPlane = Plane.PlaneXY
result = ViewHelper.SetSketchPlane(sectionPlane, None)
points = []
points2 = []
for t in range(0, 100, 10):
    x1 = a1 * math.cos(math.radians(t))
    y1 = b * math.sin(math.radians(t))
    points.append(Point2D.Create(MM(x1), MM(y1)))
    x2 = a2 * math.cos(math.radians(t))
    y2 = b1 * math.sin(math.radians(t))
    points2.append(Point2D.Create(MM(x2), MM(y2)))
result = SketchNurbs.CreateFrom2DPoints(False, points)
result = SketchNurbs.CreateFrom2DPoints(False, points2)
start = points[-1]
end = points2[-1]
result = SketchLine.Create(start, end)
start = Point2D.Create(MM(a1), MM(0))
end = Point2D.Create(MM(a1), MM(-SF))
result = SketchLine.Create(start, end)
start = Point2D.Create(MM(a1), MM(-SF))
end = Point2D.Create(MM(a1), MM(-SD))
result = SketchLine.Create(start, end)
start = Point2D.Create(MM(a1), MM(-SD))
end = Point2D.Create(MM(a3), MM(-SD))
result = SketchLine.Create(start, end)
start = Point2D.Create(MM(a1), MM(0))
end = Point2D.Create(MM(a2), MM(0))
result = SketchLine.Create(start, end)
y1 = (3 * TD) - SF
am = min(a2, a3)
ar = max(a2, a3)
start = Point2D.Create(MM(am), MM(-SF))
end = Point2D.Create(MM(ar), MM(y1))
result=SketchLine.Create(start,end)
if TD >= 0:
    start = Point2D.Create(MM(ar), MM(y1))
    end = Point2D.Create(MM(ar), MM(0))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(am), MM(-SF))
    end = Point2D.Create(MM(am), MM(-SD))
    result = SketchLine.Create(start, end)
elif TD < 0:
    start = Point2D.Create(MM(ar), MM(y1))
    end = Point2D.Create(MM(ar), MM(-SD))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(am), MM(-SF))
    end = Point2D.Create(MM(am), MM(0))
    result = SketchLine.Create(start, end)
SF = S_OFF
a1 = a / 2
b = a1 / ratio
a2 = a1 + THK
b1 = b + THK
a3 = a1 + S_THK
TD = THK - S_THK
SD = S_H + SF
PTHK = P_THK
ap = a2 + PTHK
bp = b1 + PTHK
N_OR = N_OD / 2
N_IR = N_OR - N_THK
Hub_OR = Hub_OD / 2
if pad == "YES":
    import math
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    if TD < 0:
        selection = Selection.Create([GetRootPart().Bodies[0].Faces[0],GetRootPart().Bodies[0].Faces[1]])
        axis=Line.Create(Point.Origin, Direction.DirY)
        options = RevolveFaceOptions()
        options.ExtrudeType = ExtrudeType.Add
        result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    else:
        selection = Selection.Create([GetRootPart().Bodies[0].Faces[0],GetRootPart().Bodies[0].Faces[1]])
        axis=Line.Create(Point.Origin, Direction.DirY)
        options = RevolveFaceOptions()
        options.ExtrudeType = ExtrudeType.Add
        result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    if N_TYPE == "Straight":
        selection = Selection.Create(GetRootPart().DatumPlanes[1])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(N_OFF), options)
        selection = Selection.Create(GetRootPart().DatumPlanes[1])
        result = ViewHelper.SetSketchPlane(selection, None)
        mode = InteractionMode.Sketch
        result = ViewHelper.SetViewMode(mode, None)
        Nrat = N_OFF / ap
        NPO = 1 - (Nrat**2)
        NPO2 = bp * (NPO**0.5)
        point1 = Point2D.Create(MM(N_IR), MM(N_P))
        point2 = Point2D.Create(MM(N_OR), MM(N_P))
        point3 = Point2D.Create(MM(N_OR), MM(NPO2+100))
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
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[6])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[7])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create(GetRootPart().Bodies[1].Edges[8])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = Selection.Create(GetRootPart().DatumPlanes[3])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(-(P_THK)), options)
        P_OD = 2*P_W + N_OD
        P_OR = P_OD/2
        selection = Selection.Create(GetRootPart().DatumPlanes[3])
        result = ViewHelper.SetSketchPlane(selection, None)
        origin = Point2D.Create(MM(0), MM(0))
        result = SketchCircle.Create(origin, MM(P_OR))
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        selection = Selection.Create(GetRootPart().Bodies[2].Faces[0])
        upToSelection = Selection.Create(GetRootPart().Bodies[1].Faces[8])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies[0].Faces[11])
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[8])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, Direction.DirY, upToSelection, Point.Create(MM(-155.019576338312), MM(166.786346922389), MM(-338.666658381932)), options)
        selection = BodySelection.Create(GetRootPart().Bodies[0])
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = EdgeSelection.Create(GetRootPart().Bodies[2].Edges[34])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[2].Edges[32])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[3].Edges[24])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = BodySelection.Create([GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[0]])
        datum = Selection.Create(GetRootPart().DatumPlanes[4])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7]])
        datum = Selection.Create(GetRootPart().DatumPlanes[5])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11]])
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[12],
            GetRootPart().Bodies[13],
            GetRootPart().Bodies[14],
            GetRootPart().Bodies[15]])
        datum = Selection.Create(GetRootPart().DatumPlanes[6])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[16],
            GetRootPart().Bodies[17],
            GetRootPart().Bodies[18],
            GetRootPart().Bodies[19]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[13].Faces[0])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[12],
            GetRootPart().Bodies[13],
            GetRootPart().Bodies[14],
            GetRootPart().Bodies[15]])
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
        result = RenameObject.Execute(selection,"Ellipsoidal Nozzle with pad")
    elif N_TYPE == "Radial":
        r = N_OFF / N_P
        Nrat = N_OFF / ap
        NPO = 1 - (Nrat**2)
        NPO2 = bp * (NPO**0.5)
        Y = N_P**2 - N_OFF**2
        y1 = Y**0.5
        theta = math.atan(N_OFF / y1)
        beta = theta * 180 / (math.pi)
        deg = beta
        selection = Selection.Create(GetRootPart().DatumPlanes[1])
        result = ViewHelper.SetSketchPlane(selection, None)
        point1 = Point2D.Create(MM(N_IR), MM(N_P))
        point2 = Point2D.Create(MM(N_OR), MM(N_P))
        point3 = Point2D.Create(MM(N_OR), MM(NPO2+100))
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
        selection = Selection.Create(GetRootPart().Bodies[3].Faces[0])
        axisSelection = Selection.Create(GetRootPart().Curves[0])
        axis = RevolveFaces.GetAxisFromSelection(selection, axisSelection)
        options = RevolveFaceOptions()
        options.ExtrudeType = ExtrudeType.ForceIndependent
        result = RevolveFaces.Execute(selection, axis, DEG(360), options)
        selection = Selection.Create(GetRootPart().Bodies[3].Faces[1])
        upToSelection = Selection.Create(GetRootPart().Bodies[2].Faces[1])
        options = ExtrudeFaceOptions()
        options.ExtrudeType = ExtrudeType.ForceIndependent
        result = ExtrudeFaces.UpTo(selection, Direction.Create(-0.4, -0.916515138991168, 0), upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies)
        toolFaces = Selection.Create(GetRootPart().Bodies[3].Faces[0])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create(GetRootPart().Bodies)
        toolFaces = Selection.Create(GetRootPart().Bodies[3].Faces[2])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[4], GetRootPart().Bodies[5]])
        result = Delete.Execute(selection)
        P_OD = 2 * P_W + N_OD
        P_OR = P_OD / 2
        selection = Selection.Create(GetRootPart().Bodies[3].Faces[3])
        result = ViewHelper.SetSketchPlane(selection, None)
        origin = Point2D.Create(MM(0), MM(0))
        result = SketchCircle.Create(origin, MM(P_OR))
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        selection = Selection.Create(GetRootPart().Bodies[6].Faces[1])
        options = ExtrudeFaceOptions()
        options.ExtrudeType = ExtrudeType.ForceIndependent
        result = ExtrudeFaces.Execute(selection, MM(5), options)
        selection = Selection.Create(GetRootPart().Bodies)
        toolFaces = Selection.Create(GetRootPart().Bodies[7].Faces[3])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[7], GetRootPart().Bodies[6], GetRootPart().Bodies[...]])
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
        for i in range(0, 2, 1):
            selection = Selection.Create(GetRootPart().Bodies)
            datum = Selection.Create(GetRootPart().DatumPlanes[i])
            result = SplitBody.ByCutter(selection, datum)
    elif N_TYPE == "Barrel":
        selection = Selection.Create(GetRootPart().DatumPlanes[1])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(N_OFF), options)
        selection = Selection.Create(GetRootPart().DatumPlanes[1])
        result = ViewHelper.SetSketchPlane(selection, None)
        mode = InteractionMode.Sketch
        result = ViewHelper.SetViewMode(mode, None)
        Nrat = N_OFF / ap
        NPO = 1 - (Nrat**2)
        NPO2 = b1 * (NPO**0.5)
        start = Point2D.Create(MM(N_IR), MM(N_P))
        end = Point2D.Create(MM(N_OR), MM(N_P))
        result = SketchLine.Create(start, end)
        start = Point2D.Create(MM(N_IR), MM(N_P))
        end = Point2D.Create(MM(N_IR), MM(NPO2 + (Hub_LEN/2)))
        result = SketchLine.Create(start, end)
        start = Point2D.Create(MM(N_IR), MM(NPO2 + (Hub_LEN/2)))
        end = Point2D.Create(MM(Hub_OR), MM(NPO2 + (Hub_LEN/2)))
        result = SketchLine.Create(start, end)
        start = Point2D.Create(MM(Hub_OR), MM(NPO2 + (Hub_LEN/2)))
        end = Point2D.Create(MM(Hub_OR), MM(NPO2 + Hub_LEN))
        result = SketchLine.Create(start, end)
        start = Point2D.Create(MM(N_OR), MM(N_P))
        end = Point2D.Create(MM(N_OR), MM(NPO2 + Hub_LEN + T_LEN))
        result = SketchLine.Create(start, end)
        start = Point2D.Create(MM(N_OR), MM(NPO2 + Hub_LEN + T_LEN))
        end = Point2D.Create(MM(Hub_OR), MM(NPO2 + Hub_LEN))
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
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[6])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[7])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create(GetRootPart().Bodies[0])
        result = Delete.Execute(selection)
        selection = Selection.Create(GetRootPart().Bodies[0].Edges[10])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = Selection.Create(GetRootPart().DatumPlanes[3])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(-(P_THK)), options)
        selection = Selection.Create(GetRootPart().DatumPlanes[3])
        result = ViewHelper.SetSketchPlane(selection, None)
        P_OD = 2*P_W + N_OD
        P_OR = P_OD/2
        origin = Point2D.Create(MM(0), MM(0))
        result = SketchCircle.Create(origin, MM(P_OR))
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[10])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies[0].Faces[13])
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[10])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, Direction.DirY, upToSelection, Point.Create(MM(235.246753449874), MM(220.58269024862), MM(4.2288574991143)), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        plane = Selection.Create(GetRootPart().Bodies[0].Edges[3])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        plane = Selection.Create(GetRootPart().Bodies[1].Edges[2])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2]])
        plane = Selection.Create(GetRootPart().Bodies[2].Edges[2])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3]])
        plane = Selection.Create(GetRootPart().Bodies[3].Edges[8])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4]])
        plane = Selection.Create(GetRootPart().Bodies[3].Edges[4])
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
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
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
            GetRootPart().Bodies[31]])
        toolFaces = Selection.Create(GetRootPart().Bodies[11].Faces[4])
        result = SplitBody.ByCutter(selection, toolFaces, True)
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
            GetRootPart().Bodies[35]])
        toolFaces = Selection.Create(GetRootPart().Bodies[13].Faces[5])
        result = SplitBody.ByCutter(selection, toolFaces, True)
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
            GetRootPart().Bodies[39],
            GetRootPart().Bodies[40],
            GetRootPart().Bodies[41],
            GetRootPart().Bodies[42],
            GetRootPart().Bodies[43]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Elllipsoidal Barrel Nozzle With Pad")
if pad == "NO":
    import math
    ap1 = a2 + 10
    bp1 = b1 + 10
    points = []
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    if TD < 0:
        selection = Selection.Create([GetRootPart().Bodies[0].Faces[0],GetRootPart().Bodies[0].Faces[1]])
        axis=Line.Create(Point.Origin, Direction.DirY)
        options = RevolveFaceOptions()
        options.ExtrudeType = ExtrudeType.Add
        result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    else:
        selection = Selection.Create([GetRootPart().Bodies[0].Faces[0],GetRootPart().Bodies[0].Faces[1]])
        axis=Line.Create(Point.Origin, Direction.DirY)
        options = RevolveFaceOptions()
        options.ExtrudeType = ExtrudeType.Add
        result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    if N_TYPE == "Straight":
        selection = Selection.Create(GetRootPart().DatumPlanes[1])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(N_OFF), options)
        selection = Selection.Create(GetRootPart().DatumPlanes[1])
        result = ViewHelper.SetSketchPlane(selection, None)
        mode = InteractionMode.Sketch
        result = ViewHelper.SetViewMode(mode, None)
        Nrat = N_OFF / ap
        NPO = 1 - (Nrat**2)
        NPO2 = bp * (NPO**0.5)
        point1 = Point2D.Create(MM(N_IR), MM(N_P))
        point2 = Point2D.Create(MM(N_OR), MM(N_P))
        point3 = Point2D.Create(MM(N_OR), MM(NPO2+100))
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
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[6])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[7])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection =Selection.Create(GetRootPart().Bodies[0])
        result = Delete.Execute(selection)
        selection = BodySelection.Create(GetRootPart().Bodies[0])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[3],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[2]])
        plane = EdgeSelection.Create(GetRootPart().Bodies[3].Edges[29])
        result = SplitBody.ByCutter(selection, plane)
        selection = BodySelection.Create([GetRootPart().Bodies[3],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[0]])
        plane = EdgeSelection.Create(GetRootPart().Bodies[3].Edges[29])
        result = SplitBody.ByCutter(selection, plane)
        selection = EdgeSelection.Create(GetRootPart().Bodies[3].Edges[29])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = BodySelection.Create([GetRootPart().Bodies[1],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[0]])
        datum = Selection.Create(GetRootPart().DatumPlanes[3])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[5],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7]])
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[5],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7]])
        plane = EdgeSelection.Create(GetRootPart().Bodies[5].Edges[13])
        result = SplitBody.ByCutter(selection, plane)
        selection = BodySelection.Create([GetRootPart().Bodies[5],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[6]])
        plane = EdgeSelection.Create(GetRootPart().Bodies[5].Edges[8])
        result = SplitBody.ByCutter(selection, plane)
        selection = EdgeSelection.Create(GetRootPart().Bodies[5].Edges[13])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[5].Edges[12])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = BodySelection.Create([GetRootPart().Bodies[5],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7]])
        datum = Selection.Create(GetRootPart().DatumPlanes[4])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[5],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[12],
            GetRootPart().Bodies[13],
            GetRootPart().Bodies[14],
            GetRootPart().Bodies[15]])
        datum = Selection.Create(GetRootPart().DatumPlanes[5])
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
        result = RenameObject.Execute(selection,"Straight Ellipsoidal Nozzle")
    elif N_TYPE == "Radial":
        r = N_OFF / N_P
        rad = math.asin(r)
        deg = rad*180 / (math.pi)
        Nrat = N_OFF / ap
        NPO = 1 - (Nrat**2)
        NPO2 = bp * (NPO**0.5)
        selection = Selection.Create(GetRootPart().DatumPlanes[1])
        result = ViewHelper.SetSketchPlane(selection, None)
        point1 = Point2D.Create(MM(N_IR), MM(N_P))
        point2 = Point2D.Create(MM(N_OR), MM(N_P))
        point3 = Point2D.Create(MM(N_OR), MM(NPO2+100))
        result = SketchRectangle.Create(point1, point2, point3)
        start = Point2D.Create(MM(0), MM(0))
        end = Point2D.Create(MM(0), MM(N_P))
        isConstruction = True
        result = SketchLine.Create(start, end, isConstruction)
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        target = GetRootPart().Bodies[0]
        selection = Selection.Create(target)
        axis = Line.Create(Point.Create(0,0,0), Direction.DirZ)
        Move.Rotate(selection, axis, DEG(45), MoveOptions())
        selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
        start = Point.Create(MM(0), MM(0),MM(0))
        end   = Point.Create(MM(0), MM(N_P), MM(0))
        vector = end.Position - start.Position
        axis=Line.Create(start, vector.Direction)
        options = RevolveFaceOptions()
        options.ExtrudeType = ExtrudeType.Add
        result = RevolveFaces.Execute(selection, axis, DEG(360), options)
        selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[6])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(-154.69795864254), MM(293.407136723824), MM(109.830625476444)), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[6])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create(GetRootPart().Bodies[0])
        result = Delete.Execute(selection)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[6])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        plane = Selection.Create(GetRootPart().Bodies[1].Edges[5])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2]])
        plane = Selection.Create(GetRootPart().Bodies[1].Edges[3])
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
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
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
            GetRootPart().Bodies[9]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[10],
            GetRootPart().Bodies[15],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[5]])
        toolFaces = Selection.Create(GetRootPart().Bodies[12].Faces[3])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[10],
            GetRootPart().Bodies[15],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[20],
            GetRootPart().Bodies[21]])
        toolFaces = Selection.Create(GetRootPart().Bodies[2].Faces[3])
        result = SplitBody.ByCutter(selection, toolFaces, True)
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
            GetRootPart().Bodies[23]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Radial Ellipsoidal Nozzle")
    elif N_TYPE == "Barrel":
        selection = Selection.Create(GetRootPart().DatumPlanes[1])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(N_OFF), options)
        selection = Selection.Create(GetRootPart().DatumPlanes[1])
        result = ViewHelper.SetSketchPlane(selection, None)
        mode = InteractionMode.Sketch
        result = ViewHelper.SetViewMode(mode, None)
        Nrat = N_OFF / ap
        NPO = 1 - (Nrat**2)
        NPO2 = b1 * (NPO**0.5)
        start = Point2D.Create(MM(N_IR), MM(N_P))
        end = Point2D.Create(MM(N_OR), MM(N_P))
        result = SketchLine.Create(start, end)
        start = Point2D.Create(MM(N_IR), MM(N_P))
        end = Point2D.Create(MM(N_IR), MM(NPO2 + (Hub_LEN/2)))
        result = SketchLine.Create(start, end)
        start = Point2D.Create(MM(N_IR), MM(NPO2 + (Hub_LEN/2)))
        end = Point2D.Create(MM(Hub_OR), MM(NPO2 + (Hub_LEN/2)))
        result = SketchLine.Create(start, end)
        start = Point2D.Create(MM(Hub_OR), MM(NPO2 + (Hub_LEN/2)))
        end = Point2D.Create(MM(Hub_OR), MM(NPO2 + Hub_LEN))
        result = SketchLine.Create(start, end)
        start = Point2D.Create(MM(N_OR), MM(N_P))
        end = Point2D.Create(MM(N_OR), MM(NPO2 + Hub_LEN + T_LEN))
        result = SketchLine.Create(start, end)
        start = Point2D.Create(MM(N_OR), MM(NPO2 + Hub_LEN + T_LEN))
        end = Point2D.Create(MM(Hub_OR), MM(NPO2 + Hub_LEN))
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
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[6])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[7])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create(GetRootPart().Bodies[0])
        result = Delete.Execute(selection)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[10])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[8])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[9])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[3])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = EdgeSelection.Create(GetRootPart().Bodies[0].Edges[4])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = BodySelection.Create(GetRootPart().Bodies[0])
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3]])
        datum = Selection.Create(GetRootPart().DatumPlanes[3])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[6],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[4]])
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[6],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[4]])
        datum = Selection.Create(GetRootPart().DatumPlanes[7])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[6],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5]])
        datum = Selection.Create(GetRootPart().DatumPlanes[6])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[8],
            GetRootPart().Bodies[9],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[1].Faces[3])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[3],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[0]])
        datum = Selection.Create(GetRootPart().DatumPlanes[4])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[26],
            GetRootPart().Bodies[24],
            GetRootPart().Bodies[27],
            GetRootPart().Bodies[25]])
        datum = Selection.Create(GetRootPart().DatumPlanes[5])
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
            GetRootPart().Bodies[31]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Barrel Elipsoidal Nozzle")
comp = GetRootPart().Components[0]
comp.Content.ShareTopology =comp.Content.ShareTopology.Share