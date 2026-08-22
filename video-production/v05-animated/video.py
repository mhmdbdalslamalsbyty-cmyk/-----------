from manim import *

BG = "#0B1F33"
PANEL = "#12334D"
TEAL = "#2DD4BF"
BLUE = "#60A5FA"
PURPLE = "#C084FC"
AMBER = "#F59E0B"
WHITE = "#F8FAFC"
MUTED = "#CBD5E1"


class V05Scene01Hook(Scene):
    # Target: 14.68s (from scene01-hook.wav)
    def construct(self):
        bg = Rectangle(width=14.22, height=8, fill_color=BG, fill_opacity=1, stroke_width=0)
        title = Text("لماذا نحتاج طريق العودة؟", font_size=38, color=WHITE).to_edge(UP, buff=0.34)
        values = ["10", "20", "30"]
        nodes = VGroup(*[RoundedRectangle(width=1.5, height=0.9, corner_radius=0.16, fill_color=PANEL, fill_opacity=1, stroke_color=TEAL, stroke_width=3) for _ in values]).arrange(RIGHT, buff=1.5).shift(DOWN * 0.25)
        labels = VGroup(*[Text(v, font_size=30, color=WHITE).move_to(n) for v, n in zip(values, nodes)])
        next_arrows = VGroup(*[Arrow(nodes[i].get_right(), nodes[i + 1].get_left(), buff=0.12, color=BLUE, stroke_width=5, tip_length=0.18) for i in range(2)])
        one_way = Text("في القائمة الأحادية: إلى الأمام فقط", font_size=25, color=MUTED).next_to(nodes, DOWN, buff=1.05)
        backward = DashedLine(nodes[2].get_bottom() + DOWN * 0.42, nodes[0].get_bottom() + DOWN * 0.42, color=AMBER, stroke_width=4)
        issue = Text("كيف نرجع خطوة؟", font_size=32, color=AMBER).next_to(backward, DOWN, buff=0.35)
        prev_arrow = Arrow(nodes[2].get_bottom() + DOWN * 0.42, nodes[0].get_bottom() + DOWN * 0.42, buff=0.12, color=PURPLE, stroke_width=5, tip_length=0.18)
        prev_label = Text("prev", font_size=24, color=PURPLE).next_to(prev_arrow, DOWN, buff=0.18)
        self.add(bg)
        self.play(Write(title), run_time=0.8)
        self.play(LaggedStart(*[GrowFromCenter(n) for n in nodes], lag_ratio=0.15), FadeIn(labels), run_time=0.9)
        self.play(LaggedStart(*[GrowArrow(a) for a in next_arrows], lag_ratio=0.2), run_time=0.6)
        self.play(FadeIn(one_way, shift=UP * 0.2), run_time=0.9)
        self.play(Create(backward), FadeIn(issue), run_time=0.9)
        self.play(ReplacementTransform(backward, prev_arrow), ReplacementTransform(issue, prev_label), run_time=0.9)
        self.play(Indicate(prev_arrow, color=PURPLE), run_time=0.6)
        self.wait(8.96)


class V05Scene02Node(Scene):
    # Target: 15.52s (from scene02-node.wav)
    def construct(self):
        bg = Rectangle(width=14.22, height=8, fill_color=BG, fill_opacity=1, stroke_width=0)
        title = Text("العقدة المزدوجة تحمل رابطين", font_size=38, color=WHITE).to_edge(UP, buff=0.34)
        shell = RoundedRectangle(width=7.7, height=2.1, corner_radius=0.2, fill_color=PANEL, fill_opacity=1, stroke_color=TEAL, stroke_width=3).shift(DOWN * 0.25)
        div1_center = shell.get_left() + RIGHT * 2.45
        div2_center = shell.get_left() + RIGHT * 5.25
        div1 = Line(div1_center + DOWN * 0.87, div1_center + UP * 0.87, color=TEAL)
        div2 = Line(div2_center + DOWN * 0.87, div2_center + UP * 0.87, color=TEAL)
        prev = Text("prev", font_size=31, color=PURPLE).move_to(shell.get_left() + RIGHT * 1.22)
        data = Text("data\n20", font_size=31, color=WHITE, line_spacing=0.7).move_to(shell.get_center())
        next_t = Text("next", font_size=31, color=BLUE).move_to(shell.get_right() + LEFT * 1.22)
        left_arrow = Arrow(shell.get_left() + LEFT * 1.75, shell.get_left() + LEFT * 0.08, buff=0.05, color=PURPLE, stroke_width=5, tip_length=0.18)
        right_arrow = Arrow(shell.get_right() + RIGHT * 0.08, shell.get_right() + RIGHT * 1.75, buff=0.05, color=BLUE, stroke_width=5, tip_length=0.18)
        left_note = Text("إلى السابقة", font_size=24, color=PURPLE).next_to(left_arrow, DOWN, buff=0.3)
        right_note = Text("إلى التالية", font_size=24, color=BLUE).next_to(right_arrow, DOWN, buff=0.3)
        rule = Text("عقدة واحدة، اتجاهان", font_size=29, color=TEAL).next_to(shell, DOWN, buff=1.1)
        self.add(bg)
        self.play(Write(title), run_time=0.8)
        self.play(GrowFromCenter(shell), run_time=1.2)
        self.play(Create(div1), Create(div2), FadeIn(prev), FadeIn(data), FadeIn(next_t), run_time=1.5)
        self.play(GrowArrow(left_arrow), GrowArrow(right_arrow), run_time=1.2)
        self.play(FadeIn(left_note, shift=UP * 0.15), FadeIn(right_note, shift=UP * 0.15), run_time=0.8)
        self.play(FadeIn(rule, shift=UP * 0.2), run_time=0.8)
        self.wait(9.22)


