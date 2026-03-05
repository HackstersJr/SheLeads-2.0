# Frontend Product Requirements Document (PRD)

## 1. Overview
The frontend of the AI-Driven Agritech Assistant is designed to be a **minimalist, voice-first interface**. The goal is to maximize accessibility for farmers by removing complex navigation menus, buttons, and dashboards, replacing them with an intuitive conversational UI powered by **Sarvam AI** for robust multilingual support.

## 2. Core Philosophy
- **Zero Learning Curve:** The app should be as simple to use as talking to a person.
- **Dynamic Context:** The UI automatically surfaces relevant information (like crop insights, weather, or alerts) dynamically depending on the conversation, rather than burying it in menus.
- **Always Alive:** The interface centers around a continuous, active voice session.

## 3. UI/UX Design & Layout
Based on the reference designs, the interface will feature a **lively, vibrant, and bright aesthetic** enhanced by dynamic micro-animations.

### 3.1 Main Interface Elements
- **Central Visualizer:** A prominent, interactive particle sphere in the center (or bottom-center) of the screen. This acts as the visual heartbeat of the agent, pulsating or changing states based on whether the agent is listening, processing, or speaking. The colors should be energetic and dynamic (e.g., shifting greens/yellows indicative of agriculture and life).
- **Settings Icon:** A minimal gear icon in the top right corner for essential configuration (language selection, account details).
- **Control Bar (Bottom):**
  - **Microphone Button:** To manually toggle listening mode (if not continuously listening).
  - **Cancel/Close Button:** To clear the current context or stop generation.

### 3.2 Dynamic Context Window (Chat Overlay)
- **Live Transcription:** As the farmer speaks, their speech is transcribed in real-time above the visualizer.
- **Agent Responses:** The agent's spoken responses also appear as text in this area.
- **Contextual Cards:** When the agent provides specific data (e.g., a crop health alert or soil data), a minimal, highly visual card may temporarily appear in this space, fading away when the conversation moves on.
- The chat window stays "alive" but auto-scrolls or clears old messages to keep the screen uncluttered.

## 4. Key Features & Functionality
- **Multilingual Voice Capabilities:** Integration with Sarvam AI to handle varied Indian languages and dialects natively, processing speech-to-text (STT) and text-to-speech (TTS) seamlessly.
- **Real-Time Responsiveness:** The UI must reflect the exact state of the agent (Listening -> Thinking -> Responding) with zero perceived latency.
- **Adaptive Layout:** The visualizer shrinks or moves slightly to the bottom when text or data cards need to be displayed on top.

## 5. Technology Stack Recommendations
- **Framework:** React.js, Next.js, or Vite for a snappy Single Page Application (SPA).
- **Styling:** Vanilla CSS, TailwindCSS, or Framer Motion for handling the complex particle animations and fluid transitions.
- **Voice Integration:** Sarvam AI SDK/APIs for STT and TTS.
- **Animation:** Three.js or WebGL (react-three-fiber) for the dynamic particle sphere visualizer.

## 6. Development Milestones
1. **Setup & Boilerplate:** Initialize the project and setup the dark mode design system.
2. **Visualizer Implementation:** Build the core particle sphere animation and define its states (idle, listening, speaking).
3. **Voice Integration:** Connect Sarvam AI for basic echoing (STT -> TTs).
4. **UI Overlay:** Implement the live transcription text rendering and the bottom control buttons.
5. **Backend Connection:** Hook the frontend up to the backend logic (drone data / personalized insights).
