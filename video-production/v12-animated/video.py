from manim import *

BG="#10283F"; TEAL="#35D1C8"; GOLD="#F3C969"; CORAL="#FF7A59"
def graph():
    p={"A":UP*1.5,"B":LEFT*2+DOWN*.3,"C":RIGHT*2+DOWN*.3,"D":LEFT*2.7+DOWN*2.5,"E":RIGHT*2.7+DOWN*2.5}
    nodes=VGroup(*[VGroup(Circle(.42,color=TEAL,fill_color=BG,fill_opacity=1).move_to(x),Text(k,font_size=25).move_to(x)) for k,x in p.items()])
    es=VGroup(*[Line(p[a],p[b],color=TEAL) for a,b in [("A","B"),("A","C"),("B","D"),("C","E"),("D","E")]])
    return nodes,es
def title(s): return Text(s,font_size=38,color=TEAL).to_edge(UP)
class GraphHook(Scene):
 def construct(self):
  n,e=graph();self.play(Write(title("Graph: many routes")),Create(e),FadeIn(n),run_time=2);self.play(Circumscribe(n,color=GOLD),run_time=1.5);self.wait(12.26)
class BFSWave(Scene):
 def construct(self):
  n,e=graph();self.play(Write(title("BFS: nearest first")),Create(e),FadeIn(n),run_time=2);self.play(Circumscribe(n[0],color=GOLD),Circumscribe(VGroup(n[1],n[2]),color=GOLD),run_time=2);self.wait(10.28)
class BFSQueue(Scene):
 def construct(self):
  n,e=graph();q=Text("Queue: B  →  C",font_size=32,color=GOLD).to_edge(DOWN);self.play(Write(title("BFS uses a queue")),Create(e),FadeIn(n),run_time=2);self.play(Write(q),Circumscribe(VGroup(n[1],n[2]),color=GOLD),run_time=1.7);self.wait(10.54)
class BFSLayer(Scene):
 def construct(self):
  n,e=graph();self.play(Write(title("Finish this layer first")),Create(e),FadeIn(n),run_time=2);self.play(Circumscribe(n[1],color=GOLD),Circumscribe(n[2],color=GOLD),run_time=1.5);self.wait(7.74)
class DFSPath(Scene):
 def construct(self):
  n,e=graph();self.play(Write(title("DFS: follow one path")),Create(e),FadeIn(n),run_time=2);self.play(Circumscribe(VGroup(n[0],n[1],n[3]),color=CORAL),run_time=1.7);self.wait(8.06)
class DFSReturn(Scene):
 def construct(self):
  n,e=graph();self.play(Write(title("DFS returns, then continues")),Create(e),FadeIn(n),run_time=2);self.play(Indicate(n[3],color=CORAL),Indicate(n[1],color=GOLD),run_time=1.6);self.wait(9.32)
class Visited(Scene):
 def construct(self):
  n,e=graph();marks=VGroup(*[Text("✓",font_size=34,color=GOLD).next_to(x,UR,buff=.05) for x in n]);self.play(Write(title("Mark every visited node")),Create(e),FadeIn(n),run_time=2);self.play(FadeIn(marks),run_time=1.8);self.wait(11.1)
class Summary(Scene):
 def construct(self):
  n,e=graph();a=Text("BFS = layers",font_size=30,color=GOLD).shift(LEFT*3+DOWN*3);b=Text("DFS = depth",font_size=30,color=CORAL).shift(RIGHT*3+DOWN*3);self.play(Write(title("Choose the traversal")),Create(e),FadeIn(n),run_time=2);self.play(Write(a),Write(b),run_time=1.5);self.wait(10.78)
