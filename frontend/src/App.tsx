import { useRef, useState } from "react";
import { AudioDeviceSelector } from "./components/AudioDeviceSelector";
import { AudioOutput } from "./components/AudioOutput";
import { AudioWaveform } from "./components/AudioWaveform";
import { ChatUI } from "./components/ChatUI";
import { ConnectButton } from "./components/ConnectButton";
import { DisconnectButton } from "./components/DisconnectButton";
import { Header } from "./components/Header";
import { Modal } from "./components/Modal";
import { useAudioDevices } from "./hooks/useAudioDevices";
import { useOutputStream } from "./hooks/useOutputStream";
import { useWebRTC } from "./hooks/useWebRTC";

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedMicId, setSelectedMicId] = useState("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { microphones, speakers, loading } = useAudioDevices();
  const {
    connectionState,
    webrtcId,
    localStream,
    remoteStream,
    connect,
    disconnect,
  } = useWebRTC({
    onError: (err) => setError(err.message),
  });

  const displayMicId = selectedMicId || microphones[0]?.deviceId || "";
  const displaySpeakerId = selectedSpeakerId || speakers[0]?.deviceId || "";

  const handleConnect = () => {
    setError(null);
    connect(displayMicId, displaySpeakerId);
  };

  const handleDisconnect = () => {
    disconnect();
    setError(null);
  };

  const { messages } = useOutputStream(webrtcId);

  const handleSpeakerChange = (id: string) => {
    setSelectedSpeakerId(id);
    const audio = audioRef.current;
    if (audio && id && "setSinkId" in audio) {
      (audio as HTMLAudioElement).setSinkId(id).catch(() => {});
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <Header
        connectionState={connectionState}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <main className="flex flex-1 flex-col gap-4">
        <Modal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          title="音声デバイス設定"
        >
          <AudioDeviceSelector
            microphones={microphones}
            speakers={speakers}
            selectedMicId={displayMicId}
            selectedSpeakerId={displaySpeakerId}
            onMicChange={setSelectedMicId}
            onSpeakerChange={handleSpeakerChange}
            disabled={connectionState !== "disconnected"}
          />
        </Modal>

        {connectionState === "disconnected" && (
          <ConnectButton
            onClick={handleConnect}
            disabled={loading}
          />
        )}

        {connectionState === "connected" && (
          <div className="flex flex-col gap-4">
            <ChatUI messages={messages} />
            <AudioWaveform
              stream={localStream}
              label="マイク入力"
              variant="input"
            />
            <AudioWaveform
              stream={remoteStream}
              label="スピーカー出力"
              variant="output"
            />
          </div>
        )}

        {(connectionState === "connecting" || connectionState === "connected") && (
          <DisconnectButton onClick={handleDisconnect} />
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <AudioOutput ref={audioRef} />
      </main>
    </div>
  );
}

export default App;
