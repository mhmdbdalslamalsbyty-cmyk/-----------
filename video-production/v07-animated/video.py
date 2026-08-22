from manim import *


BG = "#071A2D"
PANEL = "#102C45"
TEAL = "#35D0BA"
CORAL = "#FF7B72"
IVORY = "#F7F2E7"
MUTED = "#9FB7C9"


class LinkedStackHook(Scene):
    # Target: 16.92s (from scene01-hook.wav)
    def construct(self):
        self.camera.background_color = BG
        band = Rectangle(width=14.22, height=0.78, fill_color=PANEL, fill_opacity=1, stroke_width=0).to_edge(UP)
        title = Text("المكدس بالقائمة المرتبطة", font_size=36, color=IVORY).move_to(band)
        badge = Text("V07", font_size=24, color=TEAL).to_corner(UR).shift(DOWN * 0.18 + LEFT * 0.25)
        self.play(FadeIn(band), Write(title), FadeIn(badge), run_time=1.2)

        question = Text("هل تتغيّر LIFO عندما يتغيّر التخزين؟", font_size=32, color=IVORY).next_to(band, DOWN, buff=0.55)
        self.play(FadeIn(question, shift=DOWN * 0.18), run_time=1.0)

        array_label = Text("Array Stack", font_size=26, color=MUTED).shift(LEFT * 3.8 + DOWN * 0.15)
        slots = VGroup(*[RoundedRectangle(width=1.05, height=0.7, corner_radius=0.08, stroke_color=TEAL, fill_color=PANEL, fill_opacity=1) for _ in range(3)]).arrange(DOWN, buff=0.09).next_to(array_label, DOWN, buff=0.25)
        full = Text("ممتلئ", font_size=24, color=CORAL).next_to(slots, DOWN, buff=0.22)
        self.play(Write(array_label), LaggedStart(*[Create(s) for s in slots], lag_ratio=0.2), FadeIn(full), run_time=2.5)

        linked_label = Text("Linked Stack", font_size=26, color=TEAL).shift(RIGHT * 3.4 + DOWN * 0.15)
        nodes = VGroup(*[RoundedRectangle(width=1.2, height=0.62, corner_radius=0.12, stroke_color=TEAL, fill_color="#174E62", fill_opacity=1) for _ in range(3)]).arrange(DOWN, buff=0.35).next_to(linked_label, DOWN, buff=0.25)
        links = VGroup(*[Arrow(nodes[i].get_bottom(), nodes[i + 1].get_top(), buff=0.06, color=TEAL, stroke_width=4, max_tip_length_to_length_ratio=0.18) for i in range(2)])
        self.play(Write(linked_label), LaggedStart(*[FadeIn(n) for n in nodes], lag_ratio=0.22), Create(links), run_time=2.5)

        lifo = Text("LIFO تبقى ثابتة", font_size=42, color=TEAL, weight=BOLD).move_to(DOWN * 2.95)
        self.play(Write(lifo), run_time=1.5)
        self.wait(8.22)


class HeadIsTop(Scene):
    # Target: 18.84s (from scene02-head-top.wav)
    def construct(self):
        self.camera.background_color = BG
        band = Rectangle(width=14.22, height=0.78, fill_color=PANEL, fill_opacity=1, stroke_width=0).to_edge(UP)
        title = Text("الرأس هو القمة", font_size=38, color=IVORY).move_to(band)
        self.play(FadeIn(band), Write(title), run_time=1.0)

        values = ["7", "4", "1"]
        nodes = VGroup()
        for value in values:
            box = RoundedRectangle(width=2.0, height=0.74, corner_radius=0.15, stroke_color=TEAL, fill_color="#174E62", fill_opacity=1)
            text = Text(value, font_size=34, color=IVORY).move_to(box)
            nodes.add(VGroup(box, text))
        nodes.arrange(DOWN, buff=0.42).shift(DOWN * 0.45)
        arrows = VGroup(*[Arrow(nodes[i].get_bottom(), nodes[i + 1].get_top(), buff=0.09, color=TEAL, stroke_width=4, max_tip_length_to_length_ratio=0.17) for i in range(2)])
        self.play(LaggedStart(*[FadeIn(n, shift=UP * 0.12) for n in nodes], lag_ratio=0.24), Create(arrows), run_time=2.0)

        head_arrow = Arrow(LEFT * 4.4 + UP * 0.55, nodes[0].get_left() + LEFT * 0.08, color=TEAL, stroke_width=5, max_tip_length_to_length_ratio=0.15)
        head = Text("head", font_size=34, color=TEAL, weight=BOLD).next_to(head_arrow, LEFT, buff=0.16)
        self.play(GrowArrow(head_arrow), Write(head), run_time=2.0)

        top = Text("top", font_size=34, color=CORAL, weight=BOLD).move_to(head)
        self.play(Transform(head, top), head_arrow.animate.set_color(CORAL), Circumscribe(nodes[0], color=CORAL), run_time=2.0)

        equation = Text("top  =  head", font_size=46, color=IVORY, weight=BOLD).move_to(RIGHT * 3.4 + DOWN * 1.0)
        self.play(Write(equation), run_time=1.5)
        self.play(Indicate(nodes[0], color=TEAL), Indicate(equation, color=TEAL), run_time=1.0)
        self.wait(9.34)


