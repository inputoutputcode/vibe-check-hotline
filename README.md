# Vibe Check Hotline

An AI-powered phone manner coaching application that simulates realistic customer calls to help users improve their phone communication skills.

## Features

- **Scenario Configuration**: Choose from multiple industries (Healthcare, Salon, Automotive, Professional Services) and task types (booking, inquiry, complaint, pricing)
- **Voice AI Integration**: Powered by Vapi.ai for realistic phone call simulations
- **Call Analysis**: Automated scoring on greeting quality, clarity, warmth, question handling, and closing behavior
- **Industry-Specific Feedback**: Tailored suggestions based on industry best practices

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Voice AI**: Vapi.ai

## Getting Started

### Prerequisites

- Node.js 20+
- A Vapi.ai API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file and add your API keys:
   ```bash
   cp .env.example .env
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite database path |
| `VAPI_API_KEY` | Your Vapi.ai API key |
| `WEBHOOK_BASE_URL` | Public URL for Vapi webhooks |

## Database Schema

- **Scenario**: Stores call configuration (industry, task type, difficulty)
- **Call**: Tracks individual calls with transcripts and outcomes
- **Feedback**: Stores scoring and suggestions for each call

## License

MIT
