from manim import *

BG = "#10283F"
TEAL = "#35D1C8"
GOLD = "#F3C969"
CORAL = "#FF7A59"


def node(value, point, color=TEAL):
    circle = Circle(radius=0.48, color=color, fill_color=BG, fill_opacity=1).move_to(point)
    label = Text(str(value), font_size=30, color=WHITE).move_to(circle)
    return VGroup(circle, label)


def tree_base():
    root = node(8, UP * 1.5)
    left = node(4, LEFT * 2.4 + DOWN * 0.4)
    right = node(12, RIGHT * 2.4 + DOWN * 0.4)
    target = node(10, RIGHT * 1.25 + DOWN * 2.2, CORAL)
    edges = VGroup(
        Line(root[0].get_bottom(), left[0].get_top(), color=TEAL),
        Line(root[0].get_bottom(), right[0].get_top(), color=TEAL),
        Line(right[0].get_bottom(), target[0].get_top(), color=TEAL),
    )
    return root, left, right, target, edges


class BSTHook(Scene):
    # Target: 17.32s (scene01-hook.wav)
    def construct(self):
        title = Text("BST: one comparison", font_size=40, color=TEAL).to_edge(UP)
        r, l, rt, t, edges = tree_base()
        prompt = Text("smaller or larger?", font_size=34, color=GOLD).to_edge(DOWN, buff=0.7)
        self.play(Write(title), run_time=0.8)
        self.play(Create(edges), FadeIn(VGroup(r, l, rt, t)), run_time=2.0)
        self.play(Circumscribe(r, color=GOLD), run_time=1.2)
        self.play(FadeOut(l, shift=LEFT), r.animate.set_color(GOLD), run_time=1.4)
        self.play(FadeIn(prompt), Circumscribe(VGroup(rt, t), color=CORAL), run_time=1.4)
        self.wait(10.52)


class BSTRule(Scene):
    # Target: 13.44s (scene02-rule.wav)
    def construct(self):
        title = Text("The BST rule", font_size=40, color=TEAL).to_edge(UP)
        root, left, right, _, edges = tree_base()
        left_note = Text("smaller → left", font_size=28, color=TEAL).next_to(left, DOWN)
        right_note = Text("larger → right", font_size=28, color=GOLD).next_to(right, DOWN)
        self.play(Write(title), run_time=0.8)
        self.play(FadeIn(root), run_time=0.8)
        self.play(Create(edges[:2]), FadeIn(left), FadeIn(right), run_time=1.8)
        self.play(Write(left_note), Write(right_note), run_time=1.4)
        self.play(Circumscribe(VGroup(root, left, right), color=GOLD), run_time=1.2)
        self.wait(7.44)


class SearchRight(Scene):
    # Target: 13.72s (scene03-search-right.wav)
    def construct(self):
        title = Text("Search for 10", font_size=40, color=TEAL).to_edge(UP)
        r, l, rt, t, edges = tree_base()
        q = Text("10 > 8", font_size=36, color=CORAL).to_edge(DOWN, buff=0.7)
        self.play(Write(title), Create(edges), FadeIn(VGroup(r, l, rt, t)), run_time=2.0)
        self.play(Circumscribe(r, color=CORAL), Write(q), run_time=1.3)
        self.play(l.animate.set_opacity(0.18), edges[0].animate.set_opacity(0.18), run_time=1.2)
        self.play(Circumscribe(rt, color=GOLD), run_time=1.1)
        self.wait(8.12)


class SearchLeft(Scene):
    # Target: 14.16s (scene04-search-left.wav)
    def construct(self):
        title = Text("Then go left", font_size=40, color=TEAL).to_edge(UP)
        r, l, rt, t, edges = tree_base()
        q = Text("10 < 12", font_size=36, color=CORAL).to_edge(DOWN, buff=0.7)
        self.play(Write(title), Create(edges), FadeIn(VGroup(r, l, rt, t)), run_time=2.0)
        self.play(Circumscribe(rt, color=CORAL), Write(q), run_time=1.3)
        self.play(FadeIn(t, scale=1.15), Circumscribe(t, color=GOLD), run_time=1.5)
        self.play(Circumscribe(edges[2], color=TEAL), run_time=1.1)
        self.wait(8.26)


class PruneBranch(Scene):
    # Target: 13.36s (scene05-prune.wav)
    def construct(self):
        title = Text("One branch disappears", font_size=40, color=TEAL).to_edge(UP)
        r, l, rt, t, edges = tree_base()
        note = Text("comparison removes a branch", font_size=30, color=GOLD).to_edge(DOWN, buff=0.7)
        self.play(Write(title), Create(edges), FadeIn(VGroup(r, l, rt, t)), run_time=2.0)
        self.play(FadeOut(VGroup(l, edges[0]), shift=LEFT), run_time=1.4)
        self.play(FadeIn(note), Circumscribe(VGroup(r, rt, t), color=GOLD), run_time=1.4)
        self.wait(8.56)


class BalanceMatters(Scene):
    # Target: 13.48s (scene06-balance.wav)
    def construct(self):
        title = Text("Balance keeps paths short", font_size=38, color=TEAL).to_edge(UP)
        balanced = VGroup(*tree_base()[:4]).scale(0.72).shift(LEFT * 3)
        chain = VGroup(*[node(v, RIGHT * 3 + DOWN * (i * 1.1 - 1.4), CORAL) for i, v in enumerate([4, 8, 12])])
        tags = VGroup(Text("balanced", font_size=26, color=TEAL).next_to(balanced, DOWN), Text("long chain", font_size=26, color=CORAL).next_to(chain, DOWN))
        self.play(Write(title), FadeIn(balanced), FadeIn(chain), run_time=2.0)
        self.play(Write(tags), run_time=1.2)
        self.play(Circumscribe(balanced, color=GOLD), Circumscribe(chain, color=CORAL), run_time=1.5)
        self.wait(8.78)


class InsertValue(Scene):
    # Target: 13.64s (scene07-insert.wav)
    def construct(self):
        title = Text("Insert by comparing", font_size=40, color=TEAL).to_edge(UP)
        r, l, rt, t, edges = tree_base()
        new = node(14, RIGHT * 3.7 + DOWN * 2.15, GOLD)
        new_edge = Line(rt[0].get_bottom(), new[0].get_top(), color=GOLD)
        self.play(Write(title), Create(edges[:2]), FadeIn(VGroup(r, l, rt)), run_time=1.8)
        self.play(Circumscribe(r, color=GOLD), Circumscribe(rt, color=GOLD), run_time=1.3)
        self.play(Create(new_edge), FadeIn(new), run_time=1.4)
        self.play(Circumscribe(new, color=GOLD), run_time=1.0)
        self.wait(8.14)


class BSTSummary(Scene):
    # Target: 15.04s (scene08-summary.wav)
    def construct(self):
        title = Text("BST: decide, then follow", font_size=39, color=TEAL).to_edge(UP)
        r, l, rt, t, edges = tree_base()
        left_rule = Text("smaller → left", font_size=28, color=TEAL).shift(LEFT * 3.3 + DOWN * 3)
        right_rule = Text("larger → right", font_size=28, color=GOLD).shift(RIGHT * 3.3 + DOWN * 3)
        self.play(Write(title), Create(edges), FadeIn(VGroup(r, l, rt, t)), run_time=2.0)
        self.play(Write(left_rule), Write(right_rule), run_time=1.3)
        self.play(Circumscribe(VGroup(r, l, rt, t), color=GOLD), run_time=1.4)
        self.wait(10.34)