class PushAtHead(Scene):
    # Target: 16.16s (from scene03-push.wav)
    def construct(self):
        self.camera.background_color = BG
        band = Rectangle(width=14.22, height=0.78, fill_color=PANEL, fill_opacity=1, stroke_width=0).to_edge(UP)
        title = Text("Push عند الرأس", font_size=38, color=IVORY).move_to(band)
        self.play(FadeIn(band), Write(title), run_time=1.0)

        seven_box = RoundedRectangle(width=1.75, height=0.7, corner_radius=0.14, stroke_color=TEAL, fill_color="#174E62", fill_opacity=1).shift(DOWN * 0.35)
        four_box = seven_box.copy().shift(DOWN * 1.35)
        seven = Text("7", font_size=34, color=IVORY).move_to(seven_box)
        four = Text("4", font_size=34, color=IVORY).move_to(four_box)
        link = Arrow(seven_box.get_bottom(), four_box.get_top(), buff=0.08, color=TEAL, stroke_width=4, max_tip_length_to_length_ratio=0.17)
        old_head = Arrow(LEFT * 4.3 + DOWN * 0.1, seven_box.get_left(), color=TEAL, stroke_width=5, max_tip_length_to_length_ratio=0.15)
        old_head_text = Text("head", font_size=30, color=TEAL).next_to(old_head, LEFT, buff=0.1)
        self.play(FadeIn(seven_box), FadeIn(four_box), FadeIn(seven), FadeIn(four), Create(link), GrowArrow(old_head), Write(old_head_text), run_time=1.5)

        new_box = RoundedRectangle(width=1.75, height=0.7, corner_radius=0.14, stroke_color=CORAL, fill_color="#5B3543", fill_opacity=1).shift(LEFT * 4.2 + UP * 0.75)
        nine = Text("9", font_size=34, color=IVORY).move_to(new_box)
        new_label = Text("new node", font_size=24, color=CORAL).next_to(new_box, UP, buff=0.15)
        self.play(FadeIn(new_box, shift=RIGHT * 0.4), FadeIn(nine), Write(new_label), run_time=1.5)

        next_arrow = Arrow(new_box.get_bottom(), seven_box.get_top() + LEFT * 0.48, buff=0.12, color=CORAL, stroke_width=5, max_tip_length_to_length_ratio=0.16)
        next_text = Text("next", font_size=26, color=CORAL).next_to(next_arrow, LEFT, buff=0.08)
        self.play(GrowArrow(next_arrow), Write(next_text), run_time=1.5)

        self.play(new_box.animate.move_to(UP * 1.55), nine.animate.move_to(UP * 1.55), new_label.animate.next_to(UP * 1.55, UP, buff=0.14), run_time=0.8)
        new_link = Arrow(new_box.get_bottom(), seven_box.get_top(), buff=0.08, color=TEAL, stroke_width=4, max_tip_length_to_length_ratio=0.17)
        new_head = Arrow(LEFT * 4.3 + UP * 1.5, new_box.get_left(), color=TEAL, stroke_width=5, max_tip_length_to_length_ratio=0.15)
        self.play(Transform(old_head, new_head), old_head_text.animate.move_to(LEFT * 5.0 + UP * 1.5), Transform(next_arrow, new_link), FadeOut(next_text), run_time=0.8)

        steps = Text("1. أنشئ   2. اربط   3. حرّك head", font_size=30, color=IVORY).move_to(DOWN * 3.0)
        self.play(Write(steps), run_time=1.4)
        self.wait(7.66)


