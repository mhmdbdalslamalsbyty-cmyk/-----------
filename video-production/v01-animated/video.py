from manim import *


class V01Hook(Scene):
    # Target: 13.04s (from scene01-hook.wav)
    def construct(self):
        bg = Rectangle(width=config.frame_width, height=config.frame_height, fill_color="#0B1F2A", fill_opacity=1, stroke_width=0)
        title = Text("Why organize data?", font_size=42, color="#12B8A6").to_edge(UP)
        cards = VGroup(*[
            RoundedRectangle(width=1.45, height=0.82, corner_radius=0.12, fill_color="#12B8A6", fill_opacity=0.85, stroke_color=WHITE, stroke_width=1)
            for _ in range(6)
        ])
        cards.arrange_in_grid(rows=2, cols=3, buff=0.34).shift(DOWN * 0.45 + LEFT * 1.0)
        target = RoundedRectangle(width=1.55, height=1.25, corner_radius=0.16, fill_color="#173B4C", fill_opacity=1, stroke_color="#FF7A66", stroke_width=3).shift(RIGHT * 4.1 + DOWN * 0.45)
        target_dot = Dot(color="#FF7A66", radius=0.13).move_to(target.get_center())
        route = DashedLine(cards[0].get_right(), target.get_left(), color="#F7F3E8", dash_length=0.16)
        halo = Circle(radius=0.95, color="#FF7A66").move_to(cards[0]).set_stroke(width=3)
        self.add(bg)
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[GrowFromCenter(card) for card in cards], lag_ratio=0.12), run_time=1.2)
        self.play(DrawBorderThenFill(target), GrowFromCenter(target_dot), run_time=1.2)
        self.play(Create(route), run_time=1.2)
        self.play(cards[0].animate.shift(RIGHT * 1.6 + UP * 0.55), cards[4].animate.shift(LEFT * 0.6 + DOWN * 0.35), run_time=2.2, rate_func=smooth)
        self.play(cards[0].animate.shift(LEFT * 0.75 + DOWN * 0.9), route.animate.set_color("#FF7A66"), run_time=1.8)
        self.play(Create(halo), Circumscribe(cards[0], color="#FF7A66"), run_time=1.7)
        self.play(cards[0].animate.move_to(target.get_center()).scale(0.65), FadeOut(route), run_time=1.5)
        self.wait(1.24)


class V01DataAndInstructions(Scene):
    # Target: 14.60s (from scene02-data-instructions.wav)
    def construct(self):
        bg = Rectangle(width=config.frame_width, height=config.frame_height, fill_color="#0B1F2A", fill_opacity=1, stroke_width=0)
        title = Text("Instructions and data", font_size=42, color="#12B8A6").to_edge(UP)
        cpu = RoundedRectangle(width=2.2, height=1.5, corner_radius=0.18, fill_color="#173B4C", fill_opacity=1, stroke_color="#F7F3E8", stroke_width=2).shift(RIGHT * 3.8 + DOWN * 0.35)
        cpu_core = VGroup(*[Square(side_length=0.26, fill_color="#FF7A66", fill_opacity=0.9, stroke_width=0) for _ in range(9)]).arrange_in_grid(rows=3, cols=3, buff=0.08).move_to(cpu)
        instruction = VGroup(*[
            RoundedRectangle(width=1.55, height=0.48, corner_radius=0.08, fill_color="#FF7A66", fill_opacity=0.95, stroke_width=0)
            for _ in range(3)
        ]).arrange(DOWN, buff=0.18).shift(LEFT * 4.1 + UP * 0.3)
        data_cards = VGroup(*[
            RoundedRectangle(width=0.92, height=0.65, corner_radius=0.1, fill_color="#12B8A6", fill_opacity=0.95, stroke_color=WHITE, stroke_width=1)
            for _ in range(4)
        ]).arrange(RIGHT, buff=0.18).shift(LEFT * 2.2 + DOWN * 2.1)
        command_arrow = Arrow(instruction.get_right(), cpu.get_left(), color="#FF7A66", buff=0.2)
        data_arrow = Arrow(data_cards.get_right(), cpu.get_left() + DOWN * 0.45, color="#12B8A6", buff=0.2)
        focus = SurroundingRectangle(data_cards[1], color="#F7F3E8", buff=0.1)
        self.add(bg)
        self.play(Write(title), run_time=1.0)
        self.play(DrawBorderThenFill(cpu), FadeIn(cpu_core, shift=UP * 0.2), run_time=1.3)
        self.play(LaggedStart(*[FadeIn(x, shift=RIGHT * 0.2) for x in instruction], lag_ratio=0.18), run_time=1.4)
        self.play(GrowArrow(command_arrow), run_time=1.2)
        self.play(LaggedStart(*[GrowFromCenter(card) for card in data_cards], lag_ratio=0.12), run_time=1.2)
        self.play(GrowArrow(data_arrow), run_time=1.2)
        self.play(data_cards.animate.shift(RIGHT * 1.45), command_arrow.animate.set_stroke(width=5), run_time=1.9)
        self.play(Create(focus), cpu_core.animate.set_color("#12B8A6"), run_time=1.3)
        self.play(focus.animate.scale(1.35).set_color("#FF7A66"), data_cards[1].animate.scale(1.12), run_time=1.1)
        self.play(FadeOut(command_arrow), FadeOut(data_arrow), run_time=0.8)
        self.wait(2.2)


