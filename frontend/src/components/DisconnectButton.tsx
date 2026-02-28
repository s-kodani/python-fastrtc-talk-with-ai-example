interface DisconnectButtonProps {
  onClick: () => void;
}

export function DisconnectButton({ onClick }: DisconnectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-red-300 bg-red-50/90 px-4 py-3 font-medium text-red-800 transition-colors hover:border-red-400 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
    >
      切断
    </button>
  );
}
