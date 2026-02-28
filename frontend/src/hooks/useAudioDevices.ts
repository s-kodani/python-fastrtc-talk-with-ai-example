import { useEffect, useState } from "react";

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export function useAudioDevices() {
  const [microphones, setMicrophones] = useState<MediaDevice[]>([]);
  const [speakers, setSpeakers] = useState<MediaDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices
          .filter((d) => d.kind === "audioinput")
          .map((d) => ({ deviceId: d.deviceId, label: d.label, kind: d.kind }));
        const spks = devices
          .filter((d) => d.kind === "audiooutput")
          .map((d) => ({ deviceId: d.deviceId, label: d.label, kind: d.kind }));
        setMicrophones(mics.length ? mics : [{ deviceId: "", label: "Default", kind: "audioinput" }]);
        setSpeakers(spks.length ? spks : [{ deviceId: "", label: "Default", kind: "audiooutput" }]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { microphones, speakers, loading };
}
