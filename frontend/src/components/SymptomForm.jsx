import { useState } from "react";
import VoiceInput from "./VoiceInput.jsx";

export default function SymptomForm({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [inputMethod, setInputMethod] = useState("text");

  const handleVoiceResult = (transcript) => {
    setText(transcript);
    setInputMethod("voice");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text, inputMethod);
  };

  return (
    <form className="symptom-form" onSubmit={handleSubmit}>
      <label htmlFor="symptoms">Describe what's happening</label>
      <textarea
        id="symptoms"
        rows={4}
        placeholder="e.g. My father has had a fever for 2 days and is very tired..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setInputMethod("text");
        }}
      />
      <div className="form-actions">
        <VoiceInput onResult={handleVoiceResult} />
        <button type="submit" disabled={loading || !text.trim()}>
          {loading ? "Checking..." : "Get Guidance"}
        </button>
      </div>
    </form>
  );
}
