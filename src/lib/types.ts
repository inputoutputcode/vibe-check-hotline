// Industry types
export const INDUSTRIES = [
  { value: "healthcare", label: "Healthcare" },
  { value: "salon", label: "Salon / Personal Services" },
  { value: "automotive", label: "Automotive / Trades" },
  { value: "professional", label: "Professional Services" },
] as const;

export type Industry = (typeof INDUSTRIES)[number]["value"];

// Task types
export const TASK_TYPES = [
  { value: "booking", label: "Appointment Booking" },
  { value: "inquiry", label: "General Inquiry" },
  { value: "complaint", label: "Complaint" },
  { value: "pricing", label: "Pricing Question" },
] as const;

export type TaskType = (typeof TASK_TYPES)[number]["value"];

// Difficulty levels
export const DIFFICULTIES = [
  { value: "easy", label: "Easy", description: "Friendly, patient customer" },
  { value: "neutral", label: "Neutral", description: "Standard customer interaction" },
  { value: "stressed", label: "Stressed", description: "Frustrated or rushed customer" },
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number]["value"];

// Call status
export const CALL_STATUSES = ["pending", "in_progress", "completed", "failed"] as const;
export type CallStatus = (typeof CALL_STATUSES)[number];

// Call outcomes
export const CALL_OUTCOMES = [
  "appointment_suggested",
  "info_provided",
  "no_resolution",
  "on_hold",
  "rushed",
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

// Feedback categories
export const FEEDBACK_CATEGORIES = [
  { value: "greeting", label: "Greeting Quality" },
  { value: "clarity", label: "Clarity of Speech" },
  { value: "warmth", label: "Warmth & Empathy" },
  { value: "question_handling", label: "Question Handling" },
  { value: "next_steps", label: "Next-Step Clarity" },
  { value: "closing", label: "Closing Behavior" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["value"];

// Voice recording data
export interface VoiceRecording {
  blob: Blob;
  url: string;
  duration: number;
}

// Form data for scenario configuration
export interface ScenarioFormData {
  industry: Industry;
  taskType: TaskType;
  difficulty: Difficulty;
  phoneNumber: string;
  voiceRecording?: VoiceRecording;
}

// API response types
export interface ScenarioResponse {
  id: string;
  industry: string;
  taskType: string;
  difficulty: string;
  createdAt: string;
}

export interface CallResponse {
  id: string;
  scenarioId: string;
  phoneNumber: string;
  status: CallStatus;
  transcript: string | null;
  duration: number | null;
  outcome: string | null;
  vapiCallId: string | null;
  voicePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackResponse {
  id: string;
  callId: string;
  category: FeedbackCategory;
  score: number;
  suggestion: string | null;
  createdAt: string;
}

export interface CallWithFeedback extends CallResponse {
  feedback: FeedbackResponse[];
  scenario?: ScenarioResponse;
}
