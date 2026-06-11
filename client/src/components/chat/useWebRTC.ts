"use client";

import { useRef, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";

export type CallState =
  | { status: "idle" }
  | {
      status: "outgoing";
      callId: string;
      callType: "audio" | "video";
      calleeName: string;
      calleeImage: string | null;
      localStream: MediaStream;
      pc: RTCPeerConnection;
    }
  | {
      status: "incoming";
      callId: string;
      callType: "audio" | "video";
      callerName: string;
      callerImage: string | null;
      offer: RTCSessionDescriptionInit;
    }
  | {
      status: "active";
      callId: string;
      callType: "audio" | "video";
      remoteName: string;
      remoteImage: string | null;
      localStream: MediaStream;
      remoteStream: MediaStream;
      pc: RTCPeerConnection;
    };

const ICE_SERVERS: RTCIceServer[] = [
  // Empty for local dev. For production add:
  // { urls: "stun:stun.l.google.com:19302" },
];

export function useWebRTC() {
  const [callState, setCallState] = useState<CallState>({ status: "idle" });
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  // Keep a ref to callState so socket callbacks always read the latest value
  const callStateRef = useRef<CallState>({ status: "idle" });

  const setCall = useCallback((s: CallState) => {
    callStateRef.current = s;
    setCallState(s);
  }, []);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    callStateRef.current = { status: "idle" };
    setCallState({ status: "idle" });
  }, []);

  const createPeerConnection = useCallback(
    (callId: string, remoteUserId: string): RTCPeerConnection => {
      // BUG FIX 1: pass STUN servers — without this, ICE negotiation fails on
      // localhost between two different browser tabs/windows because they
      // each need to discover their own candidates.
      const pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS.length
          ? ICE_SERVERS
          : [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // ICE candidate — send to remote peer via server
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          getSocket().emit("call_ice_candidate", {
            callId,
            candidate: candidate.toJSON(),
            toUserId: remoteUserId,
          });
        }
      };

      // BUG FIX 2: ontrack fires multiple times (once per track — audio then
      // video). We must NOT create a new MediaStream each time; instead we
      // accumulate tracks into one persistent remote stream.
      const remoteStream = new MediaStream();

      pc.ontrack = (event) => {
        // Add each incoming track to our persistent remote stream
        event.streams[0]?.getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });

        setCallState((prev) => {
          if (prev.status === "outgoing") {
            const next: CallState = {
              status: "active",
              callId: prev.callId,
              callType: prev.callType,
              remoteName: prev.calleeName,
              remoteImage: prev.calleeImage,
              localStream: prev.localStream,
              remoteStream,
              pc,
            };
            callStateRef.current = next;
            return next;
          }
          if (prev.status === "active") {
            // stream object is same ref, React won't re-render on its own —
            // return a new object to trigger re-render so the video element
            // picks up the new track
            const next: CallState = { ...prev, remoteStream };
            callStateRef.current = next;
            return next;
          }
          return prev;
        });
      };

      pc.onconnectionstatechange = () => {
        // BUG FIX 3: if peer connection drops/fails, clean up on both sides
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          const current = callStateRef.current;
          if (current.status === "active" || current.status === "outgoing") {
            getSocket().emit("call_end", { callId: current.callId });
          }
          cleanup();
        }
      };

      pcRef.current = pc;
      return pc;
    },
    [cleanup],
  );

  const startCall = useCallback(
    async (opts: {
      roomId: string;
      calleeId: string;
      calleeName: string;
      calleeImage: string | null;
      callType: "audio" | "video";
    }) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: opts.callType === "video",
        });
        localStreamRef.current = stream;

        const callId = `${opts.roomId}_${Date.now()}`;
        const pc = createPeerConnection(callId, opts.calleeId);

        // Add tracks BEFORE creating offer so they're included in SDP
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: opts.callType === "video",
        });
        await pc.setLocalDescription(offer);

        getSocket().emit("call_offer", {
          roomId: opts.roomId,
          calleeId: opts.calleeId,
          offer: pc.localDescription, // use localDescription not raw offer
          callType: opts.callType,
        });

        setCall({
          status: "outgoing",
          callId,
          callType: opts.callType,
          calleeName: opts.calleeName,
          calleeImage: opts.calleeImage,
          localStream: stream,
          pc,
        });
      } catch (err) {
        console.error("startCall error:", err);
        cleanup();
      }
    },
    [createPeerConnection, setCall, cleanup],
  );

  const acceptCall = useCallback(
    async (opts: {
      callId: string;
      callerId: string;
      callerName: string;
      callerImage: string | null;
      callType: "audio" | "video";
      offer: RTCSessionDescriptionInit;
    }) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: opts.callType === "video",
        });
        localStreamRef.current = stream;

        const pc = createPeerConnection(opts.callId, opts.callerId);

        // Add tracks BEFORE setRemoteDescription
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(opts.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        getSocket().emit("call_answer", {
          callId: opts.callId,
          answer: pc.localDescription, // use localDescription not raw answer
        });

        // Don't set active yet — wait for ontrack to fire with remote stream.
        // But we need a placeholder so the modal shows while waiting.
        setCall({
          status: "active",
          callId: opts.callId,
          callType: opts.callType,
          remoteName: opts.callerName,
          remoteImage: opts.callerImage,
          localStream: stream,
          remoteStream: new MediaStream(),
          pc,
        });
      } catch (err) {
        console.error("acceptCall error:", err);
        cleanup();
      }
    },
    [createPeerConnection, setCall, cleanup],
  );

  const declineCall = useCallback(
    (callId: string) => {
      getSocket().emit("call_decline", { callId });
      cleanup();
    },
    [cleanup],
  );

  // BUG FIX 3 (client side): hangUp reads from ref not stale closure state
  const hangUp = useCallback(() => {
    const current = callStateRef.current;
    if (current.status === "outgoing" || current.status === "active") {
      getSocket().emit("call_end", { callId: current.callId });
    }
    cleanup();
  }, [cleanup]);

  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      } catch (err) {
        console.error("handleAnswer error:", err);
      }
    },
    [],
  );

  const handleRemoteIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      if (!pcRef.current) return;
      try {
        // BUG FIX 4: only add candidate when remote description is set
        if (pcRef.current.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("ICE candidate error:", err);
      }
    },
    [],
  );

  return {
    callState,
    setCallState: setCall,
    startCall,
    acceptCall,
    declineCall,
    hangUp,
    handleAnswer,
    handleRemoteIceCandidate,
    cleanup,
  };
}
