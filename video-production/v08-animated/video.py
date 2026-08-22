from manim import *


BG = "#071827"
CARD = "#102A43"
TEXT = "#F8FAFC"
TEAL = "#38D9A9"
CORAL = "#FF7A59"
YELLOW = "#FFD166"
MUTED = "#486581"


class QueueHook(Scene):
    # Target: 16.36s (from scene01-hook.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("QUEUE  ·  FIFO", font_size=42, color=TEXT, weight=BOLD).to_edge(UP, buff=0.45)
        people = VGroup(*[
            VGroup(Circle(radius=0.28, color=TEAL, fill_opacity=0.85), Text(str(i), font_size=24, color=BG, weight=BOLD))
            for i in (1, 2, 3)
        ]).arrange(RIGHT, buff=0.8).move_to(UP * 0.7)
        for person in people:
            person[1].move_to(person[0])
        first = Text("FIRST", font_size=26, color=TEAL).next_to(people[0], DOWN, buff=0.35)
        last = Text("NEW", font_size=26, color=CORAL).next_to(people[-1], DOWN, buff=0.35)
        slots = VGroup(*[Square(1.22, color=TEAL, fill_color=CARD, fill_opacity=0.92) for _ in range(3)]).arrange(RIGHT, buff=0.12).move_to(DOWN * 0.65)
        numbers = VGroup(*[Text(str(i), font_size=42, color=TEXT, weight=BOLD).move_to(slot) for i, slot in zip((1, 2, 3), slots)])
        fifo = Text("FIRST  IN   →   FIRST  OUT", font_size=34, color=YELLOW, weight=BOLD).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(title, shift=DOWN * 0.2), FadeIn(people, shift=UP * 0.25), FadeIn(first), FadeIn(last), run_time=2.4)
        self.play(ReplacementTransform(people.copy(), slots), FadeOut(first), FadeOut(last), run_time=3.2)
        self.play(FadeIn(numbers, shift=DOWN * 0.15), run_time=2.0)
        exit_arrow = Arrow(slots[0].get_left() + LEFT * 1.25, slots[0].get_left() + LEFT * 0.1, color=TEAL, buff=0.1)
        enter_arrow = Arrow(slots[-1].get_right() + RIGHT * 1.25, slots[-1].get_right() + RIGHT * 0.1, color=CORAL, buff=0.1)
        self.play(GrowArrow(exit_arrow), GrowArrow(enter_arrow), run_time=2.2)
        self.play(Write(fifo), run_time=2.0)
        self.wait(4.56)


class FrontRearPointers(Scene):
    # Target: 15.80s (from scene02-pointers.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("TWO ENDS", font_size=42, color=TEXT, weight=BOLD).to_edge(UP, buff=0.45)
        cells = VGroup(*[Square(1.18, color=MUTED, fill_color=CARD, fill_opacity=0.92) for _ in range(6)]).arrange(RIGHT, buff=0.08).move_to(ORIGIN)
        values = VGroup(*[Text(v, font_size=34, color=TEXT, weight=BOLD).move_to(cells[i]) for i, v in enumerate(("10", "20", "30"))])
        front_label = Text("front", font_size=32, color=TEAL, weight=BOLD).next_to(cells[0], DOWN, buff=0.5)
        rear_label = Text("rear", font_size=32, color=CORAL, weight=BOLD).next_to(cells[2], DOWN, buff=0.5)
        front_arrow = Arrow(front_label.get_top(), cells[0].get_bottom(), color=TEAL, buff=0.08)
        rear_arrow = Arrow(rear_label.get_top(), cells[2].get_bottom(), color=CORAL, buff=0.08)
        out_tag = Text("OUT", font_size=26, color=TEAL).next_to(cells[0], UP, buff=0.35)
        in_tag = Text("IN", font_size=26, color=CORAL).next_to(cells[2], UP, buff=0.35)
        self.play(FadeIn(title, shift=DOWN * 0.2), run_time=1.5)
        self.play(Create(cells), run_time=2.0)
        self.play(FadeIn(values, shift=UP * 0.15), run_time=2.0)
        self.play(Write(front_label), GrowArrow(front_arrow), run_time=2.0)
        self.play(Write(rear_label), GrowArrow(rear_arrow), run_time=2.0)
        self.play(FadeIn(out_tag), FadeIn(in_tag), Circumscribe(cells[0], color=TEAL), Circumscribe(cells[2], color=CORAL), run_time=2.3)
        self.wait(4.0)


