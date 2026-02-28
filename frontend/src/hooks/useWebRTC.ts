import { useCallback, useRef, useState } from "react";

export type ConnectionState = "disconnected" | "connecting" | "connected";
export type MicrophoneStatus = "idle" | "talking" | "listening";

const WEBRTC_OFFER_URL = "/webrtc/offer";

const ICE_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
} satisfies RTCConfiguration;

interface UseWebRTCOptions {
  onError?: (error: Error) => void;
}

function sendIceCandidate(webrtcId: string | null, candidate: RTCIceCandidate) {
  if (!webrtcId) return;
  fetch(WEBRTC_OFFER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidate: candidate.toJSON(),
      webrtc_id: webrtcId,
      type: "ice-candidate",
    }),
  }).catch((err) => console.warn("Failed to send ICE candidate:", err));
}

export function useWebRTC(options: UseWebRTCOptions = {}) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [microphoneStatus, setMicrophoneStatus] =
    useState<MicrophoneStatus>("idle");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const webrtcIdRef = useRef<string | null>(null);
  const makingOfferRef = useRef(false);

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

        const pc = new RTCPeerConnection(ICE_CONFIG);
        pcRef.current = pc;

        // Perfect Negotiation: track.onunmute で確実にストリームを設定
        pc.ontrack = ({ track, streams }) => {
          const audio = document.querySelector("audio");
          if (!audio) return;

          const applyStream = () => {
            if (audio.srcObject) return;
            const targetStream = streams[0];
            if (targetStream) {
              audio.srcObject = targetStream;
              if (speakerDeviceId && "setSinkId" in audio) {
                (audio as HTMLAudioElement)
                  .setSinkId(speakerDeviceId)
                  .catch(() => {});
              }
            }
          };

          track.onunmute = applyStream;
          if (track.readyState === "live") applyStream();
        };

        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          if (state === "connected") {
            setConnectionState("connected");
            setMicrophoneStatus("idle");
          } else if (
            state === "failed" ||
            state === "disconnected" ||
            state === "closed"
          ) {
            setConnectionState("disconnected");
            setMicrophoneStatus("idle");
          }
        };

        // Session lifetime: ICE Restart でネットワーク変化に対応
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "failed") {
            pc.restartIce();
          }
        };

        webrtcIdRef.current = Math.random().toString(36).slice(2);
        const webrtcId = webrtcIdRef.current;

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendIceCandidate(webrtcId, event.candidate);
          }
        };

        pc.createDataChannel("text");
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Perfect Negotiation: makingOffer で競合を防止
        makingOfferRef.current = true;
        try {
          await pc.setLocalDescription();
        } finally {
          makingOfferRef.current = false;
        }

        const localDesc = pc.localDescription;
        if (!localDesc) throw new Error("Failed to create offer");

        const response = await fetch(WEBRTC_OFFER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sdp: localDesc.sdp,
            type: localDesc.type,
            webrtc_id: webrtcId,
          }),
        });

        const data = await response.json();
        if (data.status === "failed") {
          throw new Error(data.meta?.error || "Connection failed");
        }

        const remoteDesc = new RTCSessionDescription({
          type: data.type || "answer",
          sdp: data.sdp ?? data.answer,
        });
        await pc.setRemoteDescription(remoteDesc);
      } catch (err) {
        setConnectionState("disconnected");
        options.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [options]
  );

  const disconnect = useCallback(() => {
    const pc = pcRef.current;
    if (pc) {
      // Perfect Negotiation: transceiver と sender を適切に停止
      if (pc.getTransceivers) {
        pc.getTransceivers().forEach((t) => t.stop?.());
      }
      pc.getSenders().forEach((sender) => {
        if (sender.track?.stop) sender.track.stop();
      });
      pc.close();
    }
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    webrtcIdRef.current = null;
    makingOfferRef.current = false;
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
