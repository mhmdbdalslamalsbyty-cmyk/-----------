from manim import *


BG = "#071A2B"
PANEL = "#0E2B40"
TEAL = "#21C6B7"
GOLD = "#F6C85F"
CORAL = "#F07C65"
INK = "#EAF6F5"
MUTED = "#A6C5C6"
AR_FONT = "Noto Sans Arabic"


class V03Scene01Cards(Scene):
    # Target: 15.36s (from scene01-hook.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("القائمة المرتبطة الأحادية", font=AR_FONT, font_size=42, color=INK).to_edge(UP, buff=0.35)
        subtitle = Text("بطاقات متباعدة… لكنها تعرف الطريق", font=AR_FONT, font_size=25, color=MUTED).next_to(title, DOWN, buff=0.15)
        labels = [("10", LEFT * 4.8 + DOWN * 0.6), ("20", UP * 1.1), ("30", RIGHT * 4.7 + DOWN * 0.4)]
        cards = VGroup()
        for value, pos in labels:
            card = RoundedRectangle(corner_radius=0.18, width=1.6, height=1.0, color=TEAL, fill_color=PANEL, fill_opacity=1.0, stroke_width=3).move_to(pos)
            text = Text(value, font_size=34, color=INK, weight=BOLD).move_to(card)
            cards.add(VGroup(card, text))
        arrows = VGroup(
            CurvedArrow(cards[0].get_right(), cards[1].get_left(), angle=-0.35, color=TEAL, stroke_width=5, tip_length=0.18),
            CurvedArrow(cards[1].get_right(), cards[2].get_left(), angle=0.32, color=TEAL, stroke_width=5, tip_length=0.18),
        )
        note = Text("كل بطاقة تحمل قيمة ورسالة انتقال", font=AR_FONT, font_size=27, color=GOLD).to_edge(DOWN, buff=0.55)
        self.play(Write(title), FadeIn(subtitle, shift=UP * 0.15), run_time=1.7)
        self.play(LaggedStart(*[FadeIn(card, scale=0.85) for card in cards], lag_ratio=0.22), run_time=2.6)
        self.play(LaggedStart(*[Create(arrow) for arrow in arrows], lag_ratio=0.3), run_time=2.0)
        self.play(cards[0].animate.shift(UP * 0.5), cards[1].animate.shift(DOWN * 0.35), cards[2].animate.shift(UP * 0.35), run_time=2.0)
        self.play(Write(note), run_time=1.6)
        self.play(Indicate(cards[0][0], color=GOLD, scale_factor=1.08), Indicate(cards[1][0], color=GOLD, scale_factor=1.08), Indicate(cards[2][0], color=GOLD, scale_factor=1.08), run_time=1.6)
        self.wait(3.96)


