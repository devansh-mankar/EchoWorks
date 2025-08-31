# EchoWorks

> Transform raw content into polished, multilingual audio and video in minutes.

EchoWorks is a comprehensive audio/video content creation platform that combines three powerful workflows — **Knowledge Base**, **Email Theater**, and **EchoDub Live** — to help you research, summarize, and communicate across languages with high-quality speech synthesis and real-time dubbing capabilities.

## 🎯 Key Features

### 📚 Knowledge Base
Transform any content source into multilingual audio presentations:
- **Universal Input**: Search queries, text paste, file uploads, or URL fetching
- **Smart Analysis**: Automatic word count, complexity scoring, and key concept extraction
- **Script Generation**: AI-powered structured outlines and script creation
- **Multilingual Output**: One-click conversion to audio with translation and voice customization

### 📧 Email Theater
Convert your inbox into an audio experience:
- **Multi-source Ingestion**: Gmail OAuth integration, raw email paste, `.eml` file uploads
- **Smart Triage**: Organized tabs (Primary, Social, Updates, Promotions, Spam)
- **Advanced Filtering**: Date ranges, pagination, thread-first selection, safe HTML preview
- **Audio Summaries**: Editable summaries with language selection, recording presets, and per-sender voice mapping

### 🎙️ EchoDub Live
Real-time multilingual dubbing with professional quality:
- **Live Pipeline**: Microphone → ASR → Translation → TTS streaming
- **Low Latency**: WebAudio scheduling for near-instant playback
- **Resilient Architecture**: WebSocket streaming with HTTP fallback, chunk deduplication, auto-resume
- **Recording Modes**: Audio-only or video with camera preview, synced recording, downloadable WebM output

## 🏗️ Architecture

```
echoworks/
├── client/           # Frontend application
│   ├── src/         # React/Vue/Vanilla JS components
│   ├── public/      # Static assets
│   └── dist/        # Production build
├── server/          # Backend API
│   ├── routes/      # REST + streaming endpoints
│   ├── services/    # Core business logic
│   ├── middleware/  # Auth, validation, error handling
│   └── utils/       # Helper functions
└── docs/            # Additional documentation
```

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Web APIs (WebAudio, MediaRecorder), React , shadcn UI |
| **Backend** | Node.js, Express, WebSocket/SSE support |
| **Voice/AI** | Murf API (TTS), OpenAI/Whisper (ASR), LLM integration |
| **Email** | Gmail API, IMAP, RFC822 parsing |
| **Security** | OAuth 2.0, JWT, CORS/CSRF protection |
| **Media** | WebRTC, MediaRecorder API, WebM muxing |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Murf API key** ([Get one here](https://murf.ai))
- **Gmail OAuth credentials** (for Email Theater)
- **OpenAI API key** (optional, for enhanced features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/echoworks.git
   cd echoworks
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**

   Create `.env` files in both `server/` and `client/` directories:

   **`server/.env`**
   ```env
   # Core APIs
   MURF_API_KEY=your_murf_api_key_here
   
   # Gmail OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   
   # Session & Security
   SESSION_SECRET=your_secure_random_string_here
   APP_BASE_URL=http://localhost:3000
   
   # AI Services (optional)
   OPENAI_API_KEY=your_openai_api_key
   ASR_PROVIDER=openai
   LLM_PROVIDER=openai
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

   **`client/.env`**
   ```env
   VITE_API_BASE=http://localhost:3000
   VITE_WEBSOCKET_URL=ws://localhost:3000
   ```

4. **Run the application**

   ```bash
   # Terminal 1: Start the server
   cd server
   npm run dev

   # Terminal 2: Start the client
   cd client
   npm run dev
   ```

5. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173` (or the port shown in your client terminal)

## 📖 Usage Guide

### Knowledge Base Workflow

1. **Input your content** using one of four methods:
   - Enter a search query
   - Paste text directly
   - Upload a document
   - Provide a URL to fetch

2. **Review the analysis** showing word count, complexity, and key concepts

3. **Generate or edit** the script structure

4. **Select voice settings**:
   - Choose target language
   - Pick voice persona
   - Enable translation if needed

5. **Generate and download** your audio file

### Email Theater Workflow

1. **Connect your email**:
   - Sign in with Gmail OAuth, or
   - Upload `.eml` files, or
   - Paste raw email content

2. **Browse and filter** your messages using categories and date ranges

3. **Select messages** to summarize (supports multi-selection)

4. **Customize the audio summary**:
   - Edit the generated summary
   - Choose recording style
   - Map sender voices

5. **Generate audio** and listen or download

### EchoDub Live Workflow

1. **Grant microphone permissions** when prompted

2. **Select target language** for dubbing

3. **Start speaking** - your voice will be:
   - Transcribed in real-time
   - Translated to target language
   - Converted to speech with minimal delay

4. **Optional: Enable video** for picture-in-picture recording

5. **Download your recording** as a WebM file with dubbed audio

## 🔌 API Reference

### Authentication Endpoints
```
GET  /api/auth/google              # Initiate Gmail OAuth
GET  /api/auth/google/callback     # OAuth callback handler
POST /api/auth/logout              # End session
```

### Email Endpoints
```
GET  /api/email/threads            # List email threads
     Query params: ?category=primary&from=2024-01-01&to=2024-12-31&page=1

GET  /api/email/thread/:id         # Get thread details

POST /api/email/parse              # Parse uploaded email
     Body: { content: "raw_email_string" } or FormData with .eml file

POST /api/email/summarize          # Generate audio summary
     Body: { threadId: "...", summary: "...", language: "en", voice: "..." }
```

### Knowledge Base Endpoints
```
POST /api/kb/fetch                 # Fetch content from URL/search
     Body: { source: "url", content: "https://..." }

POST /api/kb/analyze               # Analyze content
     Body: { content: "..." }

POST /api/kb/script                # Generate script
     Body: { content: "...", style: "presentation" }

POST /api/kb/tts                   # Generate audio
     Body: { script: "...", language: "en", voice: "...", translate: false }
```

### Live Dubbing Endpoints
```
GET  /api/live/token               # Get session token

WS   /api/live/stream              # WebSocket streaming
     Send: audio chunks
     Receive: { transcript: "...", audio: "base64..." }

POST /api/live/fallback            # HTTP fallback for TTS
     Body: { text: "...", language: "en", voice: "..." }
```

### Utility Endpoints
```
GET  /api/health                   # Health check
GET  /api/voices                   # List available voices
GET  /api/languages                # List supported languages
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```


## 🙏 Acknowledgments

- **[Murf AI](https://murf.ai)** - For their excellent TTS API and developer support
- **Murf AI Coding Challenge #4** - The inspiration for this project


