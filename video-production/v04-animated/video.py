from manim import *


BG = "#071A2B"
INK = "#F4F1DE"
TEAL = "#16B8B1"
ORANGE = "#F4A261"
GREEN = "#6ED6A8"
CORAL = "#F07167"
MUTED = "#9FB3C8"


class V04Scene01Hook(Scene):
    # Target: 16.64s (from scene01-hook.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("كيف نضيف عقدة من دون أن نضيع السلسلة؟", color=INK, font_size=36).to_edge(UP)
        self.play(Write(title), run_time=1.2)
        def node(value, color=TEAL):
            box = RoundedRectangle(width=1.8, height=1.25, corner_radius=0.18, color=color, stroke_width=4)
            value_t = Text(value, color=INK, font_size=34).move_to(box.get_left() + RIGHT * 0.55)
            next_t = Text("next", color=MUTED, font_size=22).move_to(box.get_right() + LEFT * 0.42)
            divider = Line(box.get_top() + DOWN * 0.2 + RIGHT * 0.2, box.get_bottom() + UP * 0.2 + RIGHT * 0.2, color=color)
            return VGroup(box, value_t, next_t, divider)
        nodes = VGroup(node("10"), node("20"), node("30")).arrange(RIGHT, buff=0.7).shift(DOWN * 0.35)
        arrows = VGroup(*[Arrow(nodes[i].get_right(), nodes[i + 1].get_left(), buff=0.1, color=TEAL, stroke_width=5) for i in range(2)])
        self.play(LaggedStart(*[FadeIn(n, shift=UP * 0.25) for n in nodes], lag_ratio=0.2), run_time=2.2)
        self.play(LaggedStart(*[GrowArrow(a) for a in arrows], lag_ratio=0.2), run_time=1.6)
        head = Text("head", color=ORANGE, font_size=30).next_to(nodes[0], UP, buff=0.6)
        head_arrow = Arrow(head.get_bottom(), nodes[0].get_top(), buff=0.1, color=ORANGE, stroke_width=5)
        self.play(FadeIn(head), GrowArrow(head_arrow), run_time=1.6)
        fresh = node("5", ORANGE).scale(0.92).next_to(nodes[0], LEFT, buff=1.0)
        fresh_label = Text("newNode", color=ORANGE, font_size=28).next_to(fresh, DOWN, buff=0.25)
        self.play(FadeIn(fresh, shift=LEFT * 0.3), FadeIn(fresh_label), run_time=1.6)
        prompt = Text("أين نضع العقدة الجديدة من دون قطع الطريق؟", color=INK, font_size=30).next_to(nodes, DOWN, buff=1.15)
        self.play(Write(prompt), run_time=2.0)
        self.wait(6.48)