class V03Scene02Node(Scene):
    # Target: 16.48s (from scene02-node.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("ما داخل العقدة؟", font=AR_FONT, font_size=42, color=INK).to_edge(UP, buff=0.35)
        outer = RoundedRectangle(corner_radius=0.28, width=7.0, height=2.25, color=TEAL, fill_color=PANEL, fill_opacity=1.0, stroke_width=4).shift(UP * 0.2)
        value_box = RoundedRectangle(corner_radius=0.16, width=2.65, height=1.45, color=TEAL, fill_color="#12384D", fill_opacity=1.0, stroke_width=2).move_to(outer.get_center() + LEFT * 1.75)
        next_box = RoundedRectangle(corner_radius=0.16, width=2.65, height=1.45, color=TEAL, fill_color="#12384D", fill_opacity=1.0, stroke_width=2).move_to(outer.get_center() + RIGHT * 1.75)
        value_label = Text("قيمة", font=AR_FONT, font_size=27, color=INK).move_to(value_box.get_center() + UP * 0.35)
        value = Text("20", font_size=40, color=GOLD, weight=BOLD).move_to(value_box.get_center() + DOWN * 0.28)
        next_label = Text("رابط تالٍ", font=AR_FONT, font_size=24, color=INK).move_to(next_box.get_center() + UP * 0.35)
        next_code = Text("next", font_size=34, color=TEAL, weight=BOLD).move_to(next_box.get_center() + DOWN * 0.28)
        target = RoundedRectangle(corner_radius=0.15, width=1.65, height=1.0, color=TEAL, fill_color=PANEL, fill_opacity=1.0, stroke_width=3).move_to(RIGHT * 5.0 + DOWN * 1.55)
        target_text = Text("30", font_size=34, color=INK).move_to(target)
        arrow = CurvedArrow(outer.get_right() + DOWN * 0.2, target.get_top() + LEFT * 0.25, angle=-0.55, color=GOLD, stroke_width=5, tip_length=0.2)
        caption = Text("الرابط يدل على مكان العقدة التالية", font=AR_FONT, font_size=27, color=MUTED).to_edge(DOWN, buff=0.45)
        self.play(Write(title), run_time=1.2)
        self.play(GrowFromCenter(outer), run_time=1.5)
        self.play(FadeIn(value_box, scale=0.92), FadeIn(next_box, scale=0.92), FadeIn(value_label), FadeIn(next_label), run_time=1.5)
        self.play(FadeIn(value, scale=0.8), FadeIn(next_code, scale=0.8), run_time=1.3)
        self.play(Indicate(next_code, color=GOLD, scale_factor=1.15), run_time=1.0)
        self.play(FadeIn(target, scale=0.85), FadeIn(target_text), Create(arrow), run_time=2.0)
        self.play(arrow.animate.set_color(TEAL), run_time=0.8)
        self.play(Write(caption), run_time=1.4)
        self.play(Indicate(target, color=GOLD, scale_factor=1.1), run_time=1.0)
        self.wait(4.78)


class V03Scene03Head(Scene):
    # Target: 11.44s (from scene03-head.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("البداية اسمها head", font=AR_FONT, font_size=42, color=INK).to_edge(UP, buff=0.35)
        xs = [-3.8, 0, 3.8]
        nodes = VGroup()
        for value, x in zip([10, 20, 30], xs):
            box = RoundedRectangle(corner_radius=0.16, width=1.55, height=0.95, color=TEAL, fill_color=PANEL, fill_opacity=1.0, stroke_width=3).move_to(RIGHT * x + DOWN * 0.25)
            nodes.add(VGroup(box, Text(str(value), font_size=32, color=INK).move_to(box)))
        arrows = VGroup(*[Arrow(nodes[i].get_right(), nodes[i + 1].get_left(), buff=0.18, color=TEAL, stroke_width=5, tip_length=0.18) for i in range(2)])
        head = VGroup(RoundedRectangle(corner_radius=0.18, width=1.55, height=0.62, color=GOLD, fill_color="#5C4818", fill_opacity=1.0, stroke_width=3), Text("head", font_size=27, color=GOLD, weight=BOLD)).move_to(nodes[0].get_top() + UP * 1.1)
        head_arrow = Arrow(head.get_bottom(), nodes[0].get_top(), color=GOLD, stroke_width=4, tip_length=0.16)
        steps = VGroup(*[Text(s, font=AR_FONT, font_size=24, color=c) for s, c in [("١. ابدأ", GOLD), ("٢. اقرأ القيمة", INK), ("٣. اتبع السهم", TEAL)]]).arrange(RIGHT, buff=0.55).to_edge(DOWN, buff=0.6)
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[FadeIn(n, shift=UP * 0.18) for n in nodes], lag_ratio=0.16), run_time=1.4)
        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.2), run_time=1.1)
        self.play(FadeIn(head, shift=DOWN * 0.2), GrowArrow(head_arrow), run_time=1.2)
        self.play(Flash(nodes[0].get_center(), color=GOLD, flash_radius=0.8), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(s, shift=UP * 0.1) for s in steps], lag_ratio=0.25), run_time=1.5)
        self.play(Indicate(arrows[0], color=GOLD, scale_factor=1.03), run_time=0.7)
        self.wait(3.74)


