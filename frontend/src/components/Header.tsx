type ConnectionState = "disconnected" | "connecting" | "connected";

interface HeaderProps {
  connectionState?: ConnectionState;
  onSettingsClick?: () => void;
}

const LAMP_STYLES: Record<
  ConnectionState,
  { bg: string; ring: string; animate?: string }
> = {
  disconnected: {
    bg: "bg-slate-400",
    ring: "ring-slate-300/50",
  },
  connecting: {
    bg: "bg-sky-400",
    ring: "ring-sky-300/50",
    animate: "animate-pulse",
  },
  connected: {
    bg: "bg-blue-500",
    ring: "ring-blue-400/50",
  },
};

function SettingsIcon() {
  return (
    <svg
      className="size-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

export function Header({
  connectionState = "disconnected",
  onSettingsClick,
}: HeaderProps) {
  const { bg, ring, animate } = LAMP_STYLES[connectionState];

  return (
    <header className="relative flex items-center justify-center py-6">
      <h1 className="text-2xl font-semibold text-slate-800">
        AI Voice Chat
      </h1>
      <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1">
        <span
          className={`inline-block size-3 rounded-full ring-4 ${bg} ${ring} ${animate ?? ""}`}
          title={
            connectionState === "disconnected"
              ? "未接続"
              : connectionState === "connecting"
                ? "接続中"
                : "接続済"
          }
          aria-hidden="true"
        />
        {onSettingsClick && (
          <button
            type="button"
            onClick={onSettingsClick}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-200/50 hover:text-slate-800"
            aria-label="設定"
          >
            <SettingsIcon />
          </button>
        )}
      </div>
    </header>
  );
}
