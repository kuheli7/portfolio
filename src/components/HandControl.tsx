"use client";

import { useEffect, useRef, useState } from "react";
import type { HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";

// Optional camera mode for the star sky: follows one hand with MediaPipe's hand tracker. Nothing loads until the
// visitor presses the button, and the camera stops as soon as they press stop or leave the page.

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm";
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
// Pinch is thumb tip to pointer tip, measured against the size of the palm so it works near or far from the camera.
// Two thresholds so a half-pinch doesn't flicker on and off.
const PINCH_ON = 0.33;
const PINCH_OFF = 0.45;
// Only the middle of the camera view maps onto the sky, so the edges are easy to reach
const MARGIN = 0.12;
// The tracker loses the hand for a frame now and then. Wait this many frames before treating it as gone,
// so a blip doesn't drop a star you're carrying.
const MISSES = 8;

export type HandPoint = { x: number; y: number; pinched: boolean };
type Props = { onHand: (point: HandPoint | null, pinch: "start" | "end" | null) => void };
type Status = "off" | "loading" | "on" | "error";

const distance = (a: NormalizedLandmark, b: NormalizedLandmark) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (n: number) => Math.min(1, Math.max(0, n));

function problem(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError")
    return "The camera is blocked, so hand mode can’t start. You can allow it in the browser’s site settings, or keep using the mouse or keyboard.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "I couldn’t find a camera. The mouse, touch and keyboard all still work.";
  if (name === "NotReadableError") return "The camera seems to be busy in another app.";
  return "Hand tracking couldn’t load. It needs an internet connection to fetch the model.";
}

export function HandControl({ onHand }: Props) {
  const [status, setStatus] = useState<Status>("off");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const handler = useRef(onHand);
  const on = status === "loading" || status === "on";

  useEffect(() => {
    handler.current = onHand;
  });

  useEffect(() => {
    if (!on) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    let tracker: HandLandmarker | null = null;
    let frame = 0;
    let pinched = false;
    let lastTime = -1;
    let missed = MISSES;
    let smooth: { x: number; y: number } | null = null;

    function stop() {
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
      tracker?.close();
      stream = null;
      tracker = null;
    }

    function tick() {
      const video = videoRef.current;
      if (!video || !tracker || cancelled) return;
      if (video.readyState >= 2 && video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        const hand = tracker.detectForVideo(video, performance.now()).landmarks[0];
        if (!hand) {
          if (++missed === MISSES) {
            handler.current(null, pinched ? "end" : null);
            pinched = false;
            smooth = null;
          }
        } else {
          missed = 0;
          const ratio = distance(hand[4], hand[8]) / Math.max(distance(hand[0], hand[9]), 0.001);
          let change: "start" | "end" | null = null;
          if (!pinched && ratio < PINCH_ON) {
            pinched = true;
            change = "start";
          } else if (pinched && ratio > PINCH_OFF) {
            pinched = false;
            change = "end";
          }
          // The pointer sits between the thumb and pointer finger tips, so it stays put while you pinch instead of
          // following the finger down. The camera image is mirrored, so moving your hand right moves it right.
          const mx = (hand[4].x + hand[8].x) / 2;
          const my = (hand[4].y + hand[8].y) / 2;
          const x = clamp((1 - mx - MARGIN) / (1 - 2 * MARGIN));
          const y = clamp((my - MARGIN) / (1 - 2 * MARGIN));
          smooth = smooth ? { x: smooth.x + (x - smooth.x) * 0.5, y: smooth.y + (y - smooth.y) * 0.5 } : { x, y };
          handler.current({ ...smooth, pinched }, change);
        }
      }
      frame = requestAnimationFrame(tick);
    }

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera support");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });
        const video = videoRef.current;
        if (cancelled || !video) return stop();
        video.srcObject = stream;
        await video.play();
        if (cancelled) return stop();
        const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
        const files = await FilesetResolver.forVisionTasks(WASM);
        const options = (delegate: "GPU" | "CPU") => ({
          baseOptions: { modelAssetPath: MODEL, delegate },
          runningMode: "VIDEO" as const,
          numHands: 1,
        });
        const made = await HandLandmarker.createFromOptions(files, options("GPU")).catch(() =>
          HandLandmarker.createFromOptions(files, options("CPU")),
        );
        tracker = made;
        if (cancelled) return stop();
        setStatus("on");
        frame = requestAnimationFrame(tick);
      } catch (err) {
        stop();
        if (cancelled) return;
        setError(problem(err));
        setStatus("error");
      }
    }

    void start();
    return () => {
      cancelled = true;
      stop();
      // Leaving the page turns hand mode off, so coming back never switches the camera on by itself
      setStatus((s) => (s === "error" ? s : "off"));
      handler.current(null, pinched ? "end" : null);
    };
  }, [on]);

  return (
    <div className="mt-5 rounded-2xl border border-line bg-surface-2/50 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => {
            setError("");
            setStatus(on ? "off" : "loading");
          }}
          className="rounded-full bg-accent-bg px-4 py-1.5 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
        >
          {on ? "Stop the camera" : "Play with your hand"}
        </button>
        <video
          ref={videoRef}
          muted
          playsInline
          aria-hidden="true"
          className={`h-20 w-28 -scale-x-100 rounded-xl bg-black object-cover ${status === "on" ? "" : "hidden"}`}
        />
        <p aria-live="polite" className="min-w-0 flex-1 text-sm leading-relaxed">
          {status === "off" && (
            <span className="text-muted">Video stays on your device. Turning it on downloads Google’s hand model.</span>
          )}
          {status === "loading" && "Starting the camera…"}
          {status === "on" && "Pinch on a star, then pinch on the next one."}
          {status === "error" && error}
        </p>
      </div>
    </div>
  );
}