class V01RamFlow(Scene):
    # Target: 13.88s (from scene03-ram.wav)
    def construct(self):
        bg = Rectangle(width=config.frame_width, height=config.frame_height, fill_color="#0B1F2A", fill_opacity=1, stroke_width=0)
        title = Text("From disk to RAM", font_size=42, color="#12B8A6").to_edge(UP)
        disk = Cylinder(radius=1.0, height=0.46, fill_color="#173B4C", fill_opacity=1, stroke_color="#F7F3E8").shift(LEFT * 4.6 + DOWN * 0.25)
        disk_dot = Dot(color="#FF7A66", radius=0.15).move_to(disk.get_center())
        ram_cells = VGroup(*[
            RoundedRectangle(width=0.72, height=1.05, corner_radius=0.1, fill_color="#173B4C", fill_opacity=1, stroke_color="#12B8A6", stroke_width=2)
            for _ in range(7)
        ]).arrange(RIGHT, buff=0.1).shift(DOWN * 0.25)
        cpu = Circle(radius=0.78, fill_color="#173B4C", fill_opacity=1, stroke_color="#F7F3E8", stroke_width=2).shift(RIGHT * 4.65 + DOWN * 0.25)
        cpu_dot = Dot(color="#FF7A66", radius=0.14).move_to(cpu)
        packet = RoundedRectangle(width=0.62, height=0.56, corner_radius=0.1, fill_color="#12B8A6", fill_opacity=1, stroke_width=0).move_to(disk.get_right() + RIGHT * 0.55)
        arrow_one = Arrow(disk.get_right(), ram_cells.get_left(), color="#F7F3E8", buff=0.2)
        arrow_two = Arrow(ram_cells.get_right(), cpu.get_left(), color="#F7F3E8", buff=0.2)
        self.add(bg)
        self.play(Write(title), run_time=1.0)
        self.play(DrawBorderThenFill(disk), GrowFromCenter(disk_dot), run_time=1.2)
        self.play(LaggedStart(*[Create(cell) for cell in ram_cells], lag_ratio=0.08), run_time=1.4)
        self.play(Create(cpu), GrowFromCenter(cpu_dot), run_time=1.0)
        self.play(GrowArrow(arrow_one), GrowArrow(arrow_two), run_time=1.2)
        self.play(FadeIn(packet, shift=RIGHT * 0.25), run_time=0.8)
        self.play(packet.animate.move_to(ram_cells[2].get_center()).scale(0.75), ram_cells[2].animate.set_fill("#12B8A6", opacity=0.95), run_time=2.2)
        self.play(packet.animate.move_to(cpu.get_center()).set_fill("#FF7A66"), cpu.animate.scale(1.12), run_time=1.7)
        self.play(cpu.animate.scale(1 / 1.12), FadeOut(packet), run_time=0.8)
        self.wait(2.58)