class EmptyQueue(Scene):
    # Target: 12.76s (from scene03-empty.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("EMPTY QUEUE", font_size=42, color=TEXT, weight=BOLD).to_edge(UP, buff=0.45)
        cells = VGroup(*[Square(1.25, color=MUTED, fill_color=CARD, fill_opacity=0.86) for _ in range(5)]).arrange(RIGHT, buff=0.1).move_to(UP * 0.15)
        phantom = VGroup(*[Text(v, font_size=36, color=TEXT).move_to(cells[i]) for i, v in enumerate(("10", "20", "30"))])
        empty = Text("EMPTY", font_size=48, color=YELLOW, weight=BOLD).move_to(DOWN * 1.35)
        guard = VGroup(
            RoundedRectangle(width=5.4, height=0.9, corner_radius=0.15, color=TEAL, fill_color=CARD, fill_opacity=1),
            Text("CHECK  BEFORE  DEQUEUE", font_size=29, color=TEAL, weight=BOLD),
        ).move_to(DOWN * 2.4)
        guard[1].move_to(guard[0])
        self.play(FadeIn(title, shift=DOWN * 0.2), run_time=1.5)
        self.play(Create(cells), FadeIn(phantom), run_time=2.0)
        self.play(FadeOut(phantom, shift=LEFT * 0.7), run_time=2.0)
        self.play(Write(empty), run_time=2.0)
        self.play(DrawBorderThenFill(guard[0]), Write(guard[1]), run_time=2.0)
        self.wait(3.26)


class EnqueueTen(Scene):
    # Target: 15.60s (from scene04-enqueue.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("ENQUEUE  10", font_size=42, color=TEXT, weight=BOLD).to_edge(UP, buff=0.45)
        cells = VGroup(*[Square(1.2, color=MUTED, fill_color=CARD, fill_opacity=0.9) for _ in range(5)]).arrange(RIGHT, buff=0.1).move_to(UP * 0.1)
        front_label = Text("front", font_size=30, color=TEAL, weight=BOLD).next_to(cells[0], DOWN, buff=0.5)
        rear_label = Text("rear", font_size=30, color=CORAL, weight=BOLD).next_to(cells[0], UP, buff=0.45)
        rear_arrow = Arrow(rear_label.get_bottom(), cells[0].get_top(), color=CORAL, buff=0.08)
        ten_box = VGroup(RoundedRectangle(width=1.0, height=0.82, corner_radius=0.12, color=YELLOW, fill_color=YELLOW, fill_opacity=0.9), Text("10", font_size=36, color=BG, weight=BOLD)).move_to(RIGHT * 5.6 + UP * 0.1)
        ten_box[1].move_to(ten_box[0])
        cue = Text("IN", font_size=30, color=CORAL, weight=BOLD).next_to(ten_box, UP, buff=0.35)
        code = Text("rear  →  next slot", font_size=29, color=CORAL).to_edge(DOWN, buff=0.62)
        self.play(FadeIn(title, shift=DOWN * 0.2), run_time=1.5)
        self.play(Create(cells), FadeIn(front_label), run_time=2.0)
        self.play(FadeIn(ten_box, shift=LEFT * 0.25), FadeIn(cue), run_time=1.5)
        self.play(ten_box.animate.move_to(cells[0]), FadeOut(cue), run_time=2.0)
        self.play(Write(rear_label), GrowArrow(rear_arrow), cells[0].animate.set_color(CORAL), run_time=1.5)
        self.play(Write(code), Circumscribe(cells[0], color=YELLOW), run_time=2.0)
        self.wait(5.1)


