import { useEffect, useRef } from "react";
import { useAudioWaveform } from "../hooks/useAudioWaveform";

interface AudioWaveformProps {
  stream: MediaStream | null;
  label: string;
  variant?: "input" | "output";
}

const BAR_COLORS = {
  input: "rgb(59, 130, 246)",
  output: "rgb(34, 197, 94)",
} as const;

export function AudioWaveform({
  stream,
  label,
  variant = "input",
}: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useAudioWaveform(stream, BAR_COLORS[variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth > 0 && clientHeight > 0) {
        canvas.width = clientWidth;
        canvas.height = clientHeight;
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [canvasRef, stream]);

  if (!stream) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div
        ref={containerRef}
        className="h-18 w-full overflow-hidden rounded border border-gray-200 bg-slate-50"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}
