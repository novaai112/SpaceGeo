import math
H_OR = H_OD / 2
S_IR = S_ID / 2
S_OR = S_IR + S_THK
S_LEN = S_H + T_LEN
plane = Plane.PlaneZX
result = DatumPlaneCreator.Create(plane, False, None)
plane = Plane.PlaneXY
result = DatumPlaneCreator.Create(plane, False, None)
plane = Plane.PlaneYZ
result = DatumPlaneCreator.Create(plane, False, None)
sectionPlane = Plane.PlaneXY
result = ViewHelper.SetSketchPlane(sectionPlane, None)
point1 = Point2D.Create(MM(0), MM(0))
point2 = Point2D.Create(MM(H_OR), MM(0))
point3 = Point2D.Create(MM(H_OR), MM(H_THK))
result = SketchRectangle.Create(point1, point2, point3)
start = Point2D.Create(MM(S_IR), MM(0))
end = Point2D.Create(MM(S_IR), MM(-T_LEN))
result = SketchLine.Create(start, end)
start = Point2D.Create(MM(S_IR), MM(-T_LEN))
end = Point2D.Create(MM(S_IR), MM(-S_LEN))
result = SketchLine.Create(start, end)
start = Point2D.Create(MM(S_IR), MM(-S_LEN))
end = Point2D.Create(MM(S_OR), MM(-S_LEN))
result = SketchLine.Create(start, end)
start = Point2D.Create(MM(S_OR), MM(-T_LEN))
end = Point2D.Create(MM(S_OR), MM(-S_LEN))
result = SketchLine.Create(start, end)
start = Point2D.Create(MM(S_OR), MM(-T_LEN))
end = Point2D.Create(MM(H_OR), MM(0))
result = SketchLine.Create(start, end)
start = Point2D.Create(MM(S_IR), MM(-T_LEN))
end = Point2D.Create(MM(S_OR), MM(-T_LEN))
result = SketchLine.Create(start, end)
mode = InteractionMode.Solid
result = ViewHelper.SetViewMode(mode, None)
for i in range(0, 3, 1):
    selection =Selection.Create(GetRootPart().Bodies[0].Faces[0])
    axis=Line.Create(Point.Origin, Direction.DirY)
    options = RevolveFaceOptions()
    options.ExtrudeType = ExtrudeType.ForceIndependent
    result = RevolveFaces.Execute(selection, axis, DEG(360), options)
