import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import fixture from "@/tests/fixtures/comprehensive-care-plan.json";
import { TeachBack } from "@/components/teach-back/teach-back";
import { CarePlanSchema } from "@/lib/schema/care-plan";

describe("teach-back behavior", () => {
  it("shows a calm source-linked correction and allows retry", () => {
    const plan = CarePlanSchema.parse(fixture);
    render(<TeachBack questions={plan.teachBackQuestions.slice(0, 3)} onOpenSource={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Exactly 1 lb in any week/ }));
    expect(screen.getByTestId("quiz-correction")).toHaveTextContent("Let’s check that against the source");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.queryByTestId("quiz-correction")).not.toBeInTheDocument();
  });

  it("scores correct answers locally", () => {
    const plan = CarePlanSchema.parse(fixture);
    render(<TeachBack questions={[plan.teachBackQuestions[0]!]} onOpenSource={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /More than 2 lb/ }));
    fireEvent.click(screen.getByRole("button", { name: "Finish check" }));
    expect(screen.getByTestId("quiz-complete")).toBeInTheDocument();
  });
});
