type ConnectionState = "disconnected" | "connecting" | "connected";

interface ConnectionStatusProps {
  state: ConnectionState;
}

const LABELS: Record<ConnectionState, string> = {
  disconnected: "未接続",
  connecting: "接続中",
  connected: "接続済",
};

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  return (
    <div className="rounded border border-gray-300 bg-gray-50 px-4 py-3 text-center">
      <span className="text-gray-700">{LABELS[state]}</span>
    </div>
  );
}