class LifoOrder(Scene):
    # Target: 17.96s (from scene04-lifo.wav)
    def construct(self):
        self.camera.background_color = BG
        band = Rectangle(width=14.22, height=0.78, fill_color=PANEL, fill_opacity=1, stroke_width=0).to_edge(UP)
        title = Text("لماذا تخرج 9 أولًا؟", font_size=38, color=IVORY).move_to(band)
        self.play(FadeIn(band), Write(title), run_time=1.0)

        nine_box = RoundedRectangle(width=2.2, height=0.78, corner_radius=0.15, stroke_color=CORAL, fill_color="#5B3543", fill_opacity=1).shift(UP * 1.0)
        seven_box = RoundedRectangle(width=2.2, height=0.78, corner_radius=0.15, stroke_color=TEAL, fill_color="#174E62", fill_opacity=1).shift(DOWN * 0.15)
        nine = Text("9", font_size=38, color=IVORY).move_to(nine_box)
        seven = Text("7", font_size=38, color=IVORY).move_to(seven_box)
        link = Arrow(nine_box.get_bottom(), seven_box.get_top(), buff=0.1, color=TEAL, stroke_width=4, max_tip_length_to_length_ratio=0.17)
        top_label = Text("top", font_size=30, color=CORAL).next_to(nine_box, RIGHT, buff=0.4)
        self.play(FadeIn(nine_box), FadeIn(seven_box), Write(nine), Write(seven), Create(link), Write(top_label), run_time=2.0)

        self.play(Circumscribe(nine_box, color=CORAL), Indicate(top_label, color=CORAL), run_time=1.5)

        bad_arrow = Arrow(RIGHT * 4.7 + DOWN * 0.15, seven_box.get_right(), color=CORAL, stroke_width=5, max_tip_length_to_length_ratio=0.15)
        bad = Text("لا تقفز إلى 7", font_size=29, color=CORAL).next_to(bad_arrow, RIGHT, buff=0.12)
        self.play(GrowArrow(bad_arrow), FadeIn(bad), run_time=1.5)
        self.play(FadeOut(bad_arrow), FadeOut(bad), Wiggle(nine_box, scale_value=1.05), run_time=1.5)

        rule = Text("آخر داخل  ←  أول خارج", font_size=46, color=TEAL, weight=BOLD).move_to(DOWN * 2.55)
        self.play(Write(rule), run_time=1.5)
        self.play(nine_box.animate.set_fill(TEAL).set_stroke(TEAL), nine.animate.set_color(BG), run_time=1.0)
        self.wait(7.887)


class PopAtHead(Scene):
    # Target: 17.96s (from scene05-pop.wav)
    def construct(self):
        self.camera.background_color = BG
        band = Rectangle(width=14.22, height=0.78, fill_color=PANEL, fill_opacity=1, stroke_width=0).to_edge(UP)
        title = Text("Pop يعود من القمة", font_size=38, color=IVORY).move_to(band)
        self.play(FadeIn(band), Write(title), run_time=1.0)

        nine_box = RoundedRectangle(width=2.0, height=0.74, corner_radius=0.14, stroke_color=CORAL, fill_color="#5B3543", fill_opacity=1).shift(UP * 1.05)
        seven_box = RoundedRectangle(width=2.0, height=0.74, corner_radius=0.14, stroke_color=TEAL, fill_color="#174E62", fill_opacity=1).shift(DOWN * 0.08)
        four_box = seven_box.copy().shift(DOWN * 1.13)
        nine = Text("9", font_size=36, color=IVORY).move_to(nine_box)
        seven = Text("7", font_size=36, color=IVORY).move_to(seven_box)
        four = Text("4", font_size=36, color=IVORY).move_to(four_box)
        links = VGroup(Arrow(nine_box.get_bottom(), seven_box.get_top(), buff=0.08, color=TEAL, stroke_width=4, max_tip_length_to_length_ratio=0.17), Arrow(seven_box.get_bottom(), four_box.get_top(), buff=0.08, color=TEAL, stroke_width=4, max_tip_length_to_length_ratio=0.17))
        self.play(FadeIn(nine_box), FadeIn(seven_box), FadeIn(four_box), Write(nine), Write(seven), Write(four), Create(links), run_time=2.5)

        top_arrow = Arrow(LEFT * 4.4 + UP * 1.0, nine_box.get_left(), color=CORAL, stroke_width=5, max_tip_length_to_length_ratio=0.15)
        top_word = Text("head", font_size=30, color=CORAL).next_to(top_arrow, LEFT, buff=0.1)
        self.play(GrowArrow(top_arrow), Write(top_word), run_time=1.5)

        saved = RoundedRectangle(width=2.5, height=0.7, corner_radius=0.12, stroke_color=CORAL, fill_color="#352237", fill_opacity=1).shift(RIGHT * 4.2 + UP * 1.05)
        saved_text = Text("احفظ 9", font_size=29, color=IVORY).move_to(saved)
        self.play(FadeIn(saved), Write(saved_text), run_time=1.3)

        target_arrow = Arrow(LEFT * 4.4 + DOWN * 0.08, seven_box.get_left(), color=TEAL, stroke_width=5, max_tip_length_to_length_ratio=0.15)
        self.play(Transform(top_arrow, target_arrow), top_word.animate.move_to(LEFT * 5.0 + DOWN * 0.08).set_color(TEAL), run_time=1.5)
        self.play(FadeOut(nine_box, shift=RIGHT * 2.5), FadeOut(nine), FadeOut(links[0]), saved.animate.set_color(TEAL), run_time=1.5)
        self.wait(8.66)