class V05Scene03Traverse(Scene):
    # Target: 16.48s (from scene03-traverse.wav)
    def construct(self):
        bg = Rectangle(width=14.22, height=8, fill_color=BG, fill_opacity=1, stroke_width=0)
        title = Text("نمشي ذهابًا وإيابًا", font_size=38, color=WHITE).to_edge(UP, buff=0.34)
        nodes = VGroup(*[RoundedRectangle(width=1.45, height=0.85, corner_radius=0.15, fill_color=PANEL, fill_opacity=1, stroke_color=TEAL, stroke_width=3) for _ in range(3)]).arrange(RIGHT, buff=1.5).shift(DOWN * 0.15)
        labels = VGroup(*[Text(v, font_size=29, color=WHITE).move_to(n) for v, n in zip(["10", "20", "30"], nodes)])
        forwards = VGroup(*[Arrow(nodes[i].get_right() + UP * 0.22, nodes[i + 1].get_left() + UP * 0.22, buff=0.08, color=BLUE, stroke_width=5, tip_length=0.16) for i in range(2)])
        backwards = VGroup(*[Arrow(nodes[i + 1].get_left() + DOWN * 0.22, nodes[i].get_right() + DOWN * 0.22, buff=0.08, color=PURPLE, stroke_width=5, tip_length=0.16) for i in range(2)])
        cursor = Circle(radius=0.23, color=AMBER, fill_color=AMBER, fill_opacity=1).move_to(nodes[0].get_top() + UP * 0.55)
        head = Text("head", font_size=23, color=TEAL).next_to(nodes[0], DOWN, buff=0.45)
        tail = Text("tail", font_size=23, color=TEAL).next_to(nodes[2], DOWN, buff=0.45)
        forward_label = Text("next", font_size=25, color=BLUE).next_to(forwards, UP, buff=0.52)
        back_label = Text("prev", font_size=25, color=PURPLE).next_to(backwards, DOWN, buff=0.52)
        self.add(bg)
        self.play(Write(title), run_time=0.8)
        self.play(FadeIn(nodes), FadeIn(labels), GrowArrow(forwards[0]), GrowArrow(forwards[1]), GrowArrow(backwards[0]), GrowArrow(backwards[1]), FadeIn(head), FadeIn(tail), run_time=1.3)
        self.play(FadeIn(cursor), cursor.animate.move_to(nodes[1].get_top() + UP * 0.55), cursor.animate.move_to(nodes[2].get_top() + UP * 0.55), run_time=3.2)
        self.play(FadeIn(forward_label), run_time=0.7)
        self.play(cursor.animate.move_to(nodes[1].get_top() + UP * 0.55), cursor.animate.move_to(nodes[0].get_top() + UP * 0.55), run_time=3.2)
        self.play(FadeIn(back_label), run_time=0.8)
        self.wait(6.48)