class V01Organization(Scene):
    # Target: 11.04s (from scene04-organization.wav)
    def construct(self):
        bg = Rectangle(width=config.frame_width, height=config.frame_height, fill_color="#0B1F2A", fill_opacity=1, stroke_width=0)
        title = Text("Order reveals what matters", font_size=40, color="#12B8A6").to_edge(UP)
        shelf = RoundedRectangle(width=9.2, height=2.4, corner_radius=0.18, fill_color="#173B4C", fill_opacity=1, stroke_color="#F7F3E8", stroke_width=2).shift(DOWN * 0.45)
        messy = VGroup(*[
            RoundedRectangle(width=1.25, height=0.72, corner_radius=0.1, fill_color="#FF7A66", fill_opacity=0.95, stroke_width=0).rotate(angle)
            for angle in (-0.55, 0.28, -0.17, 0.48, -0.32)
        ])
        messy.arrange(RIGHT, buff=-0.32).shift(DOWN * 0.5 + LEFT * 0.1)
        ordered = VGroup(*[
            RoundedRectangle(width=1.25, height=0.72, corner_radius=0.1, fill_color="#12B8A6", fill_opacity=0.95, stroke_color=WHITE, stroke_width=1)
            for _ in range(5)
        ]).arrange(RIGHT, buff=0.28).move_to(shelf.get_center())
        selector = Arrow(UP * 0.7, DOWN * 0.05, color="#F7F3E8", buff=0.1).next_to(ordered[3], UP, buff=0.22)
        self.add(bg)
        self.play(Write(title), run_time=1.0)
        self.play(DrawBorderThenFill(shelf), run_time=1.1)
        self.play(LaggedStart(*[GrowFromCenter(card) for card in messy], lag_ratio=0.1), run_time=1.3)
        self.play(ReplacementTransform(messy, ordered), run_time=2.3)
        self.play(LaggedStart(*[card.animate.shift(UP * 0.08) for card in ordered], lag_ratio=0.08), run_time=1.1)
        self.play(GrowArrow(selector), Circumscribe(ordered[3], color="#FF7A66"), run_time=1.2)
        self.play(ordered[3].animate.set_fill("#FF7A66", opacity=1).scale(1.12), run_time=0.9)
        self.wait(2.14)


class V01Operations(Scene):
    # Target: 12.52s (from scene05-operations.wav)
    def construct(self):
        bg = Rectangle(width=config.frame_width, height=config.frame_height, fill_color="#0B1F2A", fill_opacity=1, stroke_width=0)
        title = Text("Choose the repeated operation", font_size=40, color="#12B8A6").to_edge(UP)
        slots = VGroup(*[
            RoundedRectangle(width=2.35, height=1.4, corner_radius=0.18, fill_color="#173B4C", fill_opacity=1, stroke_color="#12B8A6", stroke_width=2)
            for _ in range(4)
        ]).arrange_in_grid(rows=2, cols=2, buff=0.45).shift(DOWN * 0.55)
        icons = VGroup(
            VGroup(Dot(color="#F7F3E8"), Arrow(LEFT * 0.55, RIGHT * 0.55, color="#F7F3E8", buff=0.05)).move_to(slots[0]),
            VGroup(Circle(radius=0.36, color="#F7F3E8"), Line(ORIGIN, RIGHT * 0.45 + DOWN * 0.45, color="#F7F3E8")).move_to(slots[1]),
            VGroup(Arrow(LEFT * 0.6, RIGHT * 0.6, color="#F7F3E8"), Dot(color="#12B8A6")).move_to(slots[2]),
            VGroup(Arrow(RIGHT * 0.6, LEFT * 0.6, color="#F7F3E8"), Dot(color="#FF7A66")).move_to(slots[3]),
        )
        traveler = Dot(color="#FF7A66", radius=0.13).move_to(slots[0].get_center())
        self.add(bg)
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[DrawBorderThenFill(slot) for slot in slots], lag_ratio=0.12), run_time=1.5)
        self.play(LaggedStart(*[FadeIn(icon, shift=UP * 0.15) for icon in icons], lag_ratio=0.15), run_time=1.4)
        self.play(GrowFromCenter(traveler), Circumscribe(slots[0], color="#FF7A66"), run_time=1.0)
        self.play(traveler.animate.move_to(slots[1].get_center()), slots[1].animate.set_stroke("#FF7A66", width=4), run_time=1.5)
        self.play(traveler.animate.move_to(slots[2].get_center()), slots[2].animate.set_stroke("#FF7A66", width=4), run_time=1.5)
        self.play(traveler.animate.move_to(slots[3].get_center()), slots[3].animate.set_stroke("#FF7A66", width=4), run_time=1.5)
        self.play(slots[3].animate.set_fill("#FF7A66", opacity=0.34), traveler.animate.scale(1.35), run_time=0.9)
        self.wait(2.10)


