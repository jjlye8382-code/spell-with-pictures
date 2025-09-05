# Meeting Recorder App

This is a prototype for a mobile-friendly meeting recording application. It demonstrates core features:

- Audio recording with start/stop/pause controls.
- Real-time transcription using the browser's SpeechRecognition API.
- Support for multiple languages (English, Bahasa Malaysia, Mandarin, Cantonese, Hokkien).
- Meeting list stored in browser local storage with search and filters.
- AI summarisation hooks via the `z-ai-web-dev-sdk` (placeholder).
- Topic categorisation and action plan generation (placeholders).
- Basic export and sharing functions using the Web Share API.

The project is intentionally lightweight and runs entirely in the browser. It should be treated as a foundation for further development rather than a complete product.

## Research notes

Popular meeting transcription services like **Otter.ai**, **Fireflies.ai** and **Rev.com** share several common patterns:

- Clear entry point to start recording with large microphone control.
- Live transcript panel that updates line by line during the meeting.
- Post-meeting summary page with topics, key points and actionable tasks.
- Meeting history/search view that allows filtering by date, participants or topics.
- Sharing and export options (text, PDF, or link) and integrations with messaging or cloud services.

This prototype aims to mirror these UX patterns at a minimal level.

