"use client";
import { useRef, useState } from "react";

export default function VoiceRecorder({ onResult, buttonClassName }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const start = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => e.data?.size && chunksRef.current.push(e.data);

      mr.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          chunksRef.current = [];
          // stop tracks
          stream.getTracks().forEach(t => t.stop());

          const fd = new FormData();
          fd.append("file", blob, "recording.webm");

          const res = await fetch("/api/speech-to-text", { method: "POST", body: fd });
          const data = await res.json();
          if (data?.text && onResult) onResult(data.text);
          if (data?.error) setError(data.error);
        } catch (e) {
          setError(e.message || "Upload failed");
        } finally {
          setRecording(false);
        }
      };

      mr.start();
      setRecording(true);
    } catch (e) {
      setError(e.message || "Mic permission denied");
    }
  };

  const stop = () => {
    try { mediaRecorderRef.current?.stop(); } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={buttonClassName || "px-3 py-2 border rounded text-sm"}
        onClick={recording ? stop : start}
        title="Use voice input"
      >
        {recording ? "Stop 🎙️" : "Speak 🎤"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
