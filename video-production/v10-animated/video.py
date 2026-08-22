from manim import *


class RecursionHook(Scene):
    # Target: 15.60s (from scene01-hook.wav)
    def construct(self):
        title = Text("Recursion: smaller problem", font_size=38, color="#35D1C8").to_edge(UP)
        big = RoundedRectangle(width=4.6, height=2.1, corner_radius=0.22, color="#35D1C8", fill_color="#173B58", fill_opacity=1).shift(LEFT * 3 + DOWN * 0.35)
        big_label = Text("count(3)", font_size=44, color=WHITE).move_to(big)
        small = RoundedRectangle(width=3.0, height=1.45, corner_radius=0.18, color="#35D1C8", fill_color="#173B58", fill_opacity=1).shift(RIGHT * 3 + DOWN * 0.35)
        small_label = Text("count(2)", font_size=34, color=WHITE).move_to(small)
        arrow = Arrow(big.get_right(), small.get_left(), buff=0.25, color="#F3C969", stroke_width=6)
        caption = Text("same idea, smaller input", font_size=27, color="#F3C969").next_to(VGroup(big, small), DOWN, buff=0.35)
        stop = Text("needs a stopping rule", font_size=34, color="#FF7A59").to_edge(DOWN, buff=0.7)
        self.play(Write(title), run_time=0.8)
        self.play(DrawBorderThenFill(big), FadeIn(big_label), run_time=1.2)
        self.play(DrawBorderThenFill(small), FadeIn(small_label), run_time=1.1)
        self.play(GrowArrow(arrow), Write(caption), run_time=2.0)
        self.play(Circumscribe(small, color="#35D1C8"), run_time=1.2)
        self.play(FadeIn(stop, shift=UP * 0.25), run_time=1.0)
        self.wait(8.3)


class ShrinkProblem(Scene):
    # Target: 15.96s (from scene02-shrink.wav)
    def construct(self):
        title = Text("Shrink the problem", font_size=38, color="#35D1C8").to_edge(UP)
        card = RoundedRectangle(width=4.4, height=1.75, corner_radius=0.2, color="#35D1C8", fill_color="#173B58", fill_opacity=1).shift(UP * 0.6)
        label = Text("count(3)", font_size=48, color=WHITE).move_to(card)
        note = Text("smaller next call", font_size=28, color="#F3C969").to_edge(DOWN, buff=0.75)
        self.play(Write(title), run_time=0.8)
        self.play(DrawBorderThenFill(card), Write(label), run_time=1.0)
        next_card = RoundedRectangle(width=3.9, height=1.55, corner_radius=0.2, color="#35D1C8", fill_color="#173B58", fill_opacity=1).move_to(card)
        next_label = Text("count(2)", font_size=44, color=WHITE).move_to(card)
        self.play(Transform(card, next_card), Transform(label, next_label), run_time=2.0)
        self.play(FadeIn(note), run_time=1.2)
        last_card = RoundedRectangle(width=3.4, height=1.35, corner_radius=0.2, color="#35D1C8", fill_color="#173B58", fill_opacity=1).move_to(card)
        last_label = Text("count(1)", font_size=40, color=WHITE).move_to(card)
        self.play(Transform(card, last_card), Transform(label, last_label), run_time=2.0)
        down = Arrow(UP * 0.2, DOWN * 1.1, color="#35D1C8", stroke_width=6).shift(RIGHT * 4.1)
        self.play(GrowArrow(down), run_time=1.2)
        zero_card = RoundedRectangle(width=2.9, height=1.15, corner_radius=0.18, color="#F3C969", fill_color="#173B58", fill_opacity=1).move_to(card)
        zero_label = Text("count(0)", font_size=36, color="#F3C969").move_to(card)
        self.play(Transform(card, zero_card), Transform(label, zero_label), run_time=2.0)
        self.wait(5.76)


class CallStackCards(Scene):
    # Target: 18.16s (from scene03-stack.wav)
    def construct(self):
        title = Text("Call Stack", font_size=40, color="#35D1C8").to_edge(UP)
        base = RoundedRectangle(width=4.4, height=1.25, corner_radius=0.15, color="#35D1C8", fill_color="#173B58", fill_opacity=1).shift(DOWN * 2.1)
        mid = base.copy().shift(UP * 1.42)
        top = base.copy().shift(UP * 2.84)
        l1 = Text("count(3)", font_size=33, color=WHITE).move_to(base)
        l2 = Text("count(2)", font_size=33, color=WHITE).move_to(mid)
        l3 = Text("count(1)", font_size=33, color=WHITE).move_to(top)
        bracket = Brace(VGroup(base, mid, top), RIGHT, color="#35D1C8")
        stack_label = Text("waiting calls", font_size=28, color="#F3C969").next_to(bracket, RIGHT, buff=0.25)
        self.play(Write(title), run_time=0.8)
        self.play(DrawBorderThenFill(base), Write(l1), run_time=1.0)
        self.play(base.animate.set_color("#1C6380"), DrawBorderThenFill(mid), Write(l2), run_time=1.5)
        self.play(mid.animate.set_color("#1C6380"), DrawBorderThenFill(top), Write(l3), run_time=1.5)
        self.play(Create(bracket), run_time=1.2)
        self.play(FadeIn(stack_label, shift=LEFT * 0.2), run_time=1.1)
        self.play(Circumscribe(top, color="#F3C969"), run_time=1.0)
        self.wait(10.06)


