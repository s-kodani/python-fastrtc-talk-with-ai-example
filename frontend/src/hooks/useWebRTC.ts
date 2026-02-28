import { useCallback, useRef, useState } from "react";

export type ConnectionState = "disconnected" | "connecting" | "connected";
export type MicrophoneStatus = "idle" | "talking" | "listening";

const WEBRTC_OFFER_URL = "/webrtc/offer";

interface UseWebRTCOptions {
  onError?: (error: Error) => void;
}

export function useWebRTC(options: UseWebRTCOptions = {}) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [microphoneStatus, setMicrophoneStatus] =
    useState<MicrophoneStatus>("idle");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const webrtcIdRef = useRef<string | null>(null);

  const connect = useCallback(
    async (micDeviceId: string, speakerDeviceId: string) => {
      setConnectionState("connecting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: micDeviceId
            ? { deviceId: { exact: micDeviceId } }
            : true,
        });
        streamRef.current = stream;

        const pc = new RTCPeerConnection(
          {
            iceServers: [
              {
                urls: ["stun:stun.l.google.com:19302"],
              },
            ],
          }
        );
        pcRef.current = pc;

        pc.ontrack = (event) => {
          const audio = document.querySelector("audio");
          if (audio && event.streams[0]) {
            console.log("Setting audio stream:", event.streams[0]);
            audio.srcObject = event.streams[0];
            if (speakerDeviceId && "setSinkId" in audio) {
              (audio as HTMLAudioElement)
                .setSinkId(speakerDeviceId)
                .catch(() => {});
            }
          } else {
            console.warn("Failed to set audio stream or speaker device ID");
          }
        };

        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          if (state === "connected") {
            console.log("WebRTC connected");
            setConnectionState("connected");
            setMicrophoneStatus("idle");
          } else if (state === "failed" || state === "disconnected" || state === "closed") {
            console.log("WebRTC connection state:", state);
            setConnectionState("disconnected");
            setMicrophoneStatus("idle");
          }
        };

        pc.onicecandidate = (event) => {
          console.log("ICE candidate:", event.candidate);
          if (event.candidate) {
            fetch(WEBRTC_OFFER_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                candidate: event.candidate.toJSON(),
                webrtc_id: webrtcIdRef.current,
                type: "ice-candidate",
                    }),
            });
          }
        };

        pc.createDataChannel("text");

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        webrtcIdRef.current = Math.random().toString(36).slice(2);

        const response = await fetch(WEBRTC_OFFER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sdp: offer.sdp,
            type: offer.type,
            webrtc_id: webrtcIdRef.current,
          }),
        });

        const data = await response.json();
        if (data.status === "failed") {
          throw new Error(data.meta?.error || "Connection failed");
        }

        await pc.setRemoteDescription(
          new RTCSessionDescription({
            type: data.type || "answer",
            sdp: data.sdp ?? data.answer,
          })
        );
      } catch (err) {
        setConnectionState("disconnected");
        options.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [options]
  );

  const disconnect = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setConnectionState("disconnected");
    setMicrophoneStatus("idle");
  }, []);

  return {
    connectionState,
    microphoneStatus,
    setMicrophoneStatus,
    connect,
    disconnect,
  };
}