class V04Scene02Before(Scene):
    # Target: 17.64s (from scene02-before.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("قبل التغيير: الطريق يبدأ من head", color=INK, font_size=36).to_edge(UP)
        self.play(Write(title), run_time=1.2)
        def node(value):
            box = RoundedRectangle(width=2.0, height=1.35, corner_radius=0.18, color=TEAL, stroke_width=4)
            value_t = Text(value, color=INK, font_size=36).move_to(box.get_left() + RIGHT * 0.58)
            next_t = Text("next", color=MUTED, font_size=22).move_to(box.get_right() + LEFT * 0.45)
            divider = Line(box.get_top() + DOWN * 0.2 + RIGHT * 0.22, box.get_bottom() + UP * 0.2 + RIGHT * 0.22, color=TEAL)
            return VGroup(box, value_t, next_t, divider)
        nodes = VGroup(node("10"), node("20"), node("30")).arrange(RIGHT, buff=0.8).shift(DOWN * 0.25)
        arrows = VGroup(*[Arrow(nodes[i].get_right(), nodes[i + 1].get_left(), buff=0.1, color=TEAL, stroke_width=5) for i in range(2)])
        null_t = Text("null", color=MUTED, font_size=28).next_to(nodes[-1], RIGHT, buff=0.65)
        null_arrow = Arrow(nodes[-1].get_right(), null_t.get_left(), buff=0.12, color=MUTED, stroke_width=4)
        self.play(FadeIn(nodes), run_time=2.0)
        self.play(GrowArrow(arrows[0]), GrowArrow(arrows[1]), run_time=1.2)
        head = Text("head", color=ORANGE, font_size=30).next_to(nodes[0], UP, buff=0.65)
        head_arrow = Arrow(head.get_bottom(), nodes[0].get_top(), buff=0.1, color=ORANGE, stroke_width=5)
        self.play(FadeIn(head), GrowArrow(head_arrow), run_time=1.2)
        pulse = Circle(radius=0.86, color=GREEN, stroke_width=7).move_to(nodes[0])
        self.play(Create(pulse), run_time=0.7)
        self.play(pulse.animate.move_to(nodes[1]), run_time=1.2)
        self.play(pulse.animate.move_to(nodes[2]), run_time=1.2)
        self.play(FadeOut(pulse), FadeIn(null_t), GrowArrow(null_arrow), run_time=1.7)
        caption = Text("كل سهم next يحفظ الوصول إلى ما بعده", color=INK, font_size=30).next_to(nodes, DOWN, buff=1.15)
        self.play(Write(caption), run_time=1.5)
        self.wait(5.94)


class V04Scene03WrongOrder(Scene):
    # Target: 16.36s (from scene03-wrong-order.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("الخطأ: حرّك head قبل حفظ الطريق", color=INK, font_size=36).to_edge(UP)
        self.play(Write(title), run_time=1.1)
        def node(value, color=TEAL):
            box = RoundedRectangle(width=1.7, height=1.2, corner_radius=0.16, color=color, stroke_width=4)
            return VGroup(box, Text(value, color=INK, font_size=34).move_to(box.get_center()))
        old = VGroup(node("10"), node("20"), node("30")).arrange(RIGHT, buff=0.75).shift(RIGHT * 1.1 + DOWN * 0.2)
        old_arrows = VGroup(*[Arrow(old[i].get_right(), old[i + 1].get_left(), buff=0.1, color=TEAL, stroke_width=5) for i in range(2)])
        fresh = node("5", ORANGE).shift(LEFT * 4.6 + DOWN * 0.2)
        self.play(FadeIn(old), GrowArrow(old_arrows[0]), GrowArrow(old_arrows[1]), FadeIn(fresh), run_time=1.7)
        head = Text("head", color=ORANGE, font_size=30).next_to(old[0], UP, buff=0.55)
        pointer = Arrow(head.get_bottom(), old[0].get_top(), buff=0.1, color=ORANGE, stroke_width=5)
        self.play(FadeIn(head), GrowArrow(pointer), run_time=1.8)
        new_pointer = Arrow(head.get_bottom(), fresh.get_top(), buff=0.1, color=CORAL, stroke_width=5)
        self.play(Transform(pointer, new_pointer), run_time=1.8)
        broken = DashedLine(fresh.get_right(), old[0].get_left(), color=CORAL, stroke_width=5)
        slash = Text("×", color=CORAL, font_size=76).move_to(broken.get_center())
        self.play(Create(broken), FadeIn(slash, scale=1.25), run_time=1.4)
        warning = Text("لم نحفظ الرأس القديم داخل newNode.next", color=CORAL, font_size=28).next_to(old, DOWN, buff=1.05)
        self.play(Write(warning), run_time=1.3)
        self.play(FadeOut(warning), FadeOut(slash), FadeOut(broken), run_time=1.2)
        lesson = Text("لا تغيّر البداية قبل أن تحفظ الطريق", color=INK, font_size=31).next_to(old, DOWN, buff=1.0)
        self.play(FadeIn(lesson), run_time=0.6)
        self.wait(5.42)