class V01Definition(Scene):
    # Target: 11.20s (from scene06-definition.wav)
    def construct(self):
        bg = Rectangle(width=config.frame_width, height=config.frame_height, fill_color="#0B1F2A", fill_opacity=1, stroke_width=0)
        title = Text("A structure is a deliberate choice", font_size=39, color="#12B8A6").to_edge(UP)
        center = Circle(radius=0.95, fill_color="#173B4C", fill_opacity=1, stroke_color="#F7F3E8", stroke_width=3).shift(DOWN * 0.35)
        center_dot = Dot(color="#12B8A6", radius=0.18).move_to(center)
        layouts = VGroup(
            VGroup(*[Square(side_length=0.42, fill_color="#12B8A6", fill_opacity=0.9, stroke_width=0) for _ in range(4)]).arrange(RIGHT, buff=0.08).shift(LEFT * 4.3 + UP * 1.55),
            VGroup(*[Dot(color="#12B8A6", radius=0.18) for _ in range(4)]).arrange(DOWN, buff=0.32).shift(RIGHT * 4.2 + UP * 1.5),
            VGroup(*[RoundedRectangle(width=0.75, height=0.5, corner_radius=0.08, fill_color="#12B8A6", fill_opacity=0.9, stroke_width=0) for _ in range(3)]).arrange(RIGHT, buff=0.08).shift(LEFT * 4.15 + DOWN * 2.0),
            VGroup(*[Circle(radius=0.22, fill_color="#12B8A6", fill_opacity=0.9, stroke_width=0) for _ in range(4)]).arrange_in_grid(rows=2, cols=2, buff=0.16).shift(RIGHT * 4.15 + DOWN * 2.0),
        )
        rays = VGroup(*[Line(center.get_center(), layout.get_center(), color="#F7F3E8", stroke_width=2) for layout in layouts])
        winner = SurroundingRectangle(layouts[2], color="#FF7A66", buff=0.24)
        self.add(bg)
        self.play(Write(title), run_time=1.0)
        self.play(Create(center), GrowFromCenter(center_dot), run_time=1.1)
        self.play(LaggedStart(*[FadeIn(layout, scale=0.75) for layout in layouts], lag_ratio=0.12), run_time=1.5)
        self.play(LaggedStart(*[Create(ray) for ray in rays], lag_ratio=0.12), run_time=1.4)
        self.play(Create(winner), layouts[2].animate.set_color("#FF7A66"), run_time=1.3)
        self.play(rays.animate.set_color("#12B8A6"), center.animate.scale(1.14), run_time=1.1)
        self.play(center.animate.scale(1 / 1.14), FadeOut(winner), run_time=0.7)
        self.wait(3.1)


