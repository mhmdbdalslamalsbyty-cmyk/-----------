from manim import *


class V06Scene01Hook(Scene):
    # Target: 18.24s (from scene01-hook.wav)
    def construct(self):
        bg = "#071B2F"; ink = "#F7F4E8"; teal = "#22C7B8"; coral = "#F0705C"
        self.camera.background_color = bg
        title = Text("المكدس: كومة أطباق", font_size=42, color=ink, weight=BOLD).to_edge(UP, buff=0.45)
        question = Text("لماذا لا نسحب طبقًا من الوسط؟", font_size=30, color=teal).next_to(title, DOWN, buff=0.35)
        plates = VGroup(*[RoundedRectangle(width=4.8, height=.58, corner_radius=.18, color=teal, stroke_width=3, fill_color="#123B56", fill_opacity=.9) for _ in range(3)]).arrange(UP, buff=.12).move_to(DOWN*.5)
        numbers = VGroup(*[Text(str(n), font_size=27, color=ink, weight=BOLD).move_to(plate) for n, plate in zip([7, 9, 12], plates)])
        top_tag = Text("آخر داخل", font_size=27, color=coral, weight=BOLD).next_to(plates[-1], RIGHT, buff=.45)
        arrow = Arrow(top_tag.get_left(), plates[-1].get_right(), color=coral, buff=.1)
        bottom = Text("Stack", font_size=34, color=teal, weight=BOLD).next_to(plates, DOWN, buff=.55)
        self.play(Write(title), run_time=.6)
        self.play(FadeIn(question, shift=DOWN*.18), run_time=.9)
        self.play(LaggedStart(*[FadeIn(p, shift=UP*.25) for p in plates], lag_ratio=.25), FadeIn(numbers), run_time=2.2)
        self.play(Write(top_tag), GrowArrow(arrow), run_time=.8)
        self.play(plates[-1].animate.shift(RIGHT*2.2), numbers[-1].animate.shift(RIGHT*2.2), run_time=1.6)
        self.play(plates[-1].animate.shift(LEFT*2.2), numbers[-1].animate.shift(LEFT*2.2), run_time=.9)
        self.play(Write(bottom), Indicate(plates[-1], color=teal), run_time=1.2)
        self.wait(10.04)


class V06Scene02Top(Scene):
    # Target: 18.80s (from scene02-top.wav)
    def construct(self):
        bg = "#071B2F"; ink = "#F7F4E8"; teal = "#22C7B8"; quiet = "#244A63"; coral = "#F0705C"
        self.camera.background_color = bg
        title = Text("المصفوفة ومؤشر top", font_size=42, color=ink, weight=BOLD).to_edge(UP, buff=.45)
        cells = VGroup(*[RoundedRectangle(width=1.35, height=1.25, corner_radius=.16, color=quiet, stroke_width=3, fill_color="#103149", fill_opacity=.8) for _ in range(4)]).arrange(RIGHT, buff=.18).move_to(DOWN*.45)
        indexes = VGroup(*[Text(str(i), font_size=24, color=ink).next_to(cell, DOWN, buff=.15) for i, cell in enumerate(cells)])
        tag = Text("top = -1", font_size=36, color=coral, weight=BOLD).next_to(cells, UP, buff=.55)
        pointer = Arrow(tag.get_bottom(), cells[0].get_top(), color=coral, buff=.12)
        status = Text("فارغ", font_size=30, color=teal, weight=BOLD).next_to(cells, DOWN, buff=.8)
        self.play(Write(title), run_time=.6)
        self.play(LaggedStart(*[Create(c) for c in cells], lag_ratio=.15), run_time=2.0)
        self.play(FadeIn(indexes, shift=UP*.12), run_time=.8)
        self.play(Write(tag), GrowArrow(pointer), run_time=.8)
        self.play(Indicate(cells[0], color=teal), Write(status), run_time=1.1)
        self.wait(13.5)


