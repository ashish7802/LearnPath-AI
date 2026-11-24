# LearnPath AI

LearnPath AI is an open-source, personalized, skill-based engineering learning platform designed to take beginners from zero to demonstrable capability.

## Features

- **Three Career Pathways**: Software Engineer, Machine Learning Engineer, and AI Engineer.
- **Verifiable Skill Mastery**: Gated progression through assessments and practical coding exercises.
- **Curriculum Engine**: Data-driven, version-controlled curriculum schemas with prerequisite graphs.
- **Adaptive Study Planner**: Dynamic daily schedules based on SuperMemo-2 spaced repetition.
- **AI Learning Coach**: Multi-lingual guidance with analogies and progressive hints.
- **Zero-Barrier Onboarding**: Intake questionnaire with mini-diagnostic assessment.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/ashish7802/LearnPath-AI.git
cd LearnPath-AI
npm install
```

### Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Database Initialization

```bash
npx prisma db push
npm run db:seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
npm run validate:curriculum
node scripts/run-tests.mjs
node scripts/e2e-live-test.mjs
```

## License

MIT