class V03Scene04Flexibility(Scene):
    # Target: 12.48s (from scene04-flexibility.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("متباعدة… لكن مترابطة", font=AR_FONT, font_size=42, color=INK).to_edge(UP, buff=0.35)
        memory = Text("الذاكرة", font=AR_FONT, font_size=25, color=MUTED).to_corner(UL, buff=0.55)
        positions = [LEFT * 4.5 + DOWN * 1.3, LEFT * 0.5 + UP * 1.0, RIGHT * 4.5 + DOWN * 0.25]
        targets = [LEFT * 3.8 + DOWN * 0.25, DOWN * 0.25, RIGHT * 3.8 + DOWN * 0.25]
        nodes = VGroup()
        for value, pos in zip([10, 20, 30], positions):
            b = RoundedRectangle(corner_radius=0.16, width=1.55, height=0.95, color=TEAL, fill_color=PANEL, fill_opacity=1.0, stroke_width=3).move_to(pos)
            nodes.add(VGroup(b, Text(str(value), font_size=32, color=INK).move_to(b)))
        arrows = VGroup(
            CurvedArrow(nodes[0].get_right(), nodes[1].get_left(), angle=-0.55, color=TEAL, stroke_width=5, tip_length=0.18),
            CurvedArrow(nodes[1].get_right(), nodes[2].get_left(), angle=0.45, color=TEAL, stroke_width=5, tip_length=0.18),
        )
        link_word = Text("الرابط يصنع القائمة", font=AR_FONT, font_size=31, color=GOLD).to_edge(DOWN, buff=0.55)
        self.play(Write(title), FadeIn(memory), run_time=1.2)
        self.play(LaggedStart(*[FadeIn(n, scale=0.85) for n in nodes], lag_ratio=0.2), run_time=1.8)
        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.25), run_time=1.6)
        self.play(Indicate(arrows[0], color=GOLD, scale_factor=1.04), Indicate(arrows[1], color=GOLD, scale_factor=1.04), run_time=1.0)
        new_nodes = VGroup(*[n.copy().move_to(t) for n, t in zip(nodes, targets)])
        new_arrows = VGroup(*[Arrow(new_nodes[i].get_right(), new_nodes[i + 1].get_left(), buff=0.18, color=TEAL, stroke_width=5, tip_length=0.18) for i in range(2)])
        self.play(Transform(nodes, new_nodes), Transform(arrows, new_arrows), run_time=2.3)
        self.play(Write(link_word), run_time=1.2)
        self.wait(3.38)


class V03Scene05Search(Scene):
    # Target: 14.48s (from scene05-search.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("البحث: خطوة بعد خطوة", font=AR_FONT, font_size=42, color=INK).to_edge(UP, buff=0.35)
        nodes = VGroup()
        for value, x in zip([10, 20, 30], [-3.8, 0, 3.8]):
            b = RoundedRectangle(corner_radius=0.16, width=1.55, height=0.95, color=TEAL, fill_color=PANEL, fill_opacity=1.0, stroke_width=3).move_to(RIGHT * x + DOWN * 0.2)
            nodes.add(VGroup(b, Text(str(value), font_size=32, color=INK).move_to(b)))
        arrows = VGroup(*[Arrow(nodes[i].get_right(), nodes[i + 1].get_left(), buff=0.18, color=TEAL, stroke_width=5, tip_length=0.18) for i in range(2)])
        current = VGroup(RoundedRectangle(corner_radius=0.14, width=1.75, height=0.55, color=CORAL, fill_color="#552E35", fill_opacity=1.0, stroke_width=3), Text("current", font_size=22, color=CORAL, weight=BOLD)).move_to(nodes[0].get_bottom() + DOWN * 0.8)
        code = Text("current = current.next", font_size=28, color=GOLD).to_edge(DOWN, buff=0.45)
        goal = Text("ابحث عن 30", font=AR_FONT, font_size=27, color=MUTED).next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(goal), run_time=1.2)
        self.play(LaggedStart(*[FadeIn(n, shift=UP * 0.15) for n in nodes], lag_ratio=0.18), LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.18), run_time=1.8)
        self.play(FadeIn(current), run_time=1.0)
        self.play(Indicate(nodes[0], color=CORAL, scale_factor=1.06), run_time=1.0)
        self.play(Write(code), run_time=1.0)
        self.play(current.animate.move_to(nodes[1].get_bottom() + DOWN * 0.8), Indicate(arrows[0], color=GOLD), run_time=1.7)
        self.play(Indicate(nodes[1], color=CORAL, scale_factor=1.06), run_time=1.0)
        self.play(current.animate.move_to(nodes[2].get_bottom() + DOWN * 0.8), Indicate(arrows[1], color=GOLD), run_time=1.7)
        self.play(Indicate(nodes[2], color=GOLD, scale_factor=1.14), run_time=1.0)
        self.wait(2.78)