N_OR = N_OD / 2
N_IR = N_OR - N_THK
Hub_OR = Hub_OD / 2
if N_TYPE == "Straight":
    selection = Selection.Create(GetRootPart().DatumPlanes[1])
    direction = Move.GetDirection(selection)
    options = MoveOptions()
    result = Move.Translate(selection, direction, MM(N_OFF), options)
    selection = Selection.Create(GetRootPart().DatumPlanes[1])
    result = ViewHelper.SetSketchPlane(selection, None)
    mode = InteractionMode.Sketch
    result = ViewHelper.SetViewMode(mode, None)
    point1 = Point2D.Create(MM(N_IR), MM(N_P))
    point2 = Point2D.Create(MM(N_OR), MM(N_P))
    point3 = Point2D.Create(MM(N_OR), MM(H_THK + 50))
    result = SketchRectangle.Create(point1, point2, point3)
    start = Point2D.Create(MM(0), MM(0))
    end = Point2D.Create(MM(0), MM(N_P))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    selection = Selection.Create(GetRootPart().Bodies[3].Faces[0])
    axis=Line.Create(Point.Origin, Direction.DirY)
    options = RevolveFaceOptions()
    options.ExtrudeType = ExtrudeType.ForceIndependent
    result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    selection = Selection.Create(GetRootPart().Bodies[3].Faces[2])
    upToSelection = Selection.Create(GetRootPart().Bodies[2].Faces[2])
    options = ExtrudeFaceOptions()
    result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
    selection = Selection.Create(GetRootPart().Bodies[0].Faces[6])
    upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[3])
    options = ExtrudeFaceOptions()
    result = ExtrudeFaces.UpTo(selection, Direction.DirY, upToSelection, Point.Create(MM(0), MM(0), MM(S_THK)), options)
    if pad == "NO":
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[5])
        result = SplitBody.ByCutter(selection, toolFaces)
        selection = Selection.Create(GetRootPart().Bodies[0])
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[1])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[2],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[0]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[2],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7]])
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[4],
            GetRootPart().Bodies[12],
            GetRootPart().Bodies[8],
            GetRootPart().Bodies[2]])
        toolFaces = Selection.Create(GetRootPart().Bodies[9].Faces[4])
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
            GetRootPart().Bodies[19]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Flat Nozzle")
        comp = GetRootPart().Components[0]
        comp.Content.ShareTopology =comp.Content.ShareTopology.Share
    elif pad == "YES":
        import math
        sectionPlane = Plane.PlaneXY
        result = ViewHelper.SetSketchPlane(sectionPlane, None)
        point1 = Point2D.Create(MM(N_OR),MM(H_THK))
        point2 = Point2D.Create(MM(N_OR+P_W),MM(H_THK))
        point3 = Point2D.Create(MM(N_OR+P_W),MM(H_THK+P_THK))
        result = SketchRectangle.Create(point1, point2, point3)
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
        axis=Line.Create(Point.Origin, Direction.DirY)
        options = RevolveFaceOptions()
        options.ExtrudeType = ExtrudeType.Add
        result = RevolveFaces.Execute(selection, axis, DEG(-360), options)
        selection = BodySelection.Create(GetRootPart().Bodies[0])
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[0]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[0].Faces[13])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[6]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[4].Faces[2])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[2],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[3]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[5].Faces[1])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[14],
            GetRootPart().Bodies[15],
            GetRootPart().Bodies[13],
            GetRootPart().Bodies[12]])
        plane = EdgeSelection.Create(GetRootPart().Bodies[13].Edges[13])
        result = SplitBody.ByCutter(selection, plane)
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
            GetRootPart().Bodies[15]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Flat Heand Nozzle With Pad")
        comp = GetRootPart().Components[0]
        comp.Content.ShareTopology =comp.Content.ShareTopology.Share