class V04Scene04Create(Scene):
    # Target: 15.56s (from scene04-create.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("الخطوة 1: أنشئ newNode", color=INK, font_size=38).to_edge(UP)
        self.play(Write(title), run_time=1.1)
        def node(value, color=TEAL):
            box = RoundedRectangle(width=1.85, height=1.25, corner_radius=0.16, color=color, stroke_width=4)
            return VGroup(box, Text(value, color=INK, font_size=34).move_to(box.get_center()))
        old = VGroup(node("10"), node("20"), node("30")).arrange(RIGHT, buff=0.7).shift(DOWN * 0.7 + RIGHT * 1.0)
        links = VGroup(*[Arrow(old[i].get_right(), old[i + 1].get_left(), buff=0.1, color=TEAL, stroke_width=5) for i in range(2)])
        head = Text("head", color=ORANGE, font_size=30).next_to(old[0], UP, buff=0.55)
        pointer = Arrow(head.get_bottom(), old[0].get_top(), buff=0.1, color=ORANGE, stroke_width=5)
        self.play(FadeIn(old), GrowArrow(links[0]), GrowArrow(links[1]), FadeIn(head), GrowArrow(pointer), run_time=1.8)
        fresh = node("5", ORANGE).shift(UP * 1.25 + LEFT * 3.75)
        label = Text("newNode", color=ORANGE, font_size=32).next_to(fresh, UP, buff=0.25)
        self.play(FadeIn(fresh, shift=UP * 0.35), Write(label), run_time=1.7)
        shield = SurroundingRectangle(fresh, color=GREEN, buff=0.18, corner_radius=0.16)
        note = Text("أنشأناها فقط؛ لا رابط ولا تغيير للرأس", color=INK, font_size=28).next_to(old, DOWN, buff=1.0)
        self.play(Create(shield), Write(note), run_time=1.6)
        self.play(Indicate(head, color=ORANGE), run_time=1.1)
        self.wait(8.26)


class V04Scene05SaveRoute(Scene):
    # Target: 20.48s (from scene05-save-route.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("الخطوة 2: احفظ الطريق القديم", color=INK, font_size=38).to_edge(UP)
        self.play(Write(title), run_time=1.1)
        def node(value, color=TEAL, show_next=True):
            box = RoundedRectangle(width=1.9, height=1.3, corner_radius=0.16, color=color, stroke_width=4)
            value_t = Text(value, color=INK, font_size=34).move_to(box.get_left() + RIGHT * 0.58)
            next_t = Text("next", color=MUTED, font_size=21).move_to(box.get_right() + LEFT * 0.43) if show_next else VGroup()
            divider = Line(box.get_top() + DOWN * 0.2 + RIGHT * 0.22, box.get_bottom() + UP * 0.2 + RIGHT * 0.22, color=color) if show_next else VGroup()
            return VGroup(box, value_t, next_t, divider)
        old = VGroup(node("10"), node("20"), node("30")).arrange(RIGHT, buff=0.72).shift(DOWN * 0.7 + RIGHT * 1.0)
        links = VGroup(*[Arrow(old[i].get_right(), old[i + 1].get_left(), buff=0.1, color=TEAL, stroke_width=5) for i in range(2)])
        head = Text("head", color=ORANGE, font_size=30).next_to(old[0], UP, buff=0.55)
        pointer = Arrow(head.get_bottom(), old[0].get_top(), buff=0.1, color=ORANGE, stroke_width=5)
        fresh = node("5", ORANGE).shift(LEFT * 4.4 + DOWN * 0.7)
        label = Text("newNode", color=ORANGE, font_size=30).next_to(fresh, UP, buff=0.35)
        self.play(FadeIn(old), GrowArrow(links[0]), GrowArrow(links[1]), FadeIn(head), GrowArrow(pointer), FadeIn(fresh), FadeIn(label), run_time=1.9)
        formula = Text("newNode.next = head", color=GREEN, font_size=38).next_to(title, DOWN, buff=0.52)
        self.play(Write(formula), run_time=1.6)
        saved = Arrow(fresh.get_right(), old[0].get_left(), buff=0.1, color=GREEN, stroke_width=7, max_tip_length_to_length_ratio=0.16)
        self.play(GrowArrow(saved), run_time=2.3)
        ring1 = SurroundingRectangle(fresh, color=GREEN, buff=0.15, corner_radius=0.14)
        ring2 = SurroundingRectangle(old[0], color=GREEN, buff=0.15, corner_radius=0.14)
        self.play(Create(ring1), Create(ring2), run_time=1.5)
        note = Text("الآن تعرف العقدة الجديدة أين يبدأ الطريق القديم", color=INK, font_size=29).next_to(old, DOWN, buff=1.05)
        self.play(Write(note), run_time=1.6)
        self.wait(10.48)


