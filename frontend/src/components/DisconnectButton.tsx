interface DisconnectButtonProps {
  onClick: () => void;
}

export function DisconnectButton({ onClick }: DisconnectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded border border-red-300 bg-red-50 px-4 py-3 font-medium text-red-800 hover:bg-red-100"
    >
      切断
    </button>
  );
}
