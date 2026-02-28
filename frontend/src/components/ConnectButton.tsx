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
      className="w-full rounded border border-gray-400 bg-gray-100 px-4 py-3 font-medium text-gray-800 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      接続開始
    </button>
  );
}