class V04Scene06MoveHead(Scene):
    # Target: 13.88s (from scene06-move-head.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("الخطوة 3: حرّك head بعد الحفظ", color=INK, font_size=38).to_edge(UP)
        self.play(Write(title), run_time=1.1)
        def node(value, color=TEAL):
            box = RoundedRectangle(width=1.8, height=1.25, corner_radius=0.16, color=color, stroke_width=4)
            return VGroup(box, Text(value, color=INK, font_size=34).move_to(box.get_center()))
        fresh = node("5", ORANGE).shift(LEFT * 4.35 + DOWN * 0.25)
        old = VGroup(node("10"), node("20"), node("30")).arrange(RIGHT, buff=0.72).shift(DOWN * 0.25 + RIGHT * 0.95)
        links = VGroup(Arrow(fresh.get_right(), old[0].get_left(), buff=0.1, color=GREEN, stroke_width=7), Arrow(old[0].get_right(), old[1].get_left(), buff=0.1, color=TEAL, stroke_width=5), Arrow(old[1].get_right(), old[2].get_left(), buff=0.1, color=TEAL, stroke_width=5))
        self.play(FadeIn(fresh), FadeIn(old), GrowArrow(links[0]), GrowArrow(links[1]), GrowArrow(links[2]), run_time=1.7)
        head = Text("head", color=ORANGE, font_size=30).next_to(old[0], UP, buff=0.58)
        pointer = Arrow(head.get_bottom(), old[0].get_top(), buff=0.1, color=ORANGE, stroke_width=5)
        self.play(FadeIn(head), GrowArrow(pointer), run_time=1.3)
        new_head = Text("head", color=ORANGE, font_size=30).next_to(fresh, UP, buff=0.58)
        new_pointer = Arrow(new_head.get_bottom(), fresh.get_top(), buff=0.1, color=ORANGE, stroke_width=5)
        self.play(Transform(head, new_head), Transform(pointer, new_pointer), run_time=2.0)
        glow = VGroup(*[SurroundingRectangle(n, color=GREEN, buff=0.12, corner_radius=0.14) for n in [fresh, *old]])
        self.play(LaggedStart(*[Create(g) for g in glow], lag_ratio=0.18), run_time=1.5)
        caption = Text("الرأس الجديد، والسلسلة القديمة ما زالت متصلة", color=INK, font_size=29).next_to(old, DOWN, buff=1.05)
        self.play(Write(caption), run_time=1.4)
        self.wait(4.88)