class V03Scene06Linear(Scene):
    # Target: 15.12s (from scene06-linear-search.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("لا توجد قفزة مباشرة", font=AR_FONT, font_size=42, color=INK).to_edge(UP, buff=0.35)
        nodes = VGroup()
        for index, x in enumerate([-4.6, -2.3, 0, 2.3, 4.6], start=1):
            b = RoundedRectangle(corner_radius=0.13, width=1.25, height=0.82, color=TEAL, fill_color=PANEL, fill_opacity=1.0, stroke_width=2.5).move_to(RIGHT * x + DOWN * 0.25)
            nodes.add(VGroup(b, Text(str(index), font_size=27, color=INK).move_to(b)))
        arrows = VGroup(*[Arrow(nodes[i].get_right(), nodes[i + 1].get_left(), buff=0.12, color=TEAL, stroke_width=4, tip_length=0.14) for i in range(4)])
        jump = CurvedArrow(nodes[0].get_top(), nodes[4].get_top(), angle=-1.3, color=CORAL, stroke_width=5, tip_length=0.18)
        no = Text("لا قفزة", font=AR_FONT, font_size=26, color=CORAL, weight=BOLD).next_to(jump, UP, buff=0.05)
        cross = Cross(jump, stroke_color=CORAL, stroke_width=8)
        cursor = Dot(nodes[0].get_bottom() + DOWN * 0.65, radius=0.14, color=GOLD)
        counter = Text("خطوة 1", font=AR_FONT, font_size=27, color=GOLD).to_edge(DOWN, buff=0.55)
        complexity = Text("O(n)  قد نمر عبر كل العقد", font=AR_FONT, font_size=30, color=INK).next_to(title, DOWN, buff=0.18)
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[FadeIn(n, scale=0.9) for n in nodes], lag_ratio=0.13), LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.1), run_time=1.7)
        self.play(Create(jump), Write(no), run_time=1.2)
        self.play(Create(cross), run_time=0.7)
        self.play(FadeOut(jump), FadeOut(no), FadeOut(cross), FadeIn(cursor), FadeIn(counter), run_time=1.0)
        for i in range(1, 5):
            new_counter = Text(f"خطوة {i + 1}", font=AR_FONT, font_size=27, color=GOLD).move_to(counter)
            self.play(cursor.animate.move_to(nodes[i].get_bottom() + DOWN * 0.65), Transform(counter, new_counter), Indicate(arrows[i - 1], color=GOLD), run_time=0.75)
        self.play(Write(complexity), run_time=1.1)
        self.wait(5.14)


