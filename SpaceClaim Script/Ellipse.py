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