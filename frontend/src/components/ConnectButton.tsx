interface ConnectButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export function ConnectButton({ disabled, onClick }: ConnectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-sky-600"
    >
      接続開始
    </button>
  );
}
