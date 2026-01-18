import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, taskType, difficulty, phoneNumber, hasVoiceRecording } = body;

    // Validate required fields
    if (!industry || !taskType || !difficulty || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create or find scenario
    const scenario = await prisma.scenario.create({
      data: {
        industry,
        taskType,
        difficulty,
      },
    });

    // Create call record
    const call = await prisma.call.create({
      data: {
        scenarioId: scenario.id,
        phoneNumber,
        status: "pending",
      },
      include: {
        scenario: true,
        feedback: true,
      },
    });

    // TODO: Integrate with actual voice API (e.g., Vapi, Twilio) to initiate the call
    // For now, we'll simulate the call flow by updating status after a delay
    
    // Simulate call being initiated (in production, this would be handled by a webhook)
    setTimeout(async () => {
      try {
        await prisma.call.update({
          where: { id: call.id },
          data: { status: "in_progress" },
        });
      } catch (e) {
        console.error("Error updating call status:", e);
      }
    }, 2000);

    // Simulate call completion (in production, this would be handled by a webhook)
    setTimeout(async () => {
      try {
        await prisma.call.update({
          where: { id: call.id },
          data: {
            status: "completed",
            duration: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
            transcript: generateSampleTranscript(industry, taskType, difficulty),
            outcome: "info_provided",
          },
        });

        // Generate sample feedback
        const feedbackCategories = [
          "greeting",
          "clarity",
          "warmth",
          "question_handling",
          "next_steps",
          "closing",
        ];

        for (const category of feedbackCategories) {
          await prisma.feedback.create({
            data: {
              callId: call.id,
              category,
              score: Math.floor(Math.random() * 3) + 3, // 3-5 score
              suggestion: generateSuggestion(category),
            },
          });
        }
      } catch (e) {
        console.error("Error completing call:", e);
      }
    }, 8000);

    return NextResponse.json(call);
  } catch (error) {
    console.error("Error starting call:", error);
    return NextResponse.json(
      { error: "Failed to start call" },
      { status: 500 }
    );
  }
}

function generateSampleTranscript(
  industry: string,
  taskType: string,
  difficulty: string
): string {
  const industryName = {
    healthcare: "City Medical Center",
    salon: "Style Studio Salon",
    automotive: "AutoCare Service Center",
    professional: "Johnson & Associates",
  }[industry] || "Business";

  return `[Call Connected]

Customer: Hello, is this ${industryName}?

You: Yes, this is ${industryName}, how can I help you today?

Customer: Hi, I was calling about ${taskType === "booking" ? "scheduling an appointment" : taskType === "inquiry" ? "getting some information" : taskType === "complaint" ? "an issue I'm having" : "your pricing"}.

You: Of course, I'd be happy to help you with that. Can I get your name please?

Customer: Sure, it's Alex Thompson.

You: Thank you, Alex. ${taskType === "booking" ? "What day and time works best for you?" : taskType === "inquiry" ? "What would you like to know?" : taskType === "complaint" ? "I'm sorry to hear that. Can you tell me more about the issue?" : "I can definitely help with pricing information."}

[Call continues...]

You: Is there anything else I can help you with today?

Customer: No, that's all. Thank you for your help!

You: You're welcome! Have a great day!

[Call Ended]`;
}

function generateSuggestion(category: string): string {
  const suggestions: Record<string, string[]> = {
    greeting: [
      "Consider adding a warmer tone to your initial greeting",
      "Great job identifying yourself and the business clearly",
      "Try to sound more enthusiastic when answering",
    ],
    clarity: [
      "Speak a bit slower to ensure the customer understands",
      "Your explanations were clear and easy to follow",
      "Consider breaking down complex information into smaller parts",
    ],
    warmth: [
      "Show more empathy when the customer expresses concerns",
      "Your friendly tone made the customer feel comfortable",
      "Try using the customer's name more during the conversation",
    ],
    question_handling: [
      "Make sure to fully address each question before moving on",
      "Great job asking clarifying questions",
      "Consider repeating back key information to confirm understanding",
    ],
    next_steps: [
      "Be more specific about what happens next",
      "Good job explaining the next steps clearly",
      "Consider summarizing the action items at the end",
    ],
    closing: [
      "End with a more memorable closing statement",
      "Great job asking if there's anything else you can help with",
      "Consider thanking the customer for their time",
    ],
  };

  const categorySuggestions = suggestions[category] || suggestions.greeting;
  return categorySuggestions[Math.floor(Math.random() * categorySuggestions.length)];
}
