import { useState, useRef } from "react";

export default function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  if (!supported) {
    return (
      <p className="voice-unsupported">
        Voice input isn't supported in this browser — try Chrome, or type your symptoms below.
      </p>
    );
  }

  return (
    <button
      type="button"
      className={`voice-btn ${listening ? "listening" : ""}`}
      onClick={startListening}
      disabled={listening}
    >
      {listening ? "🎙️ Listening..." : "🎤 Speak your symptoms"}
    </button>
  );
}
