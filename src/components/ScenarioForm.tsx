"use client";

import { useState, useRef } from "react";
import PhoneInput, { validatePhoneNumber } from "./PhoneInput";
import VoiceRecorder from "./VoiceRecorder";
import {
  INDUSTRIES,
  TASK_TYPES,
  DIFFICULTIES,
  ScenarioFormData,
  Industry,
  TaskType,
  Difficulty,
  VoiceRecording,
} from "@/lib/types";

interface ScenarioFormProps {
  onSubmit: (data: ScenarioFormData) => void;
  isLoading?: boolean;
}

export default function ScenarioForm({
  onSubmit,
  isLoading = false,
}: ScenarioFormProps) {
  const [industry, setIndustry] = useState<Industry>("healthcare");
  const [taskType, setTaskType] = useState<TaskType>("booking");
  const [difficulty, setDifficulty] = useState<Difficulty>("neutral");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording | undefined>();
  const recordingStartTimeRef = useRef<number>(0);

  const handleRecordingComplete = (blob: Blob, url: string) => {
    const duration = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);
    setVoiceRecording({ blob, url, duration });
  };

  const handleRecordingClear = () => {
    setVoiceRecording(undefined);
  };

  const handleRecordingStart = () => {
    recordingStartTimeRef.current = Date.now();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const error = validatePhoneNumber(phoneNumber);
    if (error) {
      setPhoneError(error);
      return;
    }

    setPhoneError(undefined);
    onSubmit({ industry, taskType, difficulty, phoneNumber, voiceRecording });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Industry Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Industry
        </label>
        <div className="grid grid-cols-2 gap-3">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.value}
              type="button"
              onClick={() => setIndustry(ind.value)}
              disabled={isLoading}
              className={`
                px-4 py-3 rounded-lg border-2 text-left transition-all
                ${
                  industry === ind.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }
                ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <span className="font-medium">{ind.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Scenario Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {TASK_TYPES.map((task) => (
            <button
              key={task.value}
              type="button"
              onClick={() => setTaskType(task.value)}
              disabled={isLoading}
              className={`
                px-4 py-3 rounded-lg border-2 text-left transition-all
                ${
                  taskType === task.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }
                ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <span className="font-medium">{task.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Customer Difficulty
        </label>
        <div className="space-y-2">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.value}
              type="button"
              onClick={() => setDifficulty(diff.value)}
              disabled={isLoading}
              className={`
                w-full px-4 py-3 rounded-lg border-2 text-left transition-all
                ${
                  difficulty === diff.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }
                ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`font-medium ${
                    difficulty === diff.value ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {diff.label}
                </span>
                <span className="text-sm text-gray-500">{diff.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Phone Input */}
      <PhoneInput
        value={phoneNumber}
        onChange={setPhoneNumber}
        error={phoneError}
        disabled={isLoading}
      />

      {/* Voice Recorder */}
      <div className="pt-2 border-t border-gray-100">
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          onRecordingClear={handleRecordingClear}
          onRecordingStart={handleRecordingStart}
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold text-white
          transition-all duration-200
          ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Starting Call...
          </span>
        ) : (
          "Start Vibe Check Call"
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        By clicking start, you consent to receiving a test call at the number provided.
        The call will be recorded for analysis.
      </p>
    </form>
  );
}