elif N_TYPE == "Radial":
    import math
    r = N_OFF / N_P
    rad = math.asin(r)
    deg = rad * 180 / math.pi
    y = N_P**2 - N_OFF**2
    y1 = y**0.5
    theta = math.atan(y1 / N_OFF)
    beta = theta * 180 / math.pi
    deg = 90 - beta
    ExtAPI.Log.WriteError(deg.ToString())
    selection = Selection.Create(GetRootPart().DatumPlanes[1])
    result = ViewHelper.SetSketchPlane(selection, None)
    mode = InteractionMode.Sketch
    result = ViewHelper.SetViewMode(mode, None)
    point1 = Point2D.Create(MM(N_IR), MM(N_P))
    point2 = Point2D.Create(MM(N_OR), MM(N_P))
    point3 = Point2D.Create(MM(N_OR), MM(N_P * 0.75))
    result = SketchRectangle.Create(point1, point2, point3)
    start = Point2D.Create(MM(0), MM(0))
    end = Point2D.Create(MM(0), MM(N_P))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    ViewHelper.SetSketchPlane(Plane.PlaneXY)
    selection = Selection.Create([GetRootPart().Curves[3],
        GetRootPart().Curves[0],
        GetRootPart().Curves[2],
        GetRootPart().Curves[1],
        GetRootPart().Curves[4].GetChildren[CurvePoint]()[1]])
    hingePoint = Move.GetAnchorPoint2D(selection)
    options = MoveOptions()
    result = Move.Rotate2D(selection, hingePoint, DEG(-deg), options)
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
    start = Point.Create(MM(0), MM(0),MM(0))
    end   = Point.Create(MM(150.688420258492), MM(261), MM(0))
    vector = end.Position - start.Position
    axis=Line.Create(start, vector.Direction)
    options = RevolveFaceOptions()
    options.ExtrudeType = ExtrudeType.Add
    result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    selection = Selection.Create(GetRootPart().Bodies[3].Faces[0])
    upToSelection = Selection.Create(GetRootPart().Bodies[2].Faces[2])
    options = ExtrudeFaceOptions()
    options.ExtrudeType = ExtrudeType.ForceIndependent
    result = ExtrudeFaces.UpTo(selection, Direction.Create(-0.6, -0.8, 0), upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
    selection = FaceSelection.Create(GetRootPart().Bodies[0].Faces[5])
    upToSelection = FaceSelection.Create(GetRootPart().Bodies[0].Faces[3])
    options = ExtrudeFaceOptions()
    result = ExtrudeFaces.UpTo(selection, Direction.DirY, upToSelection, Point.Create(MM(-37.7265952742576), MM(0), MM(193.010055605212)), options)
    selection = Selection.Create(GetRootPart().Bodies)
    toolFaces = Selection.Create(GetRootPart().Bodies[3].Faces[0])
    result = SplitBody.ByCutter(selection, toolFaces, True)
    selection = Selection.Create(GetRootPart().Bodies)
    toolFaces = Selection.Create(GetRootPart().Bodies[3].Faces[2])
    result = SplitBody.ByCutter(selection, toolFaces, True)
    selection = Selection.Create(GetRootPart().Bodies[4])
    result = Delete.Execute(selection)
    if pad == "NO":
        selection = Selection.Create(GetRootPart().DatumPlanes[0])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(H_THK + 10), options)
        selection = Selection.Create(GetRootPart().Bodies)
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create(GetRootPart().Bodies[3].Faces[0])
        result = ViewHelper.SetSketchPlane(selection, None)
        origin = Point2D.Create(MM(0), MM(0))
        result = SketchCircle.Create(origin, MM(N_OR + 10))
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        selection = Selection.Create(GetRootPart().Bodies[6].Faces[1])
        options = ExtrudeFaceOptions()
        options.ExtrudeType = ExtrudeType.ForceIndependent
        result = ExtrudeFaces.Execute(selection, MM(5), options)
        selection = Selection.Create(GetRootPart().Bodies)
        toolFaces = Selection.Create(GetRootPart().Bodies[7].Faces[3])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create(GetRootPart().Bodies[7])
        result = Delete.Execute(selection)
        selection = Selection.Create(GetRootPart().Bodies[6])
        result = Delete.Execute(selection)
        selection = Selection.Create(GetRootPart().Bodies)
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
    elif pad == "YES":
        selection = Selection.Create(GetRootPart().DatumPlanes[0])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(H_THK + P_THK), options)
        selection = Selection.Create(GetRootPart().Bodies)
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create(GetRootPart().Bodies[5].Faces[1])
        options = OffsetFaceOptions()
        options.ExtrudeType = ExtrudeType.ForceIndependent
        result = OffsetFaces.Execute(selection, MM(P_W), Direction.Create(0.425109636831449, 0.245437163259741, 0.871230391781672), options)
        selection = Selection.Create(GetRootPart().DatumPlanes[0])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(10), options)
        selection = Selection.Create(GetRootPart().Bodies)
        datum = Selection.Create(GetRootPart().DatumPlanes[0])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create(GetRootPart().Bodies)
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
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
    start = Point2D.Create(MM(N_IR), MM(N_P))
    end = Point2D.Create(MM(N_OR), MM(N_P))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_IR), MM(N_P))
    end = Point2D.Create(MM(N_IR), MM(H_THK + (Hub_LEN / 2)))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_IR), MM(H_THK + (Hub_LEN / 2)))
    end = Point2D.Create(MM(Hub_OR), MM(H_THK + (Hub_LEN / 2)))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(Hub_OR), MM(H_THK + (Hub_LEN / 2)))
    end = Point2D.Create(MM(Hub_OR), MM(H_THK + Hub_LEN))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_OR), MM(N_P))
    end = Point2D.Create(MM(N_OR), MM(H_THK + Hub_LEN + T_LEN))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_OR), MM(H_THK + Hub_LEN + T_LEN))
    end = Point2D.Create(MM(Hub_OR), MM(H_THK + Hub_LEN))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(0), MM(0))
    end = Point2D.Create(MM(0), MM(N_P))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    selection = Selection.Create(GetRootPart().Bodies[3].Faces[0])
    axis=Line.Create(Point.Origin, Direction.DirY)
    options = RevolveFaceOptions()
    options.ExtrudeType = ExtrudeType.ForceIndependent
    result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    selection = Selection.Create(GetRootPart().Bodies[3].Faces[2])
    upToSelection = Selection.Create(GetRootPart().Bodies[2].Faces[2])
    options = ExtrudeFaceOptions()
    result = ExtrudeFaces.UpTo(selection, -Direction.DirY, upToSelection, Point.Create(MM(-98.087562790349), MM(40), MM(-254.745200843168)), options)
    selection = Selection.Create(GetRootPart().Bodies[0].Faces[8])
    upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[5])
    options = ExtrudeFaceOptions()
    result = ExtrudeFaces.UpTo(selection, Direction.DirY, upToSelection, Point.Create(MM(-141.544453036277), MM(0), MM(199.390750727316)), options)
    if pad == "NO":
        selection = BodySelection.Create(GetRootPart().Bodies[0])
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = BodySelection.Create([GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[0]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[2].Faces[13])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7]])
        plane = EdgeSelection.Create(GetRootPart().Bodies[5].Edges[11])
        result = SplitBody.ByCutter(selection, plane)
        selection = BodySelection.Create([GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7]])
        plane = EdgeSelection.Create(GetRootPart().Bodies[5].Edges[11])
        result = SplitBody.ByCutter(selection, plane)
        selection = BodySelection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[1]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[4].Faces[3])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = BodySelection.Create([GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[7]])
        plane = EdgeSelection.Create(GetRootPart().Bodies[4].Edges[10])
        result = SplitBody.ByCutter(selection, plane)
        selection = BodySelection.Create([GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[7],
            GetRootPart().Bodies[6]])
        plane = EdgeSelection.Create(GetRootPart().Bodies[4].Edges[4])
        result = SplitBody.ByCutter(selection, plane)
        selection = BodySelection.Create([GetRootPart().Bodies[9],
            GetRootPart().Bodies[8],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[11]])
        toolFaces = FaceSelection.Create(GetRootPart().Bodies[2].Faces[5])
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
            GetRootPart().Bodies[15]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Barrel Flat Nozzle")
        comp = GetRootPart().Components[0]
        comp.Content.ShareTopology =comp.Content.ShareTopology.Share
    elif pad == "YES":
        import math
        sectionPlane = Plane.PlaneXY
        result = ViewHelper.SetSketchPlane(sectionPlane, None)
        point1 = Point2D.Create(MM(N_OR),MM(H_THK))
        point2 = Point2D.Create(MM(N_OR+P_W),MM(H_THK))
        point3 = Point2D.Create(MM(N_OR+P_W),MM(H_THK+P_THK))
        result = SketchRectangle.Create(point1, point2, point3)
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
        axis=Line.Create(Point.Origin, Direction.DirY)
        options = RevolveFaceOptions()
        options.ExtrudeType = ExtrudeType.Add
        result = RevolveFaces.Execute(selection, axis, DEG(360), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        plane = Selection.Create(GetRootPart().Bodies[0].Edges[8])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        plane = Selection.Create(GetRootPart().Bodies[1].Edges[5])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2]])
        plane = Selection.Create(GetRootPart().Bodies[2].Edges[4])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3]])
        plane = Selection.Create(GetRootPart().Bodies[2].Edges[1])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4]])
        plane = Selection.Create(GetRootPart().Bodies[2].Edges[3])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5]])
        plane = Selection.Create(GetRootPart().Bodies[2].Edges[3])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5],
            GetRootPart().Bodies[6]])
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
            GetRootPart().Bodies[13]])
        datum = Selection.Create(GetRootPart().DatumPlanes[2])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[9],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[23],
            GetRootPart().Bodies[16]])
        toolFaces = Selection.Create(GetRootPart().Bodies[19].Faces[5])
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
            GetRootPart().Bodies[31]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Barrel Flat Nozzle With Pad")
    comp = GetRootPart().Components[0]
    comp.Content.ShareTopology =comp.Content.ShareTopology.Share