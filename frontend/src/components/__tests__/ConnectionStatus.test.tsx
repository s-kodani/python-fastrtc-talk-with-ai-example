import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ConnectionStatus } from "../ConnectionStatus";

describe("ConnectionStatus", () => {
  // Given: state が "disconnected"
  // When:  コンポーネントをレンダーする
  // Then:  "未接続" が表示される
  it("shows 未接続 when disconnected", () => {
    render(<ConnectionStatus state="disconnected" />);
    expect(screen.getByText("未接続")).toBeInTheDocument();
  });

  // Given: state が "connecting"
  // When:  コンポーネントをレンダーする
  // Then:  "接続中" が表示される
  it("shows 接続中 when connecting", () => {
    render(<ConnectionStatus state="connecting" />);
    expect(screen.getByText("接続中")).toBeInTheDocument();
  });

  // Given: state が "connected"
  // When:  コンポーネントをレンダーする
  // Then:  "接続済" が表示される
  it("shows 接続済 when connected", () => {
    render(<ConnectionStatus state="connected" />);
    expect(screen.getByText("接続済")).toBeInTheDocument();
  });
});
