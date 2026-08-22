from manim import *


BG = "#071A29"
NODE = "#173B58"
TEAL = "#35D1C8"
CORAL = "#FF7A59"
GOLD = "#FFD166"
TEXT = "#F4F7FB"
MUTED = "#8FA9BC"


class LinkedQueueHook(Scene):
    # Target: 19.920s (from scene01-hook.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("LINKED QUEUE · FIFO", font_size=48, color=TEXT).to_edge(UP, buff=0.42)
        subtitle = Text("NODES, NOT SLOTS", font_size=24, color=MUTED).next_to(title, DOWN, buff=0.18)
        values = ["10", "20", "30"]
        nodes = VGroup(*[RoundedRectangle(corner_radius=0.18, width=1.45, height=1.05, color=TEAL, fill_color=NODE, fill_opacity=1) for _ in values]).arrange(RIGHT, buff=0.65).shift(UP*0.2)
        labels = VGroup(*[Text(v, font_size=38, color=TEXT).move_to(node) for v, node in zip(values, nodes)])
        links = VGroup(*[Arrow(nodes[i].get_right(), nodes[i+1].get_left(), buff=0.12, color=TEAL, stroke_width=5, max_tip_length_to_length_ratio=0.18) for i in range(2)])
        nexts = VGroup(*[Text("next", font_size=20, color=MUTED).next_to(link, UP, buff=0.12) for link in links])
        fifo = Text("FIRST IN  →  FIRST OUT", font_size=33, color=GOLD).to_edge(DOWN, buff=0.65)
        marker = Circle(radius=0.25, color=GOLD, fill_opacity=1).move_to(nodes[0].get_top() + UP*0.55)
        self.play(Write(title), run_time=1.2)
        self.play(FadeIn(subtitle), run_time=1.0)
        self.play(LaggedStart(*[DrawBorderThenFill(n) for n in nodes], lag_ratio=0.18), FadeIn(labels), run_time=2.0)
        self.play(LaggedStart(*[Create(link) for link in links], lag_ratio=0.2), FadeIn(nexts), run_time=1.4)
        self.play(FadeIn(marker), run_time=1.4)
        self.play(Write(fifo), run_time=1.0)
        self.play(marker.animate.move_to(nodes[2].get_top() + UP*0.55), run_time=2.0)
        self.wait(9.92)


class FrontRearPointers(Scene):
    # Target: 19.400s (from scene02-pointers.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("TWO ENDS · TWO JOBS", font_size=48, color=TEXT).to_edge(UP, buff=0.42)
        nodes = VGroup(*[RoundedRectangle(corner_radius=0.18, width=1.45, height=1.05, color=TEAL, fill_color=NODE, fill_opacity=1) for _ in range(3)]).arrange(RIGHT, buff=0.65).shift(UP*0.1)
        labels = VGroup(*[Text(v, font_size=38, color=TEXT).move_to(n) for v, n in zip(["10", "20", "30"], nodes)])
        links = VGroup(*[Arrow(nodes[i].get_right(), nodes[i+1].get_left(), buff=0.12, color=TEAL, stroke_width=5, max_tip_length_to_length_ratio=0.18) for i in range(2)])
        front_arrow = Arrow(nodes[0].get_bottom()+DOWN*0.95, nodes[0].get_bottom()+DOWN*0.18, buff=0, color=TEAL, stroke_width=6)
        rear_arrow = Arrow(nodes[2].get_bottom()+DOWN*0.95, nodes[2].get_bottom()+DOWN*0.18, buff=0, color=CORAL, stroke_width=6)
        front = Text("front · leaves", font_size=28, color=TEAL).next_to(front_arrow, DOWN, buff=0.12)
        rear = Text("rear · enters", font_size=28, color=CORAL).next_to(rear_arrow, DOWN, buff=0.12)
        badge = Text("O(1) AT BOTH ENDS", font_size=30, color=GOLD).to_edge(DOWN, buff=0.55)
        glow = SurroundingRectangle(nodes[0], color=TEAL, buff=0.16)
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[DrawBorderThenFill(n) for n in nodes], lag_ratio=0.16), FadeIn(labels), run_time=2.0)
        self.play(LaggedStart(*[Create(link) for link in links], lag_ratio=0.2), run_time=1.2)
        self.play(GrowArrow(front_arrow), FadeIn(front), run_time=1.2)
        self.play(GrowArrow(rear_arrow), FadeIn(rear), run_time=1.2)
        self.play(Create(glow), glow.animate.move_to(nodes[2]), run_time=2.0)
        self.play(Write(badge), run_time=1.0)
        self.wait(9.8)


