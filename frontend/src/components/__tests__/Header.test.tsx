import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "../Header";

describe("Header", () => {
  // Given: コンポーネントをマウント
  // When:  レンダーする
  // Then:  "AI Voice Chat" が表示される
  it("renders app title", () => {
    render(<Header />);
    expect(screen.getByText("AI Voice Chat")).toBeInTheDocument();
  });
});
