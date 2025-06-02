# CurioQuest

A gamified educational platform that combines TikTok-style vertical video delivery with Duolingo-inspired learning mechanics for curriculum-based content.

## Features

### 🎥 TikTok-Style Video Feed
- Vertical video format optimized for mobile engagement
- Swipe navigation between educational videos
- Auto-playing content with pause/play controls
- Real educational video content across multiple subjects

### 🎮 Gamification Elements
- Point-based scoring system for video completion
- Streak tracking to encourage daily learning
- Achievement system with progress indicators
- Interactive leaderboard for competitive learning

### 📚 Educational Content
- Subject-based organization (Chemistry, Mathematics, English, Physics)
- Periodic quiz system for retention testing
- Progress tracking across different topics
- User performance analytics

### 🔧 Technical Features
- Responsive mobile-first design
- Real-time state management
- Touch gesture support for navigation
- Keyboard shortcuts for desktop users

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **TanStack Query** for data fetching and caching
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **In-memory storage** for rapid prototyping
- **Zod** for runtime type validation

### UI Components
- **Radix UI** for accessible components
- **Shadcn/ui** component library
- **Lucide React** for icons

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd curioquest
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions and configurations
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   └── storage.ts        # Data storage interface
├── shared/               # Shared types and schemas
└── public/              # Static assets including videos
```

## Usage

### For Students

1. **Onboarding**: Enter your name, grade level, and school
2. **Video Feed**: Watch educational videos in TikTok-style interface
3. **Navigation**: 
   - Swipe up/down to change videos
   - Click video to pause/play
   - Use arrow buttons for navigation
4. **Quizzes**: Complete periodic quizzes to test comprehension
5. **Progress**: Track your learning progress on the dashboard
6. **Competition**: View your ranking on the leaderboard

### Navigation Controls

- **Mobile**: Swipe gestures and touch controls
- **Desktop**: Keyboard arrow keys and mouse clicks
- **Universal**: Side arrow buttons for video navigation

## API Endpoints

### Videos
- `GET /api/videos` - Get all videos
- `POST /api/videos/:id/view` - Increment video view count

### Users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/score` - Update user score

### Quizzes
- `GET /api/quizzes` - Get random quiz
- `POST /api/quiz-attempts` - Submit quiz attempt

### Leaderboard
- `GET /api/leaderboard` - Get top users by score

## Development

### Adding New Videos

1. Place video files in `public/videos/` directory
2. Update the video data in `server/storage.ts`
3. Ensure videos are in web-compatible MP4 format

### Customizing Subjects

Edit the subjects data in `server/storage.ts` to add new learning categories.

### Styling

The application uses Tailwind CSS with a custom color scheme:
- Primary: Purple (#6C5CE7)
- Secondary: Green (#00B894) 
- Accent: Gold (#FDCB6E)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by TikTok's engaging video interface
- Gamification mechanics inspired by Duolingo
- Built with modern web technologies for optimal performance