class PeekKeepsStructure(Scene):
    # Target: 15.12s (from scene06-peek.wav)
    def construct(self):
        self.camera.background_color = BG
        band = Rectangle(width=14.22, height=0.78, fill_color=PANEL, fill_opacity=1, stroke_width=0).to_edge(UP)
        title = Text("Peek ينظر فقط", font_size=38, color=IVORY).move_to(band)
        self.play(FadeIn(band), Write(title), run_time=1.0)

        seven_box = RoundedRectangle(width=2.2, height=0.78, corner_radius=0.15, stroke_color=TEAL, fill_color="#174E62", fill_opacity=1).shift(UP * 0.45)
        four_box = seven_box.copy().shift(DOWN * 1.2)
        seven = Text("7", font_size=38, color=IVORY).move_to(seven_box)
        four = Text("4", font_size=38, color=IVORY).move_to(four_box)
        link = Arrow(seven_box.get_bottom(), four_box.get_top(), buff=0.08, color=TEAL, stroke_width=4, max_tip_length_to_length_ratio=0.17)
        head = Arrow(LEFT * 4.1 + UP * 0.45, seven_box.get_left(), color=TEAL, stroke_width=5, max_tip_length_to_length_ratio=0.15)
        self.play(FadeIn(seven_box), FadeIn(four_box), Write(seven), Write(four), Create(link), GrowArrow(head), run_time=2.0)

        lens = Circle(radius=0.72, stroke_color=CORAL, stroke_width=6).move_to(seven_box)
        peek = Text("Peek → 7", font_size=35, color=CORAL, weight=BOLD).move_to(RIGHT * 3.8 + UP * 0.5)
        self.play(Create(lens), Write(peek), run_time=1.2)

        no_delete = Text("لا حذف · لا تحريك للرأس", font_size=32, color=TEAL).move_to(DOWN * 2.35)
        self.play(Write(no_delete), Circumscribe(seven_box, color=TEAL), run_time=1.3)
        self.play(lens.animate.set_stroke(TEAL), Indicate(link, color=TEAL), run_time=1.2)
        self.wait(8.42)


class Tradeoff(Scene):
    # Target: 17.32s (from scene07-tradeoff.wav)
    def construct(self):
        self.camera.background_color = BG
        band = Rectangle(width=14.22, height=0.78, fill_color=PANEL, fill_opacity=1, stroke_width=0).to_edge(UP)
        title = Text("مرونة مقابل رابط إضافي", font_size=38, color=IVORY).move_to(band)
        self.play(FadeIn(band), Write(title), run_time=1.0)

        left_panel = RoundedRectangle(width=5.5, height=5.2, corner_radius=0.18, stroke_color=MUTED, fill_color="#0B2236", fill_opacity=1).shift(LEFT * 3.55 + DOWN * 0.45)
        right_panel = left_panel.copy().shift(RIGHT * 7.1)
        left_title = Text("Array Stack", font_size=30, color=IVORY).next_to(left_panel, UP, buff=0.15)
        right_title = Text("Linked Stack", font_size=30, color=TEAL).next_to(right_panel, UP, buff=0.15)
        self.play(FadeIn(left_panel), FadeIn(right_panel), Write(left_title), Write(right_title), run_time=1.5)

        blocks = VGroup(*[Square(side_length=0.75, stroke_color=TEAL, fill_color="#174E62", fill_opacity=1) for _ in range(4)]).arrange(DOWN, buff=0.12).move_to(left_panel.get_center() + DOWN * 0.15)
        self.play(LaggedStart(*[Create(b) for b in blocks], lag_ratio=0.15), run_time=1.5)

        full = Text("سعة ثابتة", font_size=28, color=CORAL).next_to(blocks, DOWN, buff=0.3)
        self.play(Write(full), Indicate(blocks[-1], color=CORAL), run_time=1.2)

        nodes = VGroup(*[RoundedRectangle(width=1.55, height=0.58, corner_radius=0.12, stroke_color=TEAL, fill_color="#174E62", fill_opacity=1) for _ in range(4)]).arrange(DOWN, buff=0.34).move_to(right_panel.get_center() + DOWN * 0.1)
        arrows = VGroup(*[Arrow(nodes[i].get_bottom(), nodes[i + 1].get_top(), buff=0.07, color=TEAL, stroke_width=3, max_tip_length_to_length_ratio=0.17) for i in range(3)])
        self.play(LaggedStart(*[FadeIn(n, shift=UP * 0.08) for n in nodes], lag_ratio=0.18), Create(arrows), run_time=1.6)

        next_tags = VGroup(*[Text("next", font_size=20, color=CORAL).next_to(a, RIGHT, buff=0.05) for a in arrows])
        self.play(LaggedStart(*[FadeIn(t) for t in next_tags], lag_ratio=0.16), run_time=1.5)

        trade = Text("المرونة تحتاج رابطًا لكل عقدة", font_size=31, color=IVORY).move_to(DOWN * 3.2)
        self.play(Write(trade), run_time=1.3)
        self.wait(7.72)