class V06Scene03Push(Scene):
    # Target: 20.52s (from scene03-push.wav)
    def construct(self):
        bg = "#071B2F"; ink = "#F7F4E8"; teal = "#22C7B8"; quiet = "#244A63"; coral = "#F0705C"
        self.camera.background_color = bg
        title = Text("Push: نحرّك top ثم نخزّن", font_size=40, color=ink, weight=BOLD).to_edge(UP, buff=.45)
        cells = VGroup(*[RoundedRectangle(width=1.25, height=1.35, corner_radius=.16, color=quiet, stroke_width=3, fill_color="#103149", fill_opacity=.8) for _ in range(4)]).arrange(RIGHT, buff=.2).move_to(DOWN*.2)
        indexes = VGroup(*[Text(str(i), font_size=23, color=ink).next_to(cell, DOWN, buff=.15) for i, cell in enumerate(cells)])
        top = Text("top = -1", font_size=31, color=coral, weight=BOLD).next_to(cells[0], UP, buff=.65)
        arrow = Arrow(top.get_bottom(), cells[0].get_top(), color=coral, buff=.1)
        seven = Text("7", font_size=42, color=ink, weight=BOLD).move_to(cells[0])
        nine = Text("9", font_size=42, color=ink, weight=BOLD).move_to(cells[1])
        code = Text("push(7)  ثم  push(9)", font_size=27, color=teal, weight=BOLD).next_to(cells, DOWN, buff=.75)
        self.play(Write(title), run_time=.6)
        self.play(LaggedStart(*[Create(c) for c in cells], lag_ratio=.15), FadeIn(indexes), run_time=2.0)
        self.play(Write(top), GrowArrow(arrow), run_time=.7)
        top0 = Text("top = 0", font_size=31, color=coral, weight=BOLD).move_to(top)
        self.play(Transform(top, top0), arrow.animate.put_start_and_end_on(top.get_bottom(), cells[0].get_top()), run_time=.7)
        self.play(FadeIn(seven, shift=DOWN*.35), cells[0].animate.set_stroke(teal, width=4), run_time=.8)
        top1 = Text("top = 1", font_size=31, color=coral, weight=BOLD).move_to(top).shift(RIGHT*1.45)
        self.play(Transform(top, top1), arrow.animate.put_start_and_end_on(top.get_bottom(), cells[1].get_top()), run_time=.9)
        self.play(FadeIn(nine, shift=DOWN*.35), cells[1].animate.set_stroke(teal, width=4), run_time=.8)
        self.play(Write(code), Indicate(nine, color=teal), run_time=1.0)
        self.wait(12.941)


class V06Scene04Lifo(Scene):
    # Target: 16.60s (from scene04-lifo.wav)
    def construct(self):
        bg = "#071B2F"; ink = "#F7F4E8"; teal = "#22C7B8"; quiet = "#244A63"; coral = "#F0705C"
        self.camera.background_color = bg
        title = Text("LIFO: آخر داخل، أول خارج", font_size=41, color=ink, weight=BOLD).to_edge(UP, buff=.45)
        lower = RoundedRectangle(width=4.5, height=.75, corner_radius=.2, color=quiet, fill_color="#123B56", fill_opacity=.9).move_to(DOWN*.8)
        upper = RoundedRectangle(width=4.5, height=.75, corner_radius=.2, color=teal, fill_color="#166B69", fill_opacity=.9).next_to(lower, UP, buff=.16)
        a = Text("7 دخل أولًا", font_size=31, color=ink, weight=BOLD).move_to(lower)
        b = Text("9 دخل أخيرًا", font_size=31, color=ink, weight=BOLD).move_to(upper)
        lock = Text("لا نصل إلى 7 قبل 9", font_size=30, color=coral, weight=BOLD).next_to(upper, DOWN, buff=1.15)
        down = Arrow(upper.get_right()+RIGHT*.6, lower.get_right()+RIGHT*.6, color=coral, buff=.1)
        self.play(Write(title), run_time=.6)
        self.play(FadeIn(lower, shift=UP*.25), FadeIn(a), run_time=1.1)
        self.play(FadeIn(upper, shift=UP*.25), FadeIn(b), run_time=1.1)
        self.play(Write(lock), GrowArrow(down), run_time=1.1)
        self.play(Indicate(upper, color=teal), Wiggle(lower, scale_value=1.03), run_time=1.3)
        self.wait(11.4)


