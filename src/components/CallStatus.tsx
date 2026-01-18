"use client";

import { CallStatus as CallStatusType } from "@/lib/types";

interface CallStatusProps {
  status: CallStatusType;
  duration?: number | null;
}

const STATUS_CONFIG: Record<
  CallStatusType,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  pending: {
    label: "Preparing call...",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    icon: "⏳",
  },
  in_progress: {
    label: "Call in progress",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: "📞",
  },
  completed: {
    label: "Call completed",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    icon: "✅",
  },
  failed: {
    label: "Call failed",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: "❌",
  },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function CallStatus({ status, duration }: CallStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`
        rounded-lg border p-4
        ${config.bgColor}
        transition-all duration-300
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label={config.label}>
          {config.icon}
        </span>
        <div className="flex-1">
          <p className={`font-medium ${config.color}`}>{config.label}</p>
          {status === "in_progress" && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm text-blue-600">
                Listen for your phone to ring
              </span>
            </div>
          )}
          {status === "completed" && duration && (
            <p className="text-sm text-gray-600 mt-1">
              Duration: {formatDuration(duration)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