class LinkedStackSummary(Scene):
    # Target: 21.00s (from scene08-summary.wav)
    def construct(self):
        self.camera.background_color = BG
        band = Rectangle(width=14.22, height=0.78, fill_color=PANEL, fill_opacity=1, stroke_width=0).to_edge(UP)
        title = Text("الخلاصة", font_size=40, color=IVORY).move_to(band)
        self.play(FadeIn(band), Write(title), run_time=1.0)

        rule = Text("LIFO قاعدة", font_size=46, color=TEAL, weight=BOLD).shift(UP * 2.1)
        representation = Text("والتمثيل يغيّر المقايضة", font_size=34, color=IVORY).next_to(rule, DOWN, buff=0.28)
        self.play(Write(rule), FadeIn(representation, shift=UP * 0.12), run_time=1.5)

        boxes = VGroup()
        labels = ["9", "7", "4"]
        for label in labels:
            box = RoundedRectangle(width=1.75, height=0.62, corner_radius=0.13, stroke_color=TEAL, fill_color="#174E62", fill_opacity=1)
            box.add(Text(label, font_size=30, color=IVORY).move_to(box))
            boxes.add(box)
        boxes.arrange(DOWN, buff=0.34).shift(LEFT * 2.6 + DOWN * 0.55)
        arrows = VGroup(*[Arrow(boxes[i].get_bottom(), boxes[i + 1].get_top(), buff=0.08, color=TEAL, stroke_width=4, max_tip_length_to_length_ratio=0.17) for i in range(2)])
        top = Arrow(LEFT * 5.45 + DOWN * 0.55, boxes[0].get_left(), color=CORAL, stroke_width=5, max_tip_length_to_length_ratio=0.15)
        top_text = Text("head = top", font_size=28, color=CORAL).next_to(top, LEFT, buff=0.1)
        self.play(LaggedStart(*[FadeIn(b) for b in boxes], lag_ratio=0.18), Create(arrows), GrowArrow(top), Write(top_text), run_time=2.0)

        actions = VGroup(
            RoundedRectangle(width=2.25, height=0.7, corner_radius=0.14, stroke_color=TEAL, fill_color=PANEL, fill_opacity=1),
            RoundedRectangle(width=2.25, height=0.7, corner_radius=0.14, stroke_color=CORAL, fill_color=PANEL, fill_opacity=1),
            RoundedRectangle(width=2.25, height=0.7, corner_radius=0.14, stroke_color=IVORY, fill_color=PANEL, fill_opacity=1),
        ).arrange(DOWN, buff=0.3).shift(RIGHT * 3.5 + DOWN * 0.45)
        action_texts = VGroup(Text("Push", font_size=30, color=TEAL).move_to(actions[0]), Text("Pop", font_size=30, color=CORAL).move_to(actions[1]), Text("Peek", font_size=30, color=IVORY).move_to(actions[2]))
        self.play(LaggedStart(*[FadeIn(a) for a in actions], lag_ratio=0.2), LaggedStart(*[Write(t) for t in action_texts], lag_ratio=0.2), run_time=1.8)

        self.play(Indicate(actions[0], color=TEAL), Indicate(actions[1], color=CORAL), Indicate(actions[2], color=IVORY), run_time=1.5)

        question = Text("ما الذي تغيّر: القاعدة أم التمثيل؟", font_size=36, color=IVORY, weight=BOLD).move_to(DOWN * 3.0)
        self.play(Write(question), run_time=1.5)
        self.wait(11.7)
