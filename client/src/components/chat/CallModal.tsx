"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneMissed,
  Phone,
} from "lucide-react";

interface CallModalProps {
  outgoing?: {
    callId: string;
    callType: "audio" | "video";
    calleeName: string;
    calleeImage?: string | null;
    localStream: MediaStream;
    peerConnection: RTCPeerConnection;
    onCancel: () => void;
  };
  active?: {
    callId: string;
    callType: "audio" | "video";
    remoteName: string;
    remoteImage?: string | null;
    localStream: MediaStream;
    remoteStream: MediaStream;
    onHangUp: () => void;
  };
}

export function CallModal({ outgoing, active }: CallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  // FIX: dedicated audio element for remote audio stream
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const callType = active?.callType ?? outgoing?.callType ?? "audio";
  const remoteName = active?.remoteName ?? outgoing?.calleeName ?? "";
  const remoteImage = active?.remoteImage ?? outgoing?.calleeImage;
  const localStream = active?.localStream ?? outgoing?.localStream;

  // FIX: attach local stream — must set srcObject directly on the DOM node
  // because React's onClick batching can cause the ref to be stale
  useEffect(() => {
    if (!localStream) return;
    const el = localVideoRef.current;
    if (el && el.srcObject !== localStream) {
      el.srcObject = localStream;
      el.play().catch(() => {});
    }
  }, [localStream]);

  // FIX: attach remote stream to BOTH video and audio elements
  // Video element handles the video track; audio element handles audio track.
  // This fixes the "audio not transferring" bug — a <video> with muted or
  // with no video track will silently drop audio in some browsers.
  useEffect(() => {
    const remoteStream = active?.remoteStream;
    if (!remoteStream) return;

    // Audio element — always attach so audio plays even on audio-only calls
    const audioEl = remoteAudioRef.current;
    if (audioEl && audioEl.srcObject !== remoteStream) {
      audioEl.srcObject = remoteStream;
      audioEl.play().catch(() => {});
    }

    // Video element — only for video calls
    if (callType === "video") {
      const videoEl = remoteVideoRef.current;
      if (videoEl && videoEl.srcObject !== remoteStream) {
        videoEl.srcObject = remoteStream;
        videoEl.play().catch(() => {});
      }
    }
  }, [active?.remoteStream, callType]);

  // Elapsed timer
  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [active]);

  const toggleMute = useCallback(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((m) => !m);
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsVideoOff((v) => !v);
  }, [localStream]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Hidden audio element — always present, handles remote audio */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      <div className="relative w-full max-w-sm mx-4 rounded-3xl overflow-hidden bg-gray-900 shadow-2xl">
        {/* Remote video (video calls only, when active) */}
        {callType === "video" && active ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-[420px] object-cover bg-black"
          />
        ) : (
          /* Avatar / waiting screen for audio calls and outgoing state */
          <div className="w-full h-[420px] flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-gray-800 to-gray-900">
            {remoteImage ? (
              <img
                src={remoteImage}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center text-3xl font-bold text-white border-4 border-white/20">
                {remoteName[0]}
              </div>
            )}
            <p className="text-white font-bold text-xl">{remoteName}</p>
            {active ? (
              <p className="text-white/60 text-sm font-mono">
                {formatElapsed(elapsed)}
              </p>
            ) : (
              <p className="text-white/60 text-sm animate-pulse">
                {callType === "video"
                  ? "Calling (video)..."
                  : "Calling (audio)..."}
              </p>
            )}
          </div>
        )}

        {/* Local video PiP — video calls only */}
        {callType === "video" && localStream && (
          <div className="absolute top-4 right-4 w-28 h-20 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted // always mute local video to prevent echo
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-white/50" />
              </div>
            )}
          </div>
        )}

        {/* Active call timer for video */}
        {active && callType === "video" && (
          <div className="absolute top-4 left-4 bg-black/50 rounded-full px-3 py-1">
            <p className="text-white text-xs font-mono">
              {formatElapsed(elapsed)}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-5">
            {/* Mute */}
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted ? "bg-red-500/80" : "bg-white/20 hover:bg-white/30"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Hang up */}
            <button
              onClick={active?.onHangUp ?? outgoing?.onCancel}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors"
              title="End call"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>

            {/* Camera toggle — video calls only */}
            {callType === "video" ? (
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isVideoOff ? "bg-red-500/80" : "bg-white/20 hover:bg-white/30"
                }`}
                title={isVideoOff ? "Turn camera on" : "Turn camera off"}
              >
                {isVideoOff ? (
                  <VideoOff className="w-5 h-5 text-white" />
                ) : (
                  <Video className="w-5 h-5 text-white" />
                )}
              </button>
            ) : (
              <div className="w-12 h-12" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Incoming Call Banner ──────────────────────────────────────────────────────

interface IncomingCallBannerProps {
  callerName: string;
  callerImage?: string | null;
  callType: "audio" | "video";
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCallBanner({
  callerName,
  callerImage,
  callType,
  onAccept,
  onDecline,
}: IncomingCallBannerProps) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-[340px] bg-gray-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {callerImage ? (
          <img
            src={callerImage}
            alt=""
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center text-lg font-bold text-white shrink-0">
            {callerName[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{callerName}</p>
          <p className="text-white/60 text-xs animate-pulse">
            Incoming {callType === "video" ? "video" : "audio"} call...
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onDecline}
            className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
            title="Decline"
          >
            <PhoneMissed className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={onAccept}
            className="w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
            title="Accept"
          >
            {callType === "video" ? (
              <Video className="w-5 h-5 text-white" />
            ) : (
              <Phone className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