class EmptyQueue(Scene):
    # Target: 14.200s (from scene03-empty.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("EMPTY QUEUE", font_size=50, color=TEXT).to_edge(UP, buff=0.42)
        front = Text("front = null", font_size=38, color=TEAL).shift(LEFT*3 + UP*0.4)
        rear = Text("rear = null", font_size=38, color=CORAL).shift(RIGHT*3 + UP*0.4)
        node = RoundedRectangle(corner_radius=0.18, width=1.55, height=1.1, color=TEAL, fill_color=NODE, fill_opacity=1).shift(DOWN*0.2)
        value = Text("?", font_size=42, color=TEXT).move_to(node)
        state = Text("NO FIRST NODE · NO LAST NODE", font_size=29, color=GOLD).to_edge(DOWN, buff=0.7)
        self.play(Write(title), run_time=1.0)
        self.play(Write(front), Write(rear), run_time=1.2)
        self.play(DrawBorderThenFill(node), FadeIn(value), run_time=1.2)
        self.play(FadeOut(node), FadeOut(value), run_time=1.2)
        self.play(Circumscribe(front, color=TEAL), Circumscribe(rear, color=CORAL), run_time=1.0)
        self.play(Write(state), run_time=1.0)
        self.wait(7.6)


class FirstEnqueue(Scene):
    # Target: 18.000s (from scene04-first-enqueue.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("ENQUEUE · FIRST NODE", font_size=48, color=TEXT).to_edge(UP, buff=0.42)
        null_front = Text("front = null", font_size=30, color=TEAL).shift(LEFT*3.0 + UP*0.3)
        null_rear = Text("rear = null", font_size=30, color=CORAL).shift(RIGHT*3.0 + UP*0.3)
        node = RoundedRectangle(corner_radius=0.18, width=1.55, height=1.1, color=TEAL, fill_color=NODE, fill_opacity=1).shift(DOWN*0.05)
        ten = Text("10", font_size=42, color=TEXT).move_to(node)
        front_arrow = Arrow(node.get_bottom()+DOWN*1.0, node.get_bottom()+DOWN*0.18, buff=0, color=TEAL, stroke_width=6)
        rear_arrow = Arrow(node.get_top()+UP*1.0, node.get_top()+UP*0.18, buff=0, color=CORAL, stroke_width=6)
        front = Text("front", font_size=30, color=TEAL).next_to(front_arrow, DOWN, buff=0.1)
        rear = Text("rear", font_size=30, color=CORAL).next_to(rear_arrow, UP, buff=0.1)
        rule = Text("FIRST NODE: front AND rear", font_size=30, color=GOLD).to_edge(DOWN, buff=0.58)
        self.play(Write(title), run_time=1.0)
        self.play(Write(null_front), Write(null_rear), run_time=1.2)
        self.play(DrawBorderThenFill(node), FadeIn(ten), run_time=2.0)
        self.play(GrowArrow(front_arrow), GrowArrow(rear_arrow), FadeIn(front), FadeIn(rear), run_time=1.8)
        self.play(FadeOut(null_front), FadeOut(null_rear), run_time=1.5)
        self.play(Circumscribe(node, color=GOLD), run_time=1.0)
        self.play(Write(rule), run_time=1.0)
        self.wait(8.5)


