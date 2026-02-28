import { forwardRef } from "react";

export const AudioOutput = forwardRef<HTMLAudioElement, { sinkId?: string }>(
  function AudioOutput({ sinkId }, ref) {
    return (
      <audio
        ref={ref}
        autoPlay
        playsInline
        className="hidden"
        {...(sinkId && { "data-sink-id": sinkId })}
      />
    );
  }
);
