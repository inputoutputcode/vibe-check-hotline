"use client";

import { FEEDBACK_CATEGORIES, FeedbackResponse } from "@/lib/types";

interface FeedbackCardProps {
  feedback: FeedbackResponse;
}

function ScoreBar({ score }: { score: number }) {
  const percentage = (score / 5) * 100;
  
  const getColor = (score: number) => {
    if (score >= 4) return "bg-green-500";
    if (score >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-semibold w-8 text-right">{score}/5</span>
    </div>
  );
}

export default function FeedbackCard({ feedback }: FeedbackCardProps) {
  const category = FEEDBACK_CATEGORIES.find(
    (c) => c.value === feedback.category
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900">
            {category?.label || feedback.category}
          </h4>
        </div>
        
        <ScoreBar score={feedback.score} />
        
        {feedback.suggestion && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Tip: </span>
              {feedback.suggestion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Component to display all feedback for a call
interface FeedbackListProps {
  feedbackItems: FeedbackResponse[];
}

export function FeedbackList({ feedbackItems }: FeedbackListProps) {
  if (feedbackItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No feedback available yet.</p>
      </div>
    );
  }

  const averageScore =
    feedbackItems.reduce((sum, f) => sum + f.score, 0) / feedbackItems.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Overall Score
            </h3>
            <p className="text-sm text-gray-600">
              Based on {feedbackItems.length} categories
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-600">
              {averageScore.toFixed(1)}
            </span>
            <span className="text-lg text-gray-400">/5</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {feedbackItems.map((feedback) => (
          <FeedbackCard key={feedback.id} feedback={feedback} />
        ))}
      </div>
    </div>
  );
}
