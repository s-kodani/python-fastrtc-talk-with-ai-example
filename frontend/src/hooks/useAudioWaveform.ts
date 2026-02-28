import { useCallback, useEffect, useRef } from "react";

const FFT_SIZE = 256;
const SMOOTHING = 0.7;

export function useAudioWaveform(
  stream: MediaStream | null,
  barColor: string = "rgb(59, 130, 246)"
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const drawRef = useRef<() => void>(() => {});

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!canvas || !ctx || !analyser || !dataArray) return;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyser.frequencyBinCount;
    const barWidth = width / bufferLength;

    analyser.getByteFrequencyData(
      dataArray as Uint8Array<ArrayBuffer>
    );

    ctx.fillStyle = "rgb(248, 250, 252)";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.8;
      const x = i * barWidth;
      const y = height - barHeight;

      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }

    animationIdRef.current = requestAnimationFrame(drawRef.current);
  }, [barColor]);

  useEffect(() => {
    drawRef.current = draw;
    if (!stream) {
      if (sourceRef.current && audioContextRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {
          /* ignore */
        }
        sourceRef.current = null;
        analyserRef.current = null;
        dataArrayRef.current = null;
      }
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = SMOOTHING;
    analyserRef.current = analyser;

    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    draw();

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      try {
        source.disconnect();
      } catch {
        /* ignore */
      }
      sourceRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
      void audioContext.close();
      audioContextRef.current = null;
    };
  }, [stream, draw]);

  return canvasRef;
}