class MoreEnqueue(Scene):
    # Target: 16.480s (from scene05-more-enqueue.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("ENQUEUE AT REAR", font_size=50, color=TEXT).to_edge(UP, buff=0.42)
        n10 = RoundedRectangle(corner_radius=0.18, width=1.35, height=1.0, color=TEAL, fill_color=NODE, fill_opacity=1).shift(LEFT*2.65)
        t10 = Text("10", font_size=38, color=TEXT).move_to(n10)
        front_arrow = Arrow(n10.get_bottom()+DOWN*0.9, n10.get_bottom()+DOWN*0.16, buff=0, color=TEAL, stroke_width=6)
        front = Text("front", font_size=28, color=TEAL).next_to(front_arrow, DOWN, buff=0.08)
        rear_arrow = Arrow(n10.get_top()+UP*0.85, n10.get_top()+UP*0.16, buff=0, color=CORAL, stroke_width=6)
        rear = Text("rear", font_size=28, color=CORAL).next_to(rear_arrow, UP, buff=0.08)
        n20 = RoundedRectangle(corner_radius=0.18, width=1.35, height=1.0, color=TEAL, fill_color=NODE, fill_opacity=1).move_to(ORIGIN)
        t20 = Text("20", font_size=38, color=TEXT).move_to(n20)
        n30 = RoundedRectangle(corner_radius=0.18, width=1.35, height=1.0, color=TEAL, fill_color=NODE, fill_opacity=1).shift(RIGHT*2.65)
        t30 = Text("30", font_size=38, color=TEXT).move_to(n30)
        l1 = Arrow(n10.get_right(), n20.get_left(), buff=0.12, color=TEAL, stroke_width=5)
        l2 = Arrow(n20.get_right(), n30.get_left(), buff=0.12, color=TEAL, stroke_width=5)
        rule = Text("LINK NEW NODE → MOVE rear", font_size=28, color=GOLD).to_edge(DOWN, buff=0.58)
        self.play(Write(title), run_time=1.0)
        self.play(DrawBorderThenFill(n10), FadeIn(t10), run_time=1.2)
        self.play(GrowArrow(front_arrow), GrowArrow(rear_arrow), FadeIn(front), FadeIn(rear), run_time=1.2)
        self.play(DrawBorderThenFill(n20), FadeIn(t20), run_time=1.6)
        self.play(Create(l1), rear_arrow.animate.move_to(n20.get_top()+UP*0.5), rear.animate.next_to(n20.get_top()+UP*0.85, UP, buff=0.08), run_time=1.6)
        self.play(DrawBorderThenFill(n30), FadeIn(t30), run_time=1.6)
        self.play(Create(l2), rear_arrow.animate.move_to(n30.get_top()+UP*0.5), rear.animate.next_to(n30.get_top()+UP*0.85, UP, buff=0.08), run_time=1.6)
        self.play(Circumscribe(n10, color=TEAL), run_time=1.0)
        self.play(Write(rule), run_time=1.0)
        self.wait(4.68)


class DequeueAtFront(Scene):
    # Target: 16.320s (from scene06-dequeue.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("DEQUEUE AT front", font_size=50, color=TEXT).to_edge(UP, buff=0.42)
        nodes = VGroup(*[RoundedRectangle(corner_radius=0.18, width=1.35, height=1.0, color=TEAL, fill_color=NODE, fill_opacity=1) for _ in range(3)]).arrange(RIGHT, buff=0.65).shift(UP*0.1)
        labels = VGroup(*[Text(v, font_size=38, color=TEXT).move_to(n) for v, n in zip(["10", "20", "30"], nodes)])
        links = VGroup(*[Arrow(nodes[i].get_right(), nodes[i+1].get_left(), buff=0.12, color=TEAL, stroke_width=5) for i in range(2)])
        front_arrow = Arrow(nodes[0].get_bottom()+DOWN*0.95, nodes[0].get_bottom()+DOWN*0.18, buff=0, color=TEAL, stroke_width=6)
        front = Text("front", font_size=28, color=TEAL).next_to(front_arrow, DOWN, buff=0.08)
        rear = Text("rear", font_size=28, color=CORAL).next_to(nodes[2], UP, buff=0.5)
        result = RoundedRectangle(corner_radius=0.14, width=1.35, height=0.75, color=GOLD, fill_color="#604E1E", fill_opacity=1).to_edge(LEFT, buff=0.7)
        out = Text("10 out", font_size=27, color=GOLD).move_to(result)
        rule = Text("MOVE front · KEEP rear", font_size=29, color=GOLD).to_edge(DOWN, buff=0.58)
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[DrawBorderThenFill(n) for n in nodes], lag_ratio=0.14), FadeIn(labels), Create(links), run_time=1.6)
        self.play(GrowArrow(front_arrow), FadeIn(front), FadeIn(rear), run_time=1.2)
        self.play(nodes[0].animate.move_to(result), labels[0].animate.move_to(result), FadeIn(out), FadeOut(links[0]), run_time=1.8)
        new_arrow = Arrow(nodes[1].get_bottom()+DOWN*0.95, nodes[1].get_bottom()+DOWN*0.18, buff=0, color=TEAL, stroke_width=6)
        self.play(ReplacementTransform(front_arrow, new_arrow), front.animate.next_to(new_arrow, DOWN, buff=0.08), run_time=1.5)
        self.play(Circumscribe(nodes[2], color=CORAL), run_time=1.0)
        self.play(Write(rule), run_time=1.0)
        self.wait(7.22)