class V06Scene05Peek(Scene):
    # Target: 16.76s (from scene05-peek.wav)
    def construct(self):
        bg = "#071B2F"; ink = "#F7F4E8"; teal = "#22C7B8"; quiet = "#244A63"; coral = "#F0705C"
        self.camera.background_color = bg
        title = Text("Peek: انظر ولا تحذف", font_size=42, color=ink, weight=BOLD).to_edge(UP, buff=.45)
        cells = VGroup(*[RoundedRectangle(width=1.35, height=1.3, corner_radius=.15, color=quiet, fill_color="#103149", fill_opacity=.8) for _ in range(3)]).arrange(RIGHT, buff=.2).move_to(DOWN*.25)
        seven = Text("7", font_size=42, color=ink, weight=BOLD).move_to(cells[0])
        nine = Text("9", font_size=42, color=ink, weight=BOLD).move_to(cells[1])
        top = Text("top = 1", font_size=31, color=coral, weight=BOLD).next_to(cells[1], UP, buff=.6)
        halo = Circle(radius=.8, color=teal, stroke_width=5).move_to(cells[1])
        result = Text("peek()  ←  9", font_size=34, color=teal, weight=BOLD).next_to(cells, DOWN, buff=.75)
        fixed = Text("top لم يتحرك", font_size=27, color=ink).next_to(result, DOWN, buff=.3)
        self.play(Write(title), run_time=.6)
        self.play(LaggedStart(*[Create(c) for c in cells], lag_ratio=.15), FadeIn(seven), FadeIn(nine), run_time=1.7)
        self.play(Write(top), Create(halo), run_time=.8)
        self.play(halo.animate.scale(1.18), Write(result), run_time=1.0)
        self.play(Write(fixed), Indicate(nine, color=teal), run_time=.9)
        self.wait(11.76)


class V06Scene06Pop(Scene):
    # Target: 19.04s (from scene06-pop.wav)
    def construct(self):
        bg = "#071B2F"; ink = "#F7F4E8"; teal = "#22C7B8"; quiet = "#244A63"; coral = "#F0705C"
        self.camera.background_color = bg
        title = Text("Pop: أعد القمة ثم ارجع", font_size=42, color=ink, weight=BOLD).to_edge(UP, buff=.45)
        cells = VGroup(*[RoundedRectangle(width=1.35, height=1.3, corner_radius=.15, color=quiet, fill_color="#103149", fill_opacity=.8) for _ in range(3)]).arrange(RIGHT, buff=.2).move_to(DOWN*.25)
        seven = Text("7", font_size=42, color=ink, weight=BOLD).move_to(cells[0])
        nine = Text("9", font_size=42, color=ink, weight=BOLD).move_to(cells[1])
        top = Text("top = 1", font_size=31, color=coral, weight=BOLD).next_to(cells[1], UP, buff=.6)
        result = Text("pop()  يعيد  9", font_size=32, color=teal, weight=BOLD).next_to(cells, DOWN, buff=.78)
        new_top = Text("top = 0", font_size=31, color=coral, weight=BOLD).next_to(cells[0], UP, buff=.6)
        self.play(Write(title), run_time=.6)
        self.play(LaggedStart(*[Create(c) for c in cells], lag_ratio=.15), FadeIn(seven), FadeIn(nine), Write(top), run_time=1.8)
        self.play(Write(result), nine.animate.shift(UP*2.0).set_opacity(.15), run_time=1.2)
        self.play(Transform(top, new_top), cells[0].animate.set_stroke(teal, width=4), Indicate(seven, color=teal), run_time=1.1)
        self.wait(14.34)


