import { useCallback, useRef, useState } from "react";

import { serverUrl } from "../config";

export type ConnectionState = "disconnected" | "connecting" | "connected";

const ICE_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
} satisfies RTCConfiguration;

interface UseWebRTCOptions {
  onError?: (error: Error) => void;
}

function sendIceCandidate(webrtcId: string | null, candidate: RTCIceCandidate) {
  if (!webrtcId) return;
  fetch(serverUrl("/webrtc/offer"), {
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
  const [webrtcId, setWebrtcId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
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
        setLocalStream(stream);

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
              setRemoteStream(targetStream);
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
          } else if (
            state === "failed" ||
            state === "disconnected" ||
            state === "closed"
          ) {
            setConnectionState("disconnected");
          }
        };

        // Session lifetime: ICE Restart でネットワーク変化に対応
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "failed") {
            pc.restartIce();
          }
        };

        const id = Math.random().toString(36).slice(2);
        webrtcIdRef.current = id;
        setWebrtcId(id);
        const webrtcId = id;

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

        const response = await fetch(serverUrl("/webrtc/offer"), {
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
        setWebrtcId(null);
        setLocalStream(null);
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
    setWebrtcId(null);
    makingOfferRef.current = false;
    setConnectionState("disconnected");
    setLocalStream(null);
    setRemoteStream(null);

    // 再接続時に ontrack の applyStream が正しく動作するよう srcObject をクリア
    const audio = document.querySelector("audio");
    if (audio) {
      audio.srcObject = null;
    }
  }, []);

  return {
    connectionState,
    webrtcId,
    localStream,
    remoteStream,
    connect,
    disconnect,
  };
}