class BaseCase(Scene):
    # Target: 14.12s (from scene04-base-case.wav)
    def construct(self):
        title = Text("Base Case", font_size=40, color="#F3C969").to_edge(UP)
        card = RoundedRectangle(width=4.6, height=1.75, corner_radius=0.22, color="#F3C969", fill_color="#173B58", fill_opacity=1).shift(UP * 0.35)
        label = Text("count(0)", font_size=48, color="#F3C969").move_to(card)
        answer = Text("stop here", font_size=38, color="#F3C969").next_to(card, DOWN, buff=0.65)
        blocked = Line(LEFT * 1.7, RIGHT * 1.7, color="#FF7A59", stroke_width=9).to_edge(DOWN, buff=1.05)
        no_more = Text("no new call", font_size=28, color="#FF7A59").next_to(blocked, DOWN, buff=0.2)
        self.play(Write(title), run_time=0.8)
        self.play(DrawBorderThenFill(card), Write(label), run_time=1.0)
        self.play(FadeIn(answer, shift=UP * 0.2), run_time=1.1)
        self.play(Circumscribe(card, color="#F3C969"), run_time=1.2)
        self.play(Create(blocked), FadeIn(no_more), run_time=1.5)
        self.play(card.animate.set_fill("#294F6A", opacity=1), run_time=1.2)
        self.wait(7.32)


class Unwind(Scene):
    # Target: 17.28s (from scene05-unwind.wav)
    def construct(self):
        title = Text("Return in reverse", font_size=40, color="#35D1C8").to_edge(UP)
        cards = VGroup()
        labels = VGroup()
        for value, y in [("count(3)", -2.1), ("count(2)", -0.68), ("count(1)", 0.74)]:
            card = RoundedRectangle(width=4.2, height=1.2, corner_radius=0.16, color="#35D1C8", fill_color="#173B58", fill_opacity=1).shift(DOWN * 0 + UP * y)
            label = Text(value, font_size=32, color=WHITE).move_to(card)
            cards.add(card)
            labels.add(label)
        back_arrow = Arrow(RIGHT * 4.6 + DOWN * 1.5, RIGHT * 4.6 + UP * 1.5, color="#F3C969", stroke_width=7)
        return_label = Text("return", font_size=29, color="#F3C969").next_to(back_arrow, RIGHT, buff=0.2)
        self.play(Write(title), run_time=0.8)
        self.play(FadeIn(cards), FadeIn(labels), run_time=1.2)
        self.play(GrowArrow(back_arrow), Write(return_label), run_time=1.0)
        self.play(Circumscribe(cards[2], color="#F3C969"), run_time=1.5)
        self.play(cards[2].animate.shift(RIGHT * 5.5), labels[2].animate.shift(RIGHT * 5.5), run_time=1.2)
        self.play(FadeOut(cards[2]), FadeOut(labels[2]), run_time=1.2)
        self.play(Circumscribe(cards[1], color="#F3C969"), run_time=1.4)
        self.play(cards[1].animate.shift(RIGHT * 5.5), labels[1].animate.shift(RIGHT * 5.5), run_time=1.1)
        self.play(FadeOut(cards[1]), FadeOut(labels[1]), run_time=1.4)
        self.play(cards[0].animate.shift(RIGHT * 5.5), labels[0].animate.shift(RIGHT * 5.5), run_time=1.1)
        self.wait(5.38)


