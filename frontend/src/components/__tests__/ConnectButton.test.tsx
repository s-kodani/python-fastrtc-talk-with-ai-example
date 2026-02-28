import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConnectButton } from "../ConnectButton";

describe("ConnectButton", () => {
  // Given: onClick ハンドラが渡されている
  // When:  ボタンをクリックする
  // Then:  onClick が呼ばれる
  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ConnectButton onClick={onClick} />);
    screen.getByRole("button", { name: "接続開始" }).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // Given: disabled が true
  // When:  ボタンがレンダーされる
  // Then:  ボタンが無効化されている
  it("is disabled when disabled prop is true", () => {
    render(<ConnectButton onClick={vi.fn()} disabled />);
    expect(screen.getByRole("button", { name: "接続開始" })).toBeDisabled();
  });
});
