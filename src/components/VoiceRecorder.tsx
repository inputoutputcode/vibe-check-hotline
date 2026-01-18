"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void;
  onRecordingClear: () => void;
  onRecordingStart?: () => void;
  disabled?: boolean;
}

type RecordingState = "idle" | "recording" | "paused" | "recorded";

export default function VoiceRecorder({
  onRecordingComplete,
  onRecordingClear,
  onRecordingStart,
  disabled = false,
}: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [analyserData, setAnalyserData] = useState<number[]>(new Array(32).fill(0));
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Visualizer animation
  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 32 bars from the frequency data
    const bars = 32;
    const step = Math.floor(dataArray.length / bars);
    const newData = [];
    for (let i = 0; i < bars; i++) {
      newData.push(dataArray[i * step] / 255);
    }
    setAnalyserData(newData);

    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, []);

  const startRecording = async () => {
    try {
      setPermissionDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob, url);
        cleanup();
      };

      mediaRecorder.start(100);
      setRecordingState("recording");
      setDuration(0);
      onRecordingStart?.();

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Start visualizer
      updateVisualizer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setPermissionDenied(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      setRecordingState("recorded");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAnalyserData(new Array(32).fill(0));
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingState("idle");
    setDuration(0);
    setPlaybackProgress(0);
    setIsPlaying(false);
    onRecordingClear();
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setPlaybackProgress(progress);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Voice Sample (Optional)
      </label>
      <p className="text-sm text-gray-500">
        Record a voice sample to personalize your vibe check experience
      </p>

      {permissionDenied && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            🎤 Microphone access denied. Please allow microphone access in your
            browser settings to record.
          </p>
        </div>
      )}

      {/* Recording visualization area */}
      <div
        className={`
          relative h-28 rounded-xl overflow-hidden transition-all duration-300
          ${recordingState === "recording" 
            ? "bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600" 
            : recordingState === "recorded"
            ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600"
            : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"
          }
        `}
      >
        {/* Waveform visualization */}
        <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-4">
          {analyserData.map((value, index) => (
            <div
              key={index}
              className={`
                w-1.5 rounded-full transition-all duration-75
                ${recordingState === "recording" 
                  ? "bg-white/90" 
                  : recordingState === "recorded"
                  ? "bg-white/70"
                  : "bg-white/30"
                }
              `}
              style={{
                height: `${Math.max(4, value * 80)}%`,
                transform: recordingState === "idle" 
                  ? `scaleY(${0.2 + Math.sin(index * 0.5) * 0.1})`
                  : "scaleY(1)",
              }}
            />
          ))}
        </div>

        {/* Playback progress overlay */}
        {recordingState === "recorded" && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-white/50 transition-all duration-100"
            style={{ width: `${playbackProgress}%` }}
          />
        )}

        {/* Duration display */}
        <div className="absolute bottom-2 right-3">
          <span className="text-sm font-mono text-white/90 bg-black/20 px-2 py-0.5 rounded">
            {formatTime(duration)}
          </span>
        </div>

        {/* Recording indicator */}
        {recordingState === "recording" && (
          <div className="absolute top-2 left-3 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-medium text-white/90">Recording</span>
          </div>
        )}

        {/* Recorded badge */}
        {recordingState === "recorded" && (
          <div className="absolute top-2 left-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-white/90">Recorded</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {recordingState === "idle" && (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full font-medium
              transition-all duration-200 
              ${disabled 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 hover:shadow-lg hover:shadow-rose-500/25 active:scale-95"
              }
            `}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start Recording
          </button>
        )}

        {recordingState === "recording" && (
          <button
            type="button"
            onClick={stopRecording}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-full font-medium
              bg-white text-rose-600 border-2 border-rose-500
              hover:bg-rose-50 transition-all duration-200 active:scale-95
            "
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Stop Recording
          </button>
        )}

        {recordingState === "recorded" && (
          <>
            <button
              type="button"
              onClick={togglePlayback}
              disabled={disabled}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full font-medium
                transition-all duration-200 
                ${disabled 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
                }
              `}
            >
              {isPlaying ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Play
                </>
              )}
            </button>

            <button
              type="button"
              onClick={clearRecording}
              disabled={disabled}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full font-medium
                transition-all duration-200 
                ${disabled 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                }
              `}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Clear
            </button>
          </>
        )}
      </div>

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
        />
      )}
    </div>
  );
}
