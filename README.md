# Gesture-Controlled 3D Particle System

A full-stack web application where users control floating particles that coalesce into 3D objects through hand gestures captured via webcam.

## Features

- **20,000+ GPU-Accelerated Particles** - Smooth, real-time particle rendering using Three.js
- **Hand Gesture Recognition** - MediaPipe Hands for accurate gesture detection
- **Multiple 3D Formations** - Sphere, Cube, Torus, and more
- **Gesture Controls**:
  - 👌 **Pinch** → Gather into sphere
  - ✋ **Open Palm** → Explode particles
  - ✊ **Fist** → Form cube
  - 👈👉 **Swipe** → Switch between shapes
  - 🔄 **Rotate Wrist** → Rotate object
  - 🙌 **Two-Hand Spread** → Scale up
- **Backend API** - Save custom gesture mappings, presets, and session analytics

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Three.js** - WebGL 3D rendering
- **@react-three/fiber** - React renderer for Three.js
- **MediaPipe Hands** - Hand tracking ML model
- **Zustand** - State management
- **Tailwind CSS** - Styling

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma** - Database ORM
- **PostgreSQL** - Database (configurable)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or use a cloud provider like Vercel Postgres)

### Installation

1. **Clone the repository**
   ```bash
   cd ldr-3d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/particle_system"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enable Camera** - Click the "Enable Camera" button in the top-right corner
2. **Grant Permissions** - Allow camera access when prompted
3. **Start Gesturing** - Use the gestures shown in the overlay to control particles

## Project Structure

```
ldr-3d/
├── app/
│   ├── api/
│   │   ├── gestures/      # Gesture mapping CRUD
│   │   ├── presets/       # Preset management
│   │   └── sessions/      # Session tracking
│   ├── layout.tsx
│   └── page.tsx           # Main application page
├── components/
│   ├── CameraControl.tsx  # Camera permission UI
│   ├── GestureOverlay.tsx # Gesture feedback display
│   └── ParticleCanvas.tsx # Three.js scene
├── lib/
│   ├── hand-tracking/
│   │   ├── HandTracker.ts       # MediaPipe integration
│   │   ├── GestureClassifier.ts # Gesture recognition
│   │   └── GestureMapper.ts     # Gesture → action mapping
│   ├── particles/
│   │   ├── ParticleSystem.ts    # Main particle engine
│   │   ├── ObjectFormations.ts  # 3D shape generators
│   │   └── MorphEngine.ts       # Smooth transitions
│   └── prisma.ts          # Prisma client
├── store/
│   ├── useParticleStore.ts # Particle state
│   └── useGestureStore.ts  # Gesture state
├── prisma/
│   └── schema.prisma      # Database schema
└── prisma.config.ts       # Prisma configuration
```

## API Endpoints

### Gestures
- `GET /api/gestures?userId={id}` - Get user's gesture mappings
- `POST /api/gestures` - Create new gesture mapping
- `DELETE /api/gestures?id={id}` - Delete gesture mapping

### Presets
- `GET /api/presets?userId={id}` - Get available presets
- `POST /api/presets` - Create new preset

### Sessions
- `POST /api/sessions/start` - Start tracking session
- `POST /api/sessions/end` - End session with analytics

## Database Schema

- **User** - User profiles
- **GestureMapping** - Custom gesture → action mappings
- **Preset** - Saved configurations
- **Session** - Usage analytics

## Performance

- **Target FPS**: 60 FPS with 20,000 particles
- **Hand Tracking**: ~30 FPS
- **Supported Browsers**: Chrome, Firefox, Safari, Edge (WebGL 2.0 required)

## Future Enhancements

- [ ] Settings panel for customization
- [ ] Authentication system (NextAuth.js)
- [ ] User profile management
- [ ] Voice commands combined with gestures
- [ ] Multi-user collaborative control
- [ ] VR/AR support
- [ ] Custom 3D model uploads
- [ ] Social features (share presets, gallery)

## License

MIT

## Acknowledgments

- [MediaPipe](https://mediapipe.dev/) - Hand tracking
- [Three.js](https://threejs.org/) - 3D rendering
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React integration
