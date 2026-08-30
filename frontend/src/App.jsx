import { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:5000/api";

function App() {
  const [theme, setTheme] = useState("dark");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoStatus, setRepoStatus] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useAgent, setUseAgent] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleAnalyzeRepo() {
    if (!repoUrl.trim()) {
      setRepoStatus("Please enter a GitHub repository URL.");
      return;
    }
    setAnalyzing(true);
    setRepoStatus("Cloning and processing repo... this may take a minute.");
    try {
      const res = await fetch(`${API_BASE}/repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process repository");
      setRepoStatus(`Repo processed: ${data.repoName}`);
    } catch (err) {
      setRepoStatus(`Error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAsk() {
    if (!question.trim() || loading) return;
    const userQuestion = question.trim();
    setMessages((prev) => [...prev, { role: "user", text: userQuestion }]);
    setQuestion("");
    setLoading(true);
    try {
      const endpoint = useAgent ? "/agent" : "/ask";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer, sources: data.sourceFiles || [] },
      ]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="top-bar">
        <h1>AI Codebase Assistant</h1>
        <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="repo-input-row">
        <input
          type="text"
          placeholder="Paste a GitHub repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          disabled={analyzing}
        />
        <button onClick={handleAnalyzeRepo} disabled={analyzing}>
          {analyzing ? "Analyzing..." : "Analyze Repository"}
        </button>
      </div>

      {repoStatus && <p className="placeholder-text">{repoStatus}</p>}

      <div className="mode-toggle-row">
  <div
    className={`toggle-switch ${useAgent ? "active" : ""}`}
    onClick={() => setUseAgent(!useAgent)}
  >
    <div className="toggle-knob"></div>
  </div>
  <div className="mode-label">
    {useAgent ? "Agent mode" : "Normal mode"}
    <span>{useAgent ? "Multi-step reasoning with tools" : "Single-pass retrieval"}</span>
  </div>
</div>

      <div className="chat-window">
  {messages.length === 0 && (
    <p className="placeholder-text">Ask something about your code...</p>
  )}
  {messages.map((message, index) => (
    <div key={index} className={`message-row ${message.role}`}>
      <div className={`message ${message.role}`}>
        <div className="message-label">{message.role === "user" ? "You" : "AI"}</div>
        <p>{message.text}</p>
        {message.sources && message.sources.length > 0 && (
          <div className="sources">Sources: {message.sources.join(", ")}</div>
        )}
      </div>
    </div>
  ))}
  {loading && (
    <div className="message-row assistant">
      <div className="message assistant typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  )}
  <div ref={chatEndRef} />
</div>

      <div className="ask-row">
        <input
          type="text"
          placeholder="Ask a question about your repo..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          disabled={loading}
        />
        <button onClick={handleAsk} disabled={loading}>
          {loading ? "..." : "Ask"}
        </button>
      </div>
    </div>
  );
}

export default App;