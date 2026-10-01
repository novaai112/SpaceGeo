plane = Plane.PlaneZX
result = DatumPlaneCreator.Create(plane, False, None)
plane = Plane.PlaneXY
result = DatumPlaneCreator.Create(plane, False, None)
plane = Plane.PlaneYZ
result = DatumPlaneCreator.Create(plane, False, None)
sectionPlane = Plane.PlaneXY
result = ViewHelper.SetSketchPlane(sectionPlane, None)
S_OR = S_OD / 2
point1 = Point2D.Create(MM(S_OR - S_THK), MM(0))
point2 = Point2D.Create(MM(S_OR), MM(0))
point3 = Point2D.Create(MM(S_OR), MM(S_H))
result = SketchRectangle.Create(point1, point2, point3)
mode = InteractionMode.Solid
result = ViewHelper.SetViewMode(mode, None)
selection = Selection.Create(GetRootPart().Bodies[0].Faces[0])
axis=Line.Create(Point.Origin, Direction.DirY)
options = RevolveFaceOptions()
options.ExtrudeType = ExtrudeType.Add
result = RevolveFaces.Execute(selection, axis, DEG(360), options)
selection = Selection.Create(GetRootPart().DatumPlanes[1])
direction = Move.GetDirection(selection)
options = MoveOptions()
result = Move.Translate(selection, direction, MM(N_OFF), options)
S_OR = S_OD / 2
H_OR = Hub_OD / 2
N_OR = N_OD / 2
N_LEN = N_P - S_OR
N_POS = (S_OR**2 - N_OR**2)**0.5
if N_TYPE == "Straight":
    selection = Selection.Create(GetRootPart().DatumPlanes[1])
    result = ViewHelper.SetSketchPlane(selection, None)
    start = Point2D.Create(MM(S_OR), MM(N_L1))
    end = Point2D.Create(MM(N_P), MM(N_L1))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    point1 = Point2D.Create(MM(N_P), MM(N_L1 + N_OR))
    point2 = Point2D.Create(MM(N_P), MM(N_L1 + N_OR - N_THK))
    point3 = Point2D.Create(MM(S_OR + 50), MM(N_L1 + N_OR - N_THK))
    result = SketchRectangle.Create(point1, point2, point3)
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
    axis=Line.Create(Point.Create(MM(0), MM(N_L1), MM(0)), Direction.DirX)
    options = RevolveFaceOptions()
    options.ExtrudeType = ExtrudeType.Add
    result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
    upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[1])
    options = ExtrudeFaceOptions()
    result = ExtrudeFaces.UpTo(selection, -Direction.DirX, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
    selection = Selection.Create(GetRootPart().Bodies[0].Faces[6])
    options = OffsetFaceOptions()
    options.OffsetMode = OffsetMode.MoveFacesTogether
    result = OffsetFaces.Execute(selection, MM(-S_THK), options)
    if pad == "YES":
        P_D= 2*P_W + N_OD
        P_OR = P_D/2
        selection = Selection.Create(GetRootPart().Curves[0].GetChildren[CurvePoint]()[0])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = Selection.Create(GetRootPart().DatumPlanes[3])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM(P_THK), options)
        selection = Selection.Create(GetRootPart().DatumPlanes[3])
        result = ViewHelper.SetSketchPlane(selection, None)
        origin = Point2D.Create(MM(0), MM(0))
        result = SketchCircle.Create(origin, MM(P_OR))
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[6])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, Direction.DirX, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies[0].Faces[8])
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[4])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, Direction.DirX, upToSelection, Point.Create(MM(946.216588274241), MM(1547.55714249255), MM(84.7004608880929)), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[5])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        toolFaces = Selection.Create(GetRootPart().Bodies[1].Faces[3])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create(GetRootPart().Curves[0])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[5]])
        datum = Selection.Create(GetRootPart().DatumPlanes[4])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[9],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[6]])
        toolFaces = Selection.Create(GetRootPart().Bodies[10].Faces[5])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        targets = Selection.Create([GetRootPart().Bodies[17],
            GetRootPart().Bodies[16]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[18],
            GetRootPart().Bodies[6]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[12],
            GetRootPart().Bodies[11]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[13],
            GetRootPart().Bodies[3]])
        result = Combine.Merge(targets)
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
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Shell Straight nozzle with pad")
        comp = GetRootPart().Components[0]
        comp.Content.ShareTopology =comp.Content.ShareTopology.Share
    elif pad == "NO":
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[6])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create(GetRootPart().Curves[0])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = Selection.Create([GetRootPart().Bodies[2],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[3])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[5],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[4],
            GetRootPart().Bodies[2]])
        toolFaces = Selection.Create(GetRootPart().Bodies[7].Faces[5])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        targets = Selection.Create([GetRootPart().Bodies[9],
            GetRootPart().Bodies[5]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[10],
            GetRootPart().Bodies[9]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[13],
            GetRootPart().Bodies[2]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[10],
            GetRootPart().Bodies[9]])
        result = Combine.Merge(targets)
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
            GetRootPart().Bodies[11]])
        result = ComponentHelper.MoveBodiesToComponent(selection, None)
        selection = Selection.Create(GetRootPart().Components[0].Content)
        result = RenameObject.Execute(selection,"Straight Nozzle")
        comp = GetRootPart().Components[0]
        comp.Content.ShareTopology =comp.Content.ShareTopology.Share
