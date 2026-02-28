import { useRef, useState } from "react";
import { AudioDeviceSelector, useAudioDevices } from "./components/AudioDeviceSelector";
import { AudioOutput } from "./components/AudioOutput";
import { ConnectButton } from "./components/ConnectButton";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { DisconnectButton } from "./components/DisconnectButton";
import { Header } from "./components/Header";
import { MicrophoneStatus } from "./components/MicrophoneStatus";
import { useWebRTC } from "./hooks/useWebRTC";

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedMicId, setSelectedMicId] = useState("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { microphones, speakers, loading } = useAudioDevices();
  const {
    connectionState,
    microphoneStatus,
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

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6">
      <Header />
      <main className="flex flex-1 flex-col gap-4">
        <AudioDeviceSelector
          microphones={microphones}
          speakers={speakers}
          selectedMicId={displayMicId}
          selectedSpeakerId={displaySpeakerId}
          onMicChange={setSelectedMicId}
          onSpeakerChange={(id) => {
            setSelectedSpeakerId(id);
            const audio = audioRef.current;
            if (audio && id && "setSinkId" in audio) {
              (audio as HTMLAudioElement).setSinkId(id).catch(() => {});
            }
          }}
          disabled={connectionState !== "disconnected"}
        />

        <ConnectionStatus state={connectionState} />

        {connectionState === "disconnected" && (
          <ConnectButton
            onClick={handleConnect}
            disabled={loading}
          />
        )}

        {connectionState === "connected" && (
          <MicrophoneStatus status={microphoneStatus} />
        )}

        {(connectionState === "connecting" || connectionState === "connected") && (
          <DisconnectButton onClick={handleDisconnect} />
        )}

        {error && (
          <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <AudioOutput ref={audioRef} />
      </main>
    </div>
  );
}

export default App;
