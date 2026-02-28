import type { MediaDevice } from "../hooks/useAudioDevices";

interface AudioDeviceSelectorProps {
  microphones: MediaDevice[];
  speakers: MediaDevice[];
  selectedMicId: string;
  selectedSpeakerId: string;
  onMicChange: (deviceId: string) => void;
  onSpeakerChange: (deviceId: string) => void;
  disabled?: boolean;
}

export function AudioDeviceSelector({
  microphones,
  speakers,
  selectedMicId,
  selectedSpeakerId,
  onMicChange,
  onSpeakerChange,
  disabled,
}: AudioDeviceSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          マイク選択
        </label>
        <select
          value={selectedMicId}
          onChange={(e) => onMicChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-slate-800 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50"
        >
          {microphones.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          スピーカー選択
        </label>
        <select
          value={selectedSpeakerId}
          onChange={(e) => onSpeakerChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-slate-800 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50"
        >
          {speakers.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Speaker ${d.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