class PrintOrder(Scene):
    # Target: 17.08s (from scene06-order.wav)
    def construct(self):
        title = Text("Where you print matters", font_size=38, color="#35D1C8").to_edge(UP)
        left = RoundedRectangle(width=5.25, height=3.7, corner_radius=0.2, color="#35D1C8", fill_color="#173B58", fill_opacity=1).shift(LEFT * 3.3 + DOWN * 0.4)
        right = left.copy().shift(RIGHT * 6.6)
        before = Text("print before call", font_size=27, color="#35D1C8").next_to(left, UP, buff=0.25)
        after = Text("print after call", font_size=27, color="#F3C969").next_to(right, UP, buff=0.25)
        descent = Text("3  →  2  →  1", font_size=30, color=WHITE).move_to(left).shift(UP * 0.45)
        return_order = Text("1  →  2  →  3", font_size=30, color=WHITE).move_to(right).shift(UP * 0.45)
        down = Arrow(LEFT * 4.75 + DOWN * 0.9, LEFT * 1.85 + DOWN * 0.9, color="#35D1C8", stroke_width=6)
        up = Arrow(RIGHT * 1.85 + DOWN * 0.9, RIGHT * 4.75 + DOWN * 0.9, color="#F3C969", stroke_width=6)
        self.play(Write(title), run_time=0.8)
        self.play(DrawBorderThenFill(left), Write(before), run_time=1.2)
        self.play(DrawBorderThenFill(right), Write(after), run_time=1.2)
        self.play(Write(descent), run_time=1.0)
        self.play(Write(return_order), run_time=1.0)
        self.play(GrowArrow(down), GrowArrow(up), run_time=1.5)
        self.play(Circumscribe(left, color="#35D1C8"), Circumscribe(right, color="#F3C969"), run_time=1.5)
        self.play(FadeIn(Text("same calls, different output", font_size=28, color="#FF7A59").to_edge(DOWN, buff=0.6)), run_time=1.2)
        self.wait(7.68)


class SafetyRule(Scene):
    # Target: 15.68s (from scene07-safety.wav)
    def construct(self):
        title = Text("Two safety questions", font_size=39, color="#35D1C8").to_edge(UP)
        rule1 = RoundedRectangle(width=5.2, height=1.35, corner_radius=0.18, color="#35D1C8", fill_color="#173B58", fill_opacity=1).shift(UP * 1.45)
        rule2 = rule1.copy().shift(DOWN * 2.05)
        t1 = Text("Is the problem smaller?", font_size=30, color=WHITE).move_to(rule1)
        t2 = Text("What stops the calls?", font_size=30, color=WHITE).move_to(rule2)
        check1 = Text("✓", font_size=52, color="#35D1C8").next_to(rule1, RIGHT, buff=0.45)
        check2 = Text("✓", font_size=52, color="#35D1C8").next_to(rule2, RIGHT, buff=0.45)
        warning = Text("stack grows forever", font_size=36, color="#FF7A59").to_edge(DOWN, buff=0.55)
        self.play(Write(title), run_time=0.8)
        self.play(DrawBorderThenFill(rule1), Write(t1), run_time=1.0)
        self.play(DrawBorderThenFill(rule2), Write(t2), run_time=1.0)
        self.play(FadeIn(check1, scale=0.8), FadeIn(check2, scale=0.8), run_time=1.2)
        self.play(FadeIn(warning, shift=UP * 0.25), run_time=2.0)
        self.play(Circumscribe(VGroup(rule1, rule2), color="#F3C969"), run_time=1.2)
        self.wait(8.48)


class RecursionSummary(Scene):
    # Target: 17.32s (from scene08-summary.wav)
    def construct(self):
        title = Text("Recursion in three steps", font_size=39, color="#35D1C8").to_edge(UP)
        steps = VGroup()
        labels = [("1", "shrink", "#35D1C8"), ("2", "stop", "#F3C969"), ("3", "return", "#FF7A59")]
        for n, word, color in labels:
            circle = Circle(radius=0.78, color=color, fill_color="#173B58", fill_opacity=1)
            num = Text(n, font_size=35, color=color).move_to(circle)
            text = Text(word, font_size=26, color=WHITE).next_to(circle, DOWN, buff=0.25)
            steps.add(VGroup(circle, num, text))
        steps.arrange(RIGHT, buff=1.25).shift(DOWN * 0.25)
        a1 = Arrow(steps[0].get_right(), steps[1].get_left(), buff=0.25, color="#35D1C8", stroke_width=5)
        a2 = Arrow(steps[1].get_right(), steps[2].get_left(), buff=0.25, color="#F3C969", stroke_width=5)
        closing = Text("follow the cards, not the mystery", font_size=32, color="#F3C969").to_edge(DOWN, buff=0.75)
        self.play(Write(title), run_time=0.8)
        self.play(FadeIn(steps[0], shift=UP * 0.2), run_time=1.3)
        self.play(GrowArrow(a1), FadeIn(steps[1], shift=UP * 0.2), run_time=1.2)
        self.play(GrowArrow(a2), FadeIn(steps[2], shift=UP * 0.2), run_time=1.1)
        self.play(Circumscribe(steps[1], color="#F3C969"), run_time=1.2)
        self.play(FadeIn(closing, shift=UP * 0.2), run_time=1.0)
        self.play(Circumscribe(steps, color="#35D1C8"), run_time=1.2)
        self.wait(9.52)