class EnqueueMore(Scene):
    # Target: 16.96s (from scene05-more-enqueue.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("ENQUEUE  MORE", font_size=42, color=TEXT, weight=BOLD).to_edge(UP, buff=0.45)
        cells = VGroup(*[Square(1.18, color=MUTED, fill_color=CARD, fill_opacity=0.9) for _ in range(5)]).arrange(RIGHT, buff=0.1).move_to(UP * 0.1)
        ten = Text("10", font_size=38, color=TEXT, weight=BOLD).move_to(cells[0])
        twenty = VGroup(RoundedRectangle(width=0.95, height=0.78, corner_radius=0.12, color=CORAL, fill_color=CORAL, fill_opacity=0.9), Text("20", font_size=31, color=BG, weight=BOLD)).move_to(RIGHT * 5.5 + UP * 0.1)
        twenty[1].move_to(twenty[0])
        thirty = VGroup(RoundedRectangle(width=0.95, height=0.78, corner_radius=0.12, color=CORAL, fill_color=CORAL, fill_opacity=0.9), Text("30", font_size=31, color=BG, weight=BOLD)).move_to(RIGHT * 5.5 + UP * 0.1)
        thirty[1].move_to(thirty[0])
        front = Text("front", font_size=30, color=TEAL, weight=BOLD).next_to(cells[0], DOWN, buff=0.5)
        rear = Text("rear", font_size=30, color=CORAL, weight=BOLD).next_to(cells[2], DOWN, buff=0.5)
        order = Text("10   →   20   →   30", font_size=36, color=YELLOW, weight=BOLD).to_edge(DOWN, buff=0.58)
        self.play(FadeIn(title, shift=DOWN * 0.2), run_time=1.5)
        self.play(Create(cells), FadeIn(ten), run_time=2.0)
        self.play(FadeIn(twenty, shift=LEFT * 0.2), twenty.animate.move_to(cells[1]), run_time=2.0)
        self.play(FadeIn(thirty, shift=LEFT * 0.2), thirty.animate.move_to(cells[2]), run_time=2.2)
        self.play(Write(front), Write(rear), Circumscribe(cells[0], color=TEAL), Circumscribe(cells[2], color=CORAL), run_time=2.0)
        self.play(Write(order), run_time=2.1)
        self.wait(5.16)


class DequeueTen(Scene):
    # Target: 14.64s (from scene06-dequeue.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("DEQUEUE", font_size=42, color=TEXT, weight=BOLD).to_edge(UP, buff=0.45)
        cells = VGroup(*[Square(1.18, color=MUTED, fill_color=CARD, fill_opacity=0.9) for _ in range(5)]).arrange(RIGHT, buff=0.1).move_to(UP * 0.1)
        values = VGroup(*[Text(v, font_size=38, color=TEXT, weight=BOLD).move_to(cells[i]) for i, v in enumerate(("10", "20", "30"))])
        front = Text("front", font_size=30, color=TEAL, weight=BOLD).next_to(cells[0], DOWN, buff=0.5)
        rear = Text("rear", font_size=30, color=CORAL, weight=BOLD).next_to(cells[2], DOWN, buff=0.5)
        result = VGroup(RoundedRectangle(width=2.0, height=0.82, corner_radius=0.14, color=YELLOW, fill_color=YELLOW, fill_opacity=0.9), Text("OUT: 10", font_size=31, color=BG, weight=BOLD)).to_edge(LEFT, buff=0.55).shift(DOWN * 0.05)
        result[1].move_to(result[0])
        self.play(FadeIn(title, shift=DOWN * 0.2), run_time=1.5)
        self.play(Create(cells), FadeIn(values), FadeIn(front), FadeIn(rear), run_time=2.0)
        self.play(Circumscribe(cells[0], color=TEAL), values[0].animate.set_color(YELLOW), run_time=1.5)
        self.play(values[0].animate.move_to(result[0].get_center()), FadeIn(result[0]), run_time=2.0)
        self.play(front.animate.next_to(cells[1], DOWN, buff=0.5), cells[1].animate.set_color(TEAL), run_time=1.5)
        self.play(Write(result[1]), Circumscribe(cells[2], color=CORAL), run_time=2.0)
        self.wait(4.14)