class V06Scene07Bounds(Scene):
    # Target: 18.92s (from scene07-bounds.wav)
    def construct(self):
        bg = "#071B2F"; ink = "#F7F4E8"; teal = "#22C7B8"; quiet = "#244A63"; coral = "#F0705C"
        self.camera.background_color = bg
        title = Text("حدود المكدس", font_size=42, color=ink, weight=BOLD).to_edge(UP, buff=.45)
        empty = VGroup(*[RoundedRectangle(width=1.1, height=1.1, corner_radius=.14, color=quiet, fill_color="#103149", fill_opacity=.75) for _ in range(3)]).arrange(RIGHT, buff=.16).shift(LEFT*3.5+DOWN*.35)
        full = VGroup(*[RoundedRectangle(width=1.1, height=1.1, corner_radius=.14, color=teal, fill_color="#166B69", fill_opacity=.85) for _ in range(4)]).arrange(RIGHT, buff=.16).shift(RIGHT*3.0+DOWN*.35)
        empty_label = Text("Underflow\nلا يوجد عنصر", font_size=28, color=coral, weight=BOLD).next_to(empty, DOWN, buff=.55)
        full_label = Text("Overflow\nلا توجد سعة", font_size=28, color=coral, weight=BOLD).next_to(full, DOWN, buff=.55)
        pop = Text("pop()", font_size=31, color=ink).next_to(empty, UP, buff=.55)
        push = Text("push()", font_size=31, color=ink).next_to(full, UP, buff=.55)
        self.play(Write(title), run_time=.6)
        self.play(LaggedStart(*[Create(c) for c in empty], lag_ratio=.13), Write(pop), run_time=1.2)
        self.play(Indicate(empty, color=coral), Write(empty_label), run_time=1.0)
        self.play(LaggedStart(*[Create(c) for c in full], lag_ratio=.13), Write(push), run_time=1.35)
        self.play(Indicate(full, color=coral), Write(full_label), run_time=1.0)
        self.wait(13.77)


class V06Scene08Summary(Scene):
    # Target: 20.28s (from scene08-summary.wav)
    def construct(self):
        bg = "#071B2F"; ink = "#F7F4E8"; teal = "#22C7B8"; quiet = "#244A63"; coral = "#F0705C"
        self.camera.background_color = bg
        title = Text("خلاصة المكدس", font_size=43, color=ink, weight=BOLD).to_edge(UP, buff=.45)
        ops = VGroup(
            Text("push  يضيف", font_size=33, color=teal, weight=BOLD),
            Text("pop  يزيل", font_size=33, color=coral, weight=BOLD),
            Text("peek  ينظر فقط", font_size=33, color=ink, weight=BOLD),
        ).arrange(DOWN, aligned_edge=RIGHT, buff=.38).move_to(LEFT*2.6+DOWN*.2)
        stack = VGroup(*[RoundedRectangle(width=2.8, height=.5, corner_radius=.15, color=teal, fill_color="#166B69", fill_opacity=.85) for _ in range(3)]).arrange(UP, buff=.12).move_to(RIGHT*3.3+DOWN*.15)
        question = Text("أي عملية تعرض القمة بلا حذف؟", font_size=33, color=ink, weight=BOLD).to_edge(DOWN, buff=.85)
        answer = Text("peek", font_size=43, color=teal, weight=BOLD).next_to(question, DOWN, buff=.28)
        self.play(Write(title), run_time=.6)
        self.play(LaggedStart(*[FadeIn(op, shift=RIGHT*.2) for op in ops], lag_ratio=.22), run_time=1.9)
        self.play(LaggedStart(*[FadeIn(p, shift=UP*.2) for p in stack], lag_ratio=.18), run_time=1.2)
        self.play(Write(question), run_time=1.0)
        self.play(Write(answer), Indicate(ops[2], color=teal), run_time=1.0)
        self.wait(14.58)