if N_TYPE == "Barrel":
    selection = Selection.Create(GetRootPart().DatumPlanes[1])
    result = ViewHelper.SetSketchPlane(selection, None)
    mode = InteractionMode.Sketch
    result = ViewHelper.SetViewMode(mode, None)
    start = Point2D.Create(MM(S_OR), MM(0))
    end = Point2D.Create(MM(S_OR), MM(N_L1))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    start = Point2D.Create(MM(S_OR), MM(N_L1))
    end = Point2D.Create(MM(N_P), MM(N_L1))
    isConstruction = True
    result = SketchLine.Create(start, end, isConstruction)
    start = Point2D.Create(MM(N_P), MM(N_L1 + N_OR))
    end = Point2D.Create(MM(N_P), MM(N_L1 + N_OR - N_THK))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_P), MM(N_L1 + N_OR - N_THK))
    end = Point2D.Create(MM(N_POS + 50), MM(N_L1 + N_OR - N_THK))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_POS + 50), MM(N_L1 + N_OR - N_THK))
    end = Point2D.Create(MM(N_POS + 50), MM(N_L1 + H_OR))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_POS + 50), MM(N_L1 + H_OR))
    end = Point2D.Create(MM(N_POS + Hub_LEN), MM(N_L1 + H_OR))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_POS + Hub_LEN), MM(N_L1 + H_OR))
    end = Point2D.Create(MM(N_POS + Hub_LEN + T_LEN), MM(N_L1 + N_OR))
    result = SketchLine.Create(start, end)
    start = Point2D.Create(MM(N_POS + Hub_LEN + T_LEN), MM(N_L1 + N_OR))
    end = Point2D.Create(MM(N_P), MM(N_L1 + N_OR))
    result = SketchLine.Create(start, end)
    mode = InteractionMode.Solid
    result = ViewHelper.SetViewMode(mode, None)
    selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
    axis=Line.Create(Point.Create(MM(0), MM(N_L1), MM(0)), Direction.DirX)
    options = RevolveFaceOptions()
    options.ExtrudeType = ExtrudeType.Add
    result = RevolveFaces.Execute(selection, axis, DEG(360), options)
    selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
    upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[1])
    options = ExtrudeFaceOptions()
    result = ExtrudeFaces.UpTo(selection, -Direction.DirX, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
    selection = Selection.Create(GetRootPart().Bodies[0].Faces[8])
    options = OffsetFaceOptions()
    options.OffsetMode = OffsetMode.MoveFacesTogether
    result = OffsetFaces.Execute(selection, MM(-S_THK), options)
    origin = Point.Create(MM(S_OR), MM(N_L1), MM(0))
    xDir = Direction.DirX
    yDir = Direction.DirZ
    result = DatumPlaneCreator.Create(origin, xDir, yDir, False)
    if pad == "YES":
        P_D= 2*P_W + Hub_OD
        P_OR = P_D/2
        selection = Selection.Create(GetRootPart().Bodies[0])
        result = DatumPlaneCreator.Create(selection, False, None)
        selection = Selection.Create(GetRootPart().DatumPlanes[2])
        direction = Move.GetDirection(selection)
        options = MoveOptions()
        result = Move.Translate(selection, direction, MM((S_OR+P_THK)), options)
        selection = Selection.Create(GetRootPart().DatumPlanes[2])
        result = ViewHelper.SetSketchPlane(selection, None)
        origin = Point2D.Create(MM(N_L1), MM(0))
        result = SketchCircle.Create(origin, MM(P_OR))
        mode = InteractionMode.Solid
        result = ViewHelper.SetViewMode(mode, None)
        selection = Selection.Create(GetRootPart().Bodies[1].Faces[0])
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[8])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, Direction.DirX, upToSelection, Point.Create(MM(0), MM(0), MM(0)), options)
        selection = Selection.Create(GetRootPart().Bodies[0].Faces[10])
        upToSelection = Selection.Create(GetRootPart().Bodies[0].Faces[6])
        options = ExtrudeFaceOptions()
        result = ExtrudeFaces.UpTo(selection, Direction.DirX, upToSelection, Point.Create(MM(726.588824074559), MM(1230.69590590292), MM(-612.020163662889)), options)
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[7])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        toolFaces = Selection.Create(GetRootPart().Bodies[1].Faces[5])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2]])
        plane = Selection.Create(GetRootPart().Bodies[2].Edges[0])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3]])
        plane = Selection.Create(GetRootPart().Bodies[3].Edges[1])
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4]])
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
            GetRootPart().Bodies[9]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[15],
            GetRootPart().Bodies[10],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[5]])
        toolFaces = Selection.Create(GetRootPart().Bodies[11].Faces[4])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        targets = Selection.Create([GetRootPart().Bodies[21],
            GetRootPart().Bodies[15]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[22],
            GetRootPart().Bodies[21]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[23],
            GetRootPart().Bodies[0]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[24],
            GetRootPart().Bodies[4]])
        result = Combine.Merge(targets)
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
        result = RenameObject.Execute(selection,"Barrel Shell Nozzle with pad")
        comp = GetRootPart().Components[0]
        comp.Content.ShareTopology =comp.Content.ShareTopology.Share
    elif pad == "NO":
        selection = Selection.Create(GetRootPart().Bodies[0])
        toolFaces = Selection.Create(GetRootPart().Bodies[0].Faces[8])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1]])
        datum = Selection.Create(GetRootPart().DatumPlanes[3])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[0],
            GetRootPart().Bodies[1],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[3]])
        datum = Selection.Create(GetRootPart().DatumPlanes[1])
        result = SplitBody.ByCutter(selection, datum)
        selection = Selection.Create([GetRootPart().Bodies[4],
            GetRootPart().Bodies[6],
            GetRootPart().Bodies[2],
            GetRootPart().Bodies[0]])
        toolFaces = Selection.Create(GetRootPart().Bodies[7].Faces[6])
        result = SplitBody.ByCutter(selection, toolFaces, True)
        targets = Selection.Create([GetRootPart().Bodies[11],
            GetRootPart().Bodies[6]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[8],
            GetRootPart().Bodies[7]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[11],
            GetRootPart().Bodies[2]])
        result = Combine.Merge(targets)
        targets = Selection.Create([GetRootPart().Bodies[12],
            GetRootPart().Bodies[0]])
        result = Combine.Merge(targets)
        selection = Selection.Create([GetRootPart().Bodies[1],
            GetRootPart().Bodies[0],
            GetRootPart().Bodies[3],
            GetRootPart().Bodies[4]])
        plane_yz = Plane.PlaneYZ
        result = DatumPlaneCreator.Create(plane_yz, False, None)
        datum_plane_1 = GetRootPart().DatumPlanes[-1]
        sel_dp_1 = Selection.Create(datum_plane_1)
        direction_1 = Move.GetDirection(sel_dp_1)
        options_1 = MoveOptions()
        result = Move.Translate(sel_dp_1, direction_1, MM(N_POS + Hub_LEN), options_1)
        plane = Selection.Create(datum_plane_1)
        result = SplitBody.ByCutter(selection, plane)
        selection = Selection.Create([GetRootPart().Bodies[15],
            GetRootPart().Bodies[14],
            GetRootPart().Bodies[12],
            GetRootPart().Bodies[13]])
        plane_yz = Plane.PlaneYZ
        result = DatumPlaneCreator.Create(plane_yz, False, None)
        datum_plane_2 = GetRootPart().DatumPlanes[-1]
        sel_dp_2 = Selection.Create(datum_plane_2)
        direction_2 = Move.GetDirection(sel_dp_2)
        options_2 = MoveOptions()
        result = Move.Translate(sel_dp_2, direction_2, MM(N_POS + Hub_LEN + T_LEN), options_2)
        plane = Selection.Create(datum_plane_2)
        result = SplitBody.ByCutter(selection, plane)
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
        result = RenameObject.Execute(selection,"Barrel Nozzle")
        comp = GetRootPart().Components[0]
        comp.Content.ShareTopology =comp.Content.ShareTopology.Share