class PointerResponsibility(Scene):
    # Target: 13.72s (from scene07-responsibility.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("ONE JOB  ·  ONE POINTER", font_size=40, color=TEXT, weight=BOLD).to_edge(UP, buff=0.45)
        left = VGroup(RoundedRectangle(width=5.1, height=2.1, corner_radius=0.18, color=CORAL, fill_color=CARD, fill_opacity=0.95), Text("ENQUEUE", font_size=38, color=CORAL, weight=BOLD), Text("moves  rear", font_size=28, color=TEXT)).arrange(DOWN, buff=0.22).move_to(LEFT * 3.35)
        left[0].stretch_to_fit_height(2.1).stretch_to_fit_width(5.1)
        left[1].move_to(left[0].get_center() + UP * 0.32)
        left[2].move_to(left[0].get_center() + DOWN * 0.38)
        right = VGroup(RoundedRectangle(width=5.1, height=2.1, corner_radius=0.18, color=TEAL, fill_color=CARD, fill_opacity=0.95), Text("DEQUEUE", font_size=38, color=TEAL, weight=BOLD), Text("moves  front", font_size=28, color=TEXT)).arrange(DOWN, buff=0.22).move_to(RIGHT * 3.35)
        right[0].stretch_to_fit_height(2.1).stretch_to_fit_width(5.1)
        right[1].move_to(right[0].get_center() + UP * 0.32)
        right[2].move_to(right[0].get_center() + DOWN * 0.38)
        divider = Line(UP * 1.5, DOWN * 1.8, color=MUTED, stroke_width=3)
        rule = Text("DO  NOT  MIX  THE  ROLES", font_size=32, color=YELLOW, weight=BOLD).to_edge(DOWN, buff=0.62)
        self.play(FadeIn(title, shift=DOWN * 0.2), run_time=1.5)
        self.play(DrawBorderThenFill(left[0]), Write(left[1]), Write(left[2]), run_time=1.5)
        self.play(DrawBorderThenFill(right[0]), Write(right[1]), Write(right[2]), run_time=1.5)
        self.play(Create(divider), GrowArrow(Arrow(left.get_right(), divider.get_left(), color=CORAL, buff=0.15)), GrowArrow(Arrow(right.get_left(), divider.get_right(), color=TEAL, buff=0.15)), run_time=2.0)
        self.play(Write(rule), run_time=1.5)
        self.play(Circumscribe(left[0], color=CORAL), Circumscribe(right[0], color=TEAL), run_time=2.0)
        self.wait(3.72)


class QueueSummary(Scene):
    # Target: 15.92s (from scene08-summary.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("FIFO  ·  QUEUE", font_size=42, color=TEXT, weight=BOLD).to_edge(UP, buff=0.45)
        cells = VGroup(*[Square(1.18, color=MUTED, fill_color=CARD, fill_opacity=0.92) for _ in range(5)]).arrange(RIGHT, buff=0.1).move_to(UP * 0.15)
        values = VGroup(*[Text(v, font_size=38, color=TEXT, weight=BOLD).move_to(cells[i]) for i, v in enumerate(("20", "30", "40"))])
        front = Text("front", font_size=30, color=TEAL, weight=BOLD).next_to(cells[0], DOWN, buff=0.5)
        rear = Text("rear", font_size=30, color=CORAL, weight=BOLD).next_to(cells[2], DOWN, buff=0.5)
        out_arrow = Arrow(cells[0].get_left() + LEFT * 1.25, cells[0].get_left() + LEFT * 0.08, color=TEAL, buff=0.08)
        in_arrow = Arrow(cells[2].get_right() + RIGHT * 1.25, cells[2].get_right() + RIGHT * 0.08, color=CORAL, buff=0.08)
        formula = Text("NEW  IN  →  OLD  OUT", font_size=35, color=YELLOW, weight=BOLD).to_edge(DOWN, buff=1.25)
        question = Text("WHICH END MOVES?", font_size=30, color=TEXT).to_edge(DOWN, buff=0.48)
        self.play(FadeIn(title, shift=DOWN * 0.2), run_time=1.5)
        self.play(Create(cells), run_time=2.0)
        self.play(FadeIn(values, shift=UP * 0.15), Write(front), Write(rear), run_time=2.0)
        self.play(GrowArrow(out_arrow), GrowArrow(in_arrow), run_time=1.5)
        self.play(Write(formula), Circumscribe(cells[0], color=TEAL), Circumscribe(cells[2], color=CORAL), run_time=2.2)
        self.play(Write(question), run_time=2.0)
        self.wait(4.72)