class V04Scene07Complexity(Scene):
    # Target: 18.64s (from scene07-complexity.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("لماذا إدراج الرأس سريع؟", color=INK, font_size=40).to_edge(UP)
        self.play(Write(title), run_time=1.1)
        labels = [("1", "أنشئ newNode", ORANGE), ("2", "احفظ next", GREEN), ("3", "حرّك head", TEAL)]
        cards = VGroup()
        for number, label, color in labels:
            card = RoundedRectangle(width=3.5, height=1.55, corner_radius=0.18, color=color, stroke_width=4)
            num = Text(number, color=color, font_size=48).move_to(card.get_left() + RIGHT * 0.5)
            text = Text(label, color=INK, font_size=28).move_to(card.get_center() + RIGHT * 0.35)
            cards.add(VGroup(card, num, text))
        cards.arrange(DOWN, buff=0.38).shift(LEFT * 2.65 + DOWN * 0.45)
        self.play(FadeIn(cards[0], shift=RIGHT * 0.25), run_time=1.2)
        self.play(FadeIn(cards[1], shift=RIGHT * 0.25), run_time=1.2)
        self.play(FadeIn(cards[2], shift=RIGHT * 0.25), run_time=1.2)
        counter_box = RoundedRectangle(width=3.5, height=2.2, corner_radius=0.2, color=TEAL, stroke_width=4).shift(RIGHT * 3.5)
        counter_title = Text("عقد مزارة", color=MUTED, font_size=28).move_to(counter_box.get_top() + DOWN * 0.45)
        counter = Text("0", color=GREEN, font_size=80).move_to(counter_box.get_center() + DOWN * 0.2)
        self.play(FadeIn(counter_box), FadeIn(counter_title), FadeIn(counter), run_time=1.3)
        cost = Text("O(1)", color=GREEN, font_size=64).next_to(counter_box, DOWN, buff=0.45)
        self.play(Write(cost), run_time=1.5)
        active = SurroundingRectangle(cards, color=GREEN, buff=0.16, corner_radius=0.18)
        self.play(Create(active), run_time=1.1)
        note = Text("ثلاثة تحديثات ثابتة، لا عبور لكل العقد", color=INK, font_size=30).to_edge(DOWN, buff=0.65)
        self.play(Write(note), run_time=1.4)
        self.wait(8.64)


class V04Scene08Summary(Scene):
    # Target: 17.96s (from scene08-summary.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("قاعدة الإدراج الآمن عند الرأس", color=INK, font_size=40).to_edge(UP)
        self.play(Write(title), run_time=1.1)
        steps = VGroup()
        texts = [("1", "أنشئ newNode", ORANGE), ("2", "newNode.next = head", GREEN), ("3", "head = newNode", TEAL)]
        for number, content, color in texts:
            pill = RoundedRectangle(width=5.7, height=0.95, corner_radius=0.2, color=color, stroke_width=4)
            badge = Circle(radius=0.28, color=color, fill_opacity=1).move_to(pill.get_left() + RIGHT * 0.55)
            num = Text(number, color=BG, font_size=25).move_to(badge)
            label = Text(content, color=INK, font_size=30).move_to(pill.get_center() + RIGHT * 0.35)
            steps.add(VGroup(pill, badge, num, label))
        steps.arrange(DOWN, buff=0.36).shift(LEFT * 2.8 + DOWN * 0.35)
        self.play(FadeIn(steps[0], shift=RIGHT * 0.2), run_time=1.2)
        self.play(FadeIn(steps[1], shift=RIGHT * 0.2), run_time=1.2)
        self.play(FadeIn(steps[2], shift=RIGHT * 0.2), run_time=1.2)
        chain = Text("5  →  10  →  20  →  30  →  null", color=GREEN, font_size=28).move_to(RIGHT * 3.55 + UP * 0.65)
        self.play(Write(chain), run_time=1.6)
        question = Text("أي خطوة تسبق تحديث head؟", color=ORANGE, font_size=25).move_to(RIGHT * 3.55 + DOWN * 1.05)
        self.play(Write(question), run_time=1.5)
        ring = SurroundingRectangle(steps[1], color=GREEN, buff=0.13, corner_radius=0.18)
        self.play(Create(ring), run_time=1.3)
        self.play(Indicate(chain, color=GREEN), run_time=1.0)
        self.wait(7.82)