class V05Scene04Cursor(Scene):
    # Target: 16.00s (from scene04-cursor.wav)
    def construct(self):
        bg = Rectangle(width=14.22, height=8, fill_color=BG, fill_opacity=1, stroke_width=0)
        title = Text("المؤشر يختار الاتجاه", font_size=38, color=WHITE).to_edge(UP, buff=0.34)
        nodes = VGroup(*[RoundedRectangle(width=1.55, height=0.95, corner_radius=0.16, fill_color=PANEL, fill_opacity=1, stroke_color=TEAL, stroke_width=3) for _ in range(3)]).arrange(RIGHT, buff=1.55).shift(DOWN * 0.15)
        labels = VGroup(*[Text(v, font_size=30, color=WHITE).move_to(n) for v, n in zip(["10", "20", "30"], nodes)])
        f1 = Arrow(nodes[0].get_right(), nodes[1].get_left(), buff=0.1, color=BLUE, stroke_width=5, tip_length=0.18)
        f2 = Arrow(nodes[1].get_right(), nodes[2].get_left(), buff=0.1, color=BLUE, stroke_width=5, tip_length=0.18)
        b1 = Arrow(nodes[1].get_bottom() + DOWN * 0.32, nodes[0].get_bottom() + DOWN * 0.32, buff=0.1, color=PURPLE, stroke_width=5, tip_length=0.18)
        b2 = Arrow(nodes[2].get_bottom() + DOWN * 0.32, nodes[1].get_bottom() + DOWN * 0.32, buff=0.1, color=PURPLE, stroke_width=5, tip_length=0.18)
        cursor = Triangle(color=AMBER, fill_color=AMBER, fill_opacity=1).scale(0.22).rotate(PI).move_to(nodes[1].get_top() + UP * 0.52)
        note = Text("عند 20: أمام أو خلف", font_size=29, color=AMBER).next_to(nodes, DOWN, buff=1.2)
        self.add(bg)
        self.play(Write(title), run_time=0.8)
        self.play(FadeIn(nodes), FadeIn(labels), GrowArrow(f1), GrowArrow(f2), GrowArrow(b1), GrowArrow(b2), run_time=1.2)
        self.play(FadeIn(cursor), FadeIn(note), run_time=0.8)
        self.play(cursor.animate.move_to(nodes[2].get_top() + UP * 0.52), Indicate(f2, color=BLUE), run_time=2.2)
        self.play(cursor.animate.move_to(nodes[0].get_top() + UP * 0.52), Indicate(b1, color=PURPLE), run_time=2.2)
        self.play(Indicate(note, color=AMBER), run_time=0.8)
        self.wait(8.0)


class V05Scene05Insert(Scene):
    # Target: 17.92s (from scene05-insert.wav)
    def construct(self):
        bg = Rectangle(width=14.22, height=8, fill_color=BG, fill_opacity=1, stroke_width=0)
        title = Text("إدراج عقدة بين جارين", font_size=38, color=WHITE).to_edge(UP, buff=0.34)
        left = RoundedRectangle(width=1.5, height=0.9, corner_radius=0.16, fill_color=PANEL, fill_opacity=1, stroke_color=TEAL, stroke_width=3).shift(LEFT * 3.2 + DOWN * 0.1)
        right = RoundedRectangle(width=1.5, height=0.9, corner_radius=0.16, fill_color=PANEL, fill_opacity=1, stroke_color=TEAL, stroke_width=3).shift(RIGHT * 3.2 + DOWN * 0.1)
        ltxt = Text("20", font_size=30, color=WHITE).move_to(left)
        rtxt = Text("30", font_size=30, color=WHITE).move_to(right)
        old = DoubleArrow(left.get_right(), right.get_left(), buff=0.14, color=MUTED, stroke_width=4, tip_length=0.15)
        new = RoundedRectangle(width=1.5, height=0.9, corner_radius=0.16, fill_color="#164E63", fill_opacity=1, stroke_color=AMBER, stroke_width=4).shift(DOWN * 2.0)
        ntxt = Text("25", font_size=30, color=WHITE).move_to(new)
        ports = VGroup(*[Dot(point, radius=0.07, color=AMBER) for point in [new.get_left(), new.get_right(), new.get_top(), new.get_bottom()]])
        up = Arrow(new.get_top(), ORIGIN + DOWN * 0.58, buff=0.08, color=AMBER, stroke_width=5, tip_length=0.18)
        caption = Text("العقدة الجديدة تعرف الجارين", font_size=29, color=AMBER).next_to(new, DOWN, buff=0.75)
        self.add(bg)
        self.play(Write(title), run_time=0.8)
        self.play(GrowFromCenter(left), GrowFromCenter(right), FadeIn(ltxt), FadeIn(rtxt), GrowArrow(old), run_time=1.2)
        self.play(GrowFromCenter(new), FadeIn(ntxt), run_time=1.0)
        self.play(FadeIn(ports, scale=1.3), run_time=0.8)
        self.play(GrowArrow(up), Indicate(old, color=AMBER), run_time=1.0)
        self.play(FadeIn(caption, shift=UP * 0.15), run_time=0.8)
        self.wait(12.32)


