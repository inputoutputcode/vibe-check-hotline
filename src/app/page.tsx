"use client";

import { useState } from "react";
import ScenarioForm from "@/components/ScenarioForm";
import CallStatus from "@/components/CallStatus";
import { FeedbackList } from "@/components/FeedbackCard";
import {
  ScenarioFormData,
  CallStatus as CallStatusType,
  CallWithFeedback,
} from "@/lib/types";

type AppState = "form" | "calling" | "results";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatusType>("pending");
  const [callData, setCallData] = useState<CallWithFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadVoiceRecording = async (
    voiceRecording: ScenarioFormData["voiceRecording"],
    scenarioId: string
  ): Promise<string | null> => {
    if (!voiceRecording?.blob) return null;

    const formData = new FormData();
    formData.append("audio", voiceRecording.blob);
    formData.append("scenarioId", scenarioId);

    try {
      const response = await fetch("/api/voice/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Failed to upload voice recording");
        return null;
      }

      const result = await response.json();
      return result.filepath;
    } catch (error) {
      console.error("Error uploading voice recording:", error);
      return null;
    }
  };

  const handleSubmit = async (data: ScenarioFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare request body (without the blob, which can't be serialized to JSON)
      const requestBody = {
        industry: data.industry,
        taskType: data.taskType,
        difficulty: data.difficulty,
        phoneNumber: data.phoneNumber,
        hasVoiceRecording: !!data.voiceRecording,
      };

      const response = await fetch("/api/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start call");
      }

      const result = await response.json();

      // Upload voice recording if present
      if (data.voiceRecording) {
        const voicePath = await uploadVoiceRecording(
          data.voiceRecording,
          result.id
        );
        if (voicePath) {
          // Update call with voice recording path
          await fetch(`/api/calls/${result.id}/voice`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ voicePath }),
          });
        }
      }

      setCallData(result);
      setCallStatus("pending");
      setAppState("calling");

      // Start polling for call status
      pollCallStatus(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const pollCallStatus = async (callId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/calls/${callId}`);
        if (!response.ok) return;

        const data: CallWithFeedback = await response.json();
        setCallData(data);
        setCallStatus(data.status);

        if (data.status === "completed" || data.status === "failed") {
          setAppState("results");
          return;
        }

        // Continue polling
        setTimeout(poll, 2000);
      } catch {
        // Silently continue polling on error
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  const handleReset = () => {
    setAppState("form");
    setCallData(null);
    setCallStatus("pending");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Vibe Check Hotline
          </h1>
          <p className="text-lg text-gray-600">
            Practice your phone skills with AI-powered customer simulations
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 underline mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {appState === "form" && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Configure Your Test Call
              </h2>
              <ScenarioForm onSubmit={handleSubmit} isLoading={isLoading} />
            </>
          )}

          {appState === "calling" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Vibe Check is in Progress
              </h2>
              <CallStatus status={callStatus} duration={callData?.duration} />
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Cancel and start over
                </button>
              </div>
            </div>
          )}

          {appState === "results" && callData && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Your Results
                </h2>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Try Another Call
                </button>
              </div>

              <CallStatus status={callStatus} duration={callData.duration} />

              {callData.transcript && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Call Transcript
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                      {callData.transcript}
                    </pre>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Performance Feedback
                </h3>
                <FeedbackList feedbackItems={callData.feedback || []} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Powered by AI voice technology. Calls are recorded for analysis.
        </p>
      </div>
    </div>
  );
}