class V03Scene07Null(Scene):
    # Target: 15.56s (from scene07-null.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("توقف آمن عند null", font=AR_FONT, font_size=42, color=INK).to_edge(UP, buff=0.35)
        nodes = VGroup()
        for value, x in zip([10, 20, 30], [-3.8, 0, 3.8]):
            b = RoundedRectangle(corner_radius=0.16, width=1.55, height=0.95, color=TEAL, fill_color=PANEL, fill_opacity=1.0, stroke_width=3).move_to(RIGHT * x + DOWN * 0.2)
            nodes.add(VGroup(b, Text(str(value), font_size=32, color=INK).move_to(b)))
        arrows = VGroup(*[Arrow(nodes[i].get_right(), nodes[i + 1].get_left(), buff=0.18, color=TEAL, stroke_width=5, tip_length=0.18) for i in range(2)])
        null = VGroup(Circle(radius=0.48, color=GOLD, fill_color="#5C4818", fill_opacity=1.0, stroke_width=3), Text("null", font_size=26, color=GOLD, weight=BOLD)).move_to(RIGHT * 6.0 + DOWN * 0.2)
        last_arrow = Arrow(nodes[2].get_right(), null.get_left(), buff=0.15, color=GOLD, stroke_width=5, tip_length=0.18)
        current = Dot(nodes[0].get_bottom() + DOWN * 0.65, radius=0.15, color=CORAL)
        guard = RoundedRectangle(corner_radius=0.18, width=5.5, height=0.78, color=CORAL, fill_color="#552E35", fill_opacity=1.0, stroke_width=3).to_edge(DOWN, buff=0.52)
        guard_text = Text("افحص null قبل اتباع next", font=AR_FONT, font_size=27, color=INK).move_to(guard)
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[FadeIn(n, shift=UP * 0.1) for n in nodes], lag_ratio=0.15), LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.18), run_time=1.5)
        self.play(FadeIn(null, scale=0.8), GrowArrow(last_arrow), run_time=1.0)
        self.play(FadeIn(current), run_time=0.5)
        self.play(current.animate.move_to(nodes[1].get_bottom() + DOWN * 0.65), Indicate(arrows[0], color=CORAL), run_time=1.1)
        self.play(current.animate.move_to(nodes[2].get_bottom() + DOWN * 0.65), Indicate(arrows[1], color=CORAL), run_time=1.1)
        self.play(current.animate.move_to(null.get_bottom() + DOWN * 0.65), Indicate(last_arrow, color=CORAL), run_time=1.1)
        self.play(Flash(null.get_center(), color=GOLD, flash_radius=0.7), run_time=0.7)
        self.play(FadeIn(guard, shift=UP * 0.15), Write(guard_text), run_time=1.2)
        self.wait(6.46)


class V03Scene08Summary(Scene):
    # Target: 16.24s (from scene08-summary.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("الخلاصة", font=AR_FONT, font_size=44, color=INK).to_edge(UP, buff=0.35)
        nodes = VGroup()
        for value, x in zip([10, 20, 30], [-3.8, 0, 3.8]):
            b = RoundedRectangle(corner_radius=0.16, width=1.55, height=0.95, color=TEAL, fill_color=PANEL, fill_opacity=1.0, stroke_width=3).move_to(RIGHT * x + UP * 0.55)
            nodes.add(VGroup(b, Text(str(value), font_size=32, color=INK).move_to(b)))
        arrows = VGroup(*[Arrow(nodes[i].get_right(), nodes[i + 1].get_left(), buff=0.18, color=TEAL, stroke_width=5, tip_length=0.18) for i in range(2)])
        head = Text("head", font_size=28, color=GOLD, weight=BOLD).next_to(nodes[0], UP, buff=0.35)
        facts = VGroup(
            Text("قيمة + next", font_size=29, color=TEAL, weight=BOLD),
            Text("ابدأ من head", font_size=29, color=GOLD, weight=BOLD),
            Text("اتبع الروابط", font=AR_FONT, font_size=29, color=INK, weight=BOLD),
        ).arrange(RIGHT, buff=0.75).move_to(DOWN * 0.9)
        question = Text("ماذا تخزّن العقدة الأحادية؟", font=AR_FONT, font_size=35, color=INK, weight=BOLD).to_edge(DOWN, buff=1.15)
        answer = VGroup(RoundedRectangle(corner_radius=0.18, width=5.2, height=0.75, color=GOLD, fill_color="#5C4818", fill_opacity=1.0, stroke_width=3), Text("قيمة ومؤشر next", font=AR_FONT, font_size=29, color=INK, weight=BOLD)).to_edge(DOWN, buff=0.35)
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[FadeIn(n, scale=0.88) for n in nodes], lag_ratio=0.16), LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.2), run_time=1.7)
        self.play(FadeIn(head, shift=DOWN * 0.1), run_time=0.7)
        self.play(LaggedStart(*[FadeIn(f, shift=UP * 0.1) for f in facts], lag_ratio=0.28), run_time=1.8)
        self.play(Indicate(nodes[0], color=GOLD, scale_factor=1.06), Indicate(arrows[0], color=GOLD), run_time=1.0)
        self.play(Write(question), run_time=1.5)
        self.play(FadeIn(answer, scale=0.9), run_time=1.3)
        self.play(Indicate(answer[0], color=TEAL, scale_factor=1.04), run_time=0.9)
        self.wait(6.34)
