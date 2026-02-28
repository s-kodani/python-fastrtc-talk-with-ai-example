type MicrophoneStatusType = "idle" | "talking" | "listening";

interface MicrophoneStatusProps {
  status: MicrophoneStatusType;
}

const LABELS: Record<MicrophoneStatusType, string> = {
  idle: "待機中",
  talking: "話し中",
  listening: "聞き中",
};

export function MicrophoneStatus({ status }: MicrophoneStatusProps) {
  return (
    <div className="rounded border border-gray-300 bg-gray-50 px-4 py-3 text-center">
      <span className="text-gray-700">{LABELS[status]}</span>
    </div>
  );
}