class V05Scene06Order(Scene):
    # Target: 21.52s (from scene06-order.wav)
    def construct(self):
        bg = Rectangle(width=14.22, height=8, fill_color=BG, fill_opacity=1, stroke_width=0)
        title = Text("ترتيب التحديث يحمي الاتجاهين", font_size=38, color=WHITE).to_edge(UP, buff=0.34)
        left = RoundedRectangle(width=1.45, height=0.9, corner_radius=0.16, fill_color=PANEL, fill_opacity=1, stroke_color=TEAL, stroke_width=3).shift(LEFT * 3.5 + DOWN * 0.12)
        mid = RoundedRectangle(width=1.45, height=0.9, corner_radius=0.16, fill_color="#164E63", fill_opacity=1, stroke_color=AMBER, stroke_width=4).shift(DOWN * 0.12)
        right = RoundedRectangle(width=1.45, height=0.9, corner_radius=0.16, fill_color=PANEL, fill_opacity=1, stroke_color=TEAL, stroke_width=3).shift(RIGHT * 3.5 + DOWN * 0.12)
        labels = VGroup(Text("20", font_size=30, color=WHITE).move_to(left), Text("25", font_size=30, color=WHITE).move_to(mid), Text("30", font_size=30, color=WHITE).move_to(right))
        steps = VGroup(*[Text(t, font_size=25, color=MUTED) for t in ["1  25.prev = 20", "2  25.next = 30", "3  20.next = 25", "4  30.prev = 25"]]).arrange(DOWN, aligned_edge=LEFT, buff=0.25).to_corner(DL, buff=0.48)
        p1 = Arrow(mid.get_bottom() + DOWN * 0.28, left.get_bottom() + DOWN * 0.28, buff=0.08, color=PURPLE, stroke_width=5, tip_length=0.17)
        n1 = Arrow(mid.get_top() + UP * 0.28, right.get_top() + UP * 0.28, buff=0.08, color=BLUE, stroke_width=5, tip_length=0.17)
        n2 = Arrow(left.get_right(), mid.get_left(), buff=0.08, color=TEAL, stroke_width=5, tip_length=0.17)
        p2 = Arrow(right.get_bottom() + DOWN * 0.55, mid.get_bottom() + DOWN * 0.55, buff=0.08, color=TEAL, stroke_width=5, tip_length=0.17)
        checks = VGroup(*[Text("✓", font_size=30, color=TEAL).next_to(s, LEFT, buff=0.2) for s in steps])
        final = Text("روابط سليمة في الاتجاهين", font_size=29, color=TEAL).next_to(mid, DOWN, buff=1.55)
        self.add(bg)
        self.play(Write(title), run_time=0.8)
        self.play(FadeIn(left), FadeIn(mid), FadeIn(right), FadeIn(labels), FadeIn(steps), run_time=1.4)
        self.play(GrowArrow(p1), FadeIn(checks[0]), steps[0].animate.set_color(PURPLE), run_time=1.5)
        self.play(GrowArrow(n1), FadeIn(checks[1]), steps[1].animate.set_color(BLUE), run_time=1.5)
        self.play(GrowArrow(n2), FadeIn(checks[2]), steps[2].animate.set_color(TEAL), run_time=1.5)
        self.play(GrowArrow(p2), FadeIn(checks[3]), steps[3].animate.set_color(TEAL), run_time=1.5)
        self.play(FadeIn(final, shift=UP * 0.15), run_time=0.8)
        self.wait(12.41)


