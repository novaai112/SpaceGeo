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