class V01Recap(Scene):
    # Target: 11.24s (from scene07-recap.wav)
    def construct(self):
        bg = Rectangle(width=config.frame_width, height=config.frame_height, fill_color="#0B1F2A", fill_opacity=1, stroke_width=0)
        title = Text("Ask the right question", font_size=42, color="#12B8A6").to_edge(UP)
        question = Circle(radius=0.85, fill_color="#173B4C", fill_opacity=1, stroke_color="#F7F3E8", stroke_width=3).shift(UP * 0.05)
        mark = Text("?", font_size=68, color="#FF7A66").move_to(question)
        choices = VGroup(*[
            RoundedRectangle(width=2.25, height=0.85, corner_radius=0.15, fill_color="#173B4C", fill_opacity=1, stroke_color="#12B8A6", stroke_width=2)
            for _ in range(4)
        ]).arrange_in_grid(rows=2, cols=2, buff=0.42).shift(DOWN * 2.15)
        pointer = Dot(color="#FF7A66", radius=0.13).next_to(choices[0], UP, buff=0.15)
        links = VGroup(*[DashedLine(question.get_bottom(), choice.get_top(), color="#F7F3E8", dash_length=0.12) for choice in choices])
        self.add(bg)
        self.play(Write(title), run_time=1.0)
        self.play(Create(question), Write(mark), run_time=1.2)
        self.play(LaggedStart(*[DrawBorderThenFill(choice) for choice in choices], lag_ratio=0.1), run_time=1.3)
        self.play(LaggedStart(*[Create(link) for link in links], lag_ratio=0.1), run_time=1.2)
        self.play(GrowFromCenter(pointer), choices[0].animate.set_fill("#12B8A6", opacity=0.45), run_time=0.8)
        self.play(pointer.animate.move_to(choices[1].get_top() + UP * 0.15), choices[1].animate.set_fill("#12B8A6", opacity=0.45), run_time=1.0)
        self.play(pointer.animate.move_to(choices[2].get_top() + UP * 0.15), choices[2].animate.set_fill("#12B8A6", opacity=0.45), run_time=1.0)
        self.play(pointer.animate.move_to(choices[3].get_top() + UP * 0.15), choices[3].animate.set_fill("#FF7A66", opacity=0.45), run_time=1.0)
        self.play(question.animate.set_stroke("#FF7A66", width=5), pointer.animate.scale(1.4), run_time=0.7)
        self.wait(2.04)


class V01StudentExample(Scene):
    # Target: 13.56s (from scene08-check.wav)
    def construct(self):
        bg = Rectangle(width=config.frame_width, height=config.frame_height, fill_color="#0B1F2A", fill_opacity=1, stroke_width=0)
        title = Text("A list of students", font_size=42, color="#12B8A6").to_edge(UP)
        students = VGroup(*[
            RoundedRectangle(width=1.35, height=0.75, corner_radius=0.14, fill_color="#12B8A6", fill_opacity=0.9, stroke_color=WHITE, stroke_width=1)
            for _ in range(5)
        ]).arrange(RIGHT, buff=0.22).shift(DOWN * 0.25)
        indices = VGroup(*[Dot(color="#F7F3E8", radius=0.07).next_to(student, DOWN, buff=0.18) for student in students])
        searcher = Arrow(UP * 0.78, DOWN * 0.04, color="#FF7A66", buff=0.08).next_to(students[2], UP, buff=0.22)
        new_student = RoundedRectangle(width=1.35, height=0.75, corner_radius=0.14, fill_color="#FF7A66", fill_opacity=0.95, stroke_color=WHITE, stroke_width=1).shift(LEFT * 4.7 + DOWN * 2.25)
        add_arrow = CurvedArrow(new_student.get_top(), students[4].get_bottom() + RIGHT * 0.55, angle=-PI / 3, color="#FF7A66")
        self.add(bg)
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[GrowFromCenter(student) for student in students], lag_ratio=0.11), run_time=1.4)
        self.play(LaggedStart(*[FadeIn(index, shift=UP * 0.1) for index in indices], lag_ratio=0.08), run_time=1.0)
        self.play(GrowArrow(searcher), Circumscribe(students[2], color="#FF7A66"), run_time=1.2)
        self.play(students[2].animate.set_fill("#FF7A66", opacity=1).scale(1.1), run_time=1.0)
        self.play(DrawBorderThenFill(new_student), run_time=1.0)
        self.play(Create(add_arrow), run_time=1.0)
        self.play(new_student.animate.move_to(students[4].get_center() + RIGHT * 1.55), students[4].animate.shift(LEFT * 0.2), run_time=2.0)
        self.play(FadeOut(add_arrow), new_student.animate.set_fill("#12B8A6", opacity=0.95), run_time=0.8)
        self.play(Circumscribe(VGroup(*students, new_student), color="#F7F3E8"), run_time=0.9)
        self.wait(2.26)