class V05Scene07Tradeoff(Scene):
    # Target: 15.76s (from scene07-tradeoff.wav)
    def construct(self):
        bg = Rectangle(width=14.22, height=8, fill_color=BG, fill_opacity=1, stroke_width=0)
        title = Text("ميزة إضافية تعني كلفة إضافية", font_size=38, color=WHITE).to_edge(UP, buff=0.34)
        beam = Line(LEFT * 4.1 + DOWN * 0.6, RIGHT * 4.1 + DOWN * 0.6, color=WHITE, stroke_width=6)
        fulcrum = Triangle(color=AMBER, fill_color=AMBER, fill_opacity=1).scale(0.5).move_to(DOWN * 1.15)
        left_card = RoundedRectangle(width=4.1, height=2.0, corner_radius=0.18, fill_color="#164E63", fill_opacity=1, stroke_color=TEAL, stroke_width=3).shift(LEFT * 3.35 + UP * 1.05)
        right_card = RoundedRectangle(width=4.1, height=2.0, corner_radius=0.18, fill_color=PANEL, fill_opacity=1, stroke_color=AMBER, stroke_width=3).shift(RIGHT * 3.35 + UP * 1.05)
        fast_title = Text("عودة سريعة", font_size=30, color=WHITE).move_to(left_card.get_center() + UP * 0.28).set_z_index(5)
        fast_code = Text("prev", font_size=27, color=WHITE).move_to(left_card.get_center() + DOWN * 0.32).set_z_index(5)
        fast = VGroup(fast_title, fast_code)
        cost_top = Text("ذاكرة أكثر", font_size=29, color=WHITE).move_to(right_card.get_center() + UP * 0.28).set_z_index(5)
        cost_bottom = Text("وتحديثات أكثر", font_size=27, color=WHITE).move_to(right_card.get_center() + DOWN * 0.32).set_z_index(5)
        cost = VGroup(cost_top, cost_bottom)
        equation = Text("فائدة  ↔  كلفة", font_size=31, color=WHITE).next_to(beam, DOWN, buff=1.1)
        self.add(bg)
        self.play(Write(title), run_time=0.8)
        self.play(Create(beam), GrowFromCenter(fulcrum), run_time=1.5)
        self.play(FadeIn(left_card), FadeIn(fast), run_time=1.5)
        self.play(FadeIn(right_card), FadeIn(cost), run_time=1.5)
        self.play(Indicate(left_card, color=TEAL), Indicate(right_card, color=AMBER), FadeIn(equation), run_time=0.8)
        self.wait(9.66)


class V05Scene08Summary(Scene):
    # Target: 17.76s (from scene08-summary.wav)
    def construct(self):
        bg = Rectangle(width=14.22, height=8, fill_color=BG, fill_opacity=1, stroke_width=0)
        title = Text("الخلاصة: اختر الحركة التي تحتاجها", font_size=38, color=WHITE).to_edge(UP, buff=0.34)
        nodes = VGroup(*[Circle(radius=0.53, color=TEAL, fill_color=PANEL, fill_opacity=1, stroke_width=3) for _ in range(3)]).arrange(RIGHT, buff=1.75).shift(UP * 0.55)
        labels = VGroup(*[Text(v, font_size=27, color=WHITE).move_to(n) for v, n in zip(["10", "20", "30"], nodes)])
        nexts = VGroup(*[Arrow(nodes[i].get_right() + UP * 0.2, nodes[i + 1].get_left() + UP * 0.2, buff=0.08, color=BLUE, stroke_width=5, tip_length=0.16) for i in range(2)])
        prevs = VGroup(*[Arrow(nodes[i + 1].get_left() + DOWN * 0.2, nodes[i].get_right() + DOWN * 0.2, buff=0.08, color=PURPLE, stroke_width=5, tip_length=0.16) for i in range(2)])
        question = Text("أي رابط يعيدك إلى العقدة السابقة؟", font_size=33, color=AMBER).next_to(nodes, DOWN, buff=1.4)
        option_prev = RoundedRectangle(width=2.45, height=0.72, corner_radius=0.14, fill_color="#164E63", fill_opacity=1, stroke_color=PURPLE, stroke_width=3).next_to(question, DOWN, buff=0.55)
        answer = Text("prev", font_size=30, color=WHITE).move_to(option_prev)
        confirm = Text("✓ طريق العودة", font_size=28, color=TEAL).next_to(option_prev, DOWN, buff=0.35)
        self.add(bg)
        self.play(Write(title), run_time=0.8)
        self.play(FadeIn(nodes), FadeIn(labels), GrowArrow(nexts[0]), GrowArrow(nexts[1]), GrowArrow(prevs[0]), GrowArrow(prevs[1]), run_time=1.2)
        self.play(Indicate(prevs, color=PURPLE), run_time=1.0)
        self.play(FadeIn(question, shift=UP * 0.2), run_time=1.3)
        self.play(GrowFromCenter(option_prev), FadeIn(answer), run_time=1.4)
        self.play(FadeIn(confirm, shift=UP * 0.15), Indicate(option_prev, color=TEAL), run_time=0.8)
        self.wait(11.26)
