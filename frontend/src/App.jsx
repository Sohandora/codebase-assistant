import { useState } from "react";

const API_BASE = "http://localhost:5000/api";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoStatus, setRepoStatus] = useState("");

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [useAgent, setUseAgent] = useState(false);

  async function handleAnalyzeRepo() {
    if (!repoUrl.trim()) {
      setRepoStatus("Please enter a GitHub repository URL.");
      return;
    }

    setRepoStatus("Cloning and processing repo... this may take a minute.");

    try {
      const res = await fetch(`${API_BASE}/repo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          repoUrl: repoUrl
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process repository");
      }

      setRepoStatus(`Repo processed: ${data.repoName}`);
    } catch (err) {
      console.error(err);
      setRepoStatus(`Error: ${err.message}`);
    }
  }

  async function handleAsk() {
    if (!question.trim() || loading) {
      return;
    }

    const userQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userQuestion
      }
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const endpoint = useAgent ? "/agent" : "/ask";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: userQuestion
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer
        }
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Error: ${err.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>AI Codebase Assistant</h1>

      {/* Repository section */}
      <div className="repo-input-row">
        <input
          type="text"
          placeholder="Paste a GitHub repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />

        <button onClick={handleAnalyzeRepo}>
          Analyze Repository
        </button>
      </div>

      {repoStatus && (
        <p className="placeholder-text">
          {repoStatus}
        </p>
      )}

      {/* Agent toggle */}
      <label style={{ display: "block", marginBottom: "16px" }}>
        <input
          type="checkbox"
          checked={useAgent}
          onChange={(e) => setUseAgent(e.target.checked)}
        />

        {" "}Use Agent mode
      </label>

      {/* Chat */}
      <div className="chat-window">
        {messages.length === 0 && (
          <p className="placeholder-text">
            Ask something about your code...
          </p>
        )}

        {messages.map((message, index) => (
  <div
    key={index}
    className={`message ${
      message.role === "user"
        ? "user-message"
        : "ai-message"
    }`}
  >
    <div className="message-role">
      {message.role === "user" ? "You" : "AI"}
    </div>

    <div style={{ whiteSpace: "pre-wrap" }}>
      {message.text}
    </div>
  </div>
))}

        {loading && (
          <p className="placeholder-text">
            Thinking...
          </p>
        )}
      </div>

      {/* Question section */}
      <div className="ask-row">
        <input
          type="text"
          placeholder="Ask a question about your repo..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAsk();
            }
          }}
        />

        <button
          onClick={handleAsk}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>
    </div>
  );
}

export default App;