class ResetOnLastNode(Scene):
    # Target: 18.200s (from scene07-last-node.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("LAST NODE · RESET BOTH", font_size=48, color=TEXT).to_edge(UP, buff=0.42)
        node = RoundedRectangle(corner_radius=0.18, width=1.6, height=1.1, color=TEAL, fill_color=NODE, fill_opacity=1)
        value = Text("30", font_size=42, color=TEXT).move_to(node)
        front_arrow = Arrow(node.get_bottom()+DOWN*0.95, node.get_bottom()+DOWN*0.18, buff=0, color=TEAL, stroke_width=6)
        rear_arrow = Arrow(node.get_top()+UP*0.95, node.get_top()+UP*0.18, buff=0, color=CORAL, stroke_width=6)
        front = Text("front", font_size=29, color=TEAL).next_to(front_arrow, DOWN, buff=0.1)
        rear = Text("rear", font_size=29, color=CORAL).next_to(rear_arrow, UP, buff=0.1)
        exit_anchor = LEFT*4.25 + DOWN*0.15
        result = Text("30 OUT", font_size=26, color=GOLD).move_to(exit_anchor + DOWN*1.0)
        null_front = Text("front = null", font_size=34, color=TEAL).shift(LEFT*1.55 + DOWN*0.15)
        null_rear = Text("rear = null", font_size=34, color=CORAL).shift(RIGHT*3.0 + DOWN*0.15)
        rule = Text("EMPTY = CONSISTENT POINTERS", font_size=29, color=GOLD).to_edge(DOWN, buff=0.58)
        self.play(Write(title), run_time=1.0)
        self.play(DrawBorderThenFill(node), FadeIn(value), run_time=1.2)
        self.play(GrowArrow(front_arrow), GrowArrow(rear_arrow), FadeIn(front), FadeIn(rear), run_time=1.2)
        self.play(node.animate.move_to(exit_anchor), value.animate.move_to(exit_anchor), FadeIn(result), FadeOut(front_arrow), FadeOut(rear_arrow), FadeOut(front), FadeOut(rear), run_time=1.8)
        self.play(Write(null_front), run_time=1.3)
        self.play(Write(null_rear), run_time=1.3)
        self.play(Circumscribe(null_front, color=TEAL), Circumscribe(null_rear, color=CORAL), run_time=1.2)
        self.play(Write(rule), run_time=1.0)
        self.wait(8.2)


class LinkedQueueSummary(Scene):
    # Target: 19.600s (from scene08-summary.wav)
    def construct(self):
        self.camera.background_color = BG
        title = Text("LINKED QUEUE · SUMMARY", font_size=48, color=TEXT).to_edge(UP, buff=0.42)
        nodes = VGroup(*[RoundedRectangle(corner_radius=0.18, width=1.35, height=1.0, color=TEAL, fill_color=NODE, fill_opacity=1) for _ in range(3)]).arrange(RIGHT, buff=0.65).shift(UP*0.15)
        labels = VGroup(*[Text(v, font_size=38, color=TEXT).move_to(n) for v, n in zip(["20", "30", "40"], nodes)])
        links = VGroup(*[Arrow(nodes[i].get_right(), nodes[i+1].get_left(), buff=0.12, color=TEAL, stroke_width=5) for i in range(2)])
        front_arrow = Arrow(nodes[0].get_bottom()+DOWN*0.9, nodes[0].get_bottom()+DOWN*0.15, buff=0, color=TEAL, stroke_width=6)
        rear_arrow = Arrow(nodes[2].get_top()+UP*0.9, nodes[2].get_top()+UP*0.15, buff=0, color=CORAL, stroke_width=6)
        front = Text("front · out", font_size=28, color=TEAL).next_to(front_arrow, DOWN, buff=0.08)
        rear = Text("rear · in", font_size=28, color=CORAL).next_to(rear_arrow, UP, buff=0.08)
        fifo = Text("FIRST IN  →  FIRST OUT", font_size=31, color=GOLD).shift(DOWN*1.65)
        empty = Text("LAST OUT  →  front = rear = null", font_size=28, color=TEXT).next_to(fifo, DOWN, buff=0.35)
        question = Text("WHY RESET rear?", font_size=33, color=GOLD).to_edge(DOWN, buff=0.72)
        answer = Text("SO EMPTY HAS ONE CLEAR STATE", font_size=25, color=MUTED).next_to(question, UP, buff=0.25)
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[DrawBorderThenFill(n) for n in nodes], lag_ratio=0.14), FadeIn(labels), run_time=1.6)
        self.play(Create(links), run_time=1.2)
        self.play(GrowArrow(front_arrow), GrowArrow(rear_arrow), FadeIn(front), FadeIn(rear), run_time=1.3)
        self.play(Write(fifo), run_time=1.2)
        self.play(Write(empty), run_time=1.2)
        self.play(Write(question), run_time=1.4)
        self.play(FadeIn(answer), run_time=1.4)
        self.wait(9.3)
