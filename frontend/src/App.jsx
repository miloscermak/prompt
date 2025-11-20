import { useState } from 'react';
import axios from 'axios';

const MODELS = {
  openai: [
    { id: 'gpt-5-mini', label: 'GPT-5 Mini' },
    { id: 'gpt-5.1', label: 'GPT-5.1' },
  ],
  gemini: [
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro Preview' },
  ],
  claude: [
    { id: 'claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
    { id: 'claude-opus-4.1', label: 'Claude Opus 4.1' },
  ],
};

function App() {
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [selectedModels, setSelectedModels] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleModelToggle = (modelId) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleTest = async () => {
    if (!prompt.trim()) {
      setError('Prosím zadej prompt');
      return;
    }

    if (selectedModels.length === 0) {
      setError('Prosím vyber alespoň jeden model');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setProgress('Generuji odpovědi...');

    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          models: selectedModels,
          count: parseInt(count),
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.done) {
              setProgress('Hotovo!');
              setLoading(false);
            } else if (data.error) {
              setError(data.error);
              setLoading(false);
            } else {
              // Add result immediately to the list
              setResults((prev) => {
                const updated = [...prev, data];
                setProgress(`Přijato odpovědí: ${updated.length}`);
                return updated;
              });
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Nastala chyba při komunikaci se servrem');
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (results.length === 0) {
      setError('Nejsou žádné výsledky k exportu');
      return;
    }

    try {
      const response = await axios.post(
        '/api/export-excel',
        {
          results,
          prompt,
        },
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ai-model-responses-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError('Nastala chyba při exportu do Excelu');
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>🤖 AI Model Tester</h1>

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="prompt">Prompt pro testování:</label>
            <textarea
              id="prompt"
              rows="5"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Zadej svůj prompt zde..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="count">Počet odpovědí (1-100):</label>
            <input
              type="number"
              id="count"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Výběr modelů:</label>
            <div className="models-grid">
              <div className="model-category">
                <h3>OpenAI</h3>
                <div className="checkbox-group">
                  {MODELS.openai.map((model) => (
                    <label key={model.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model.id)}
                        onChange={() => handleModelToggle(model.id)}
                        disabled={loading}
                      />
                      {model.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="model-category">
                <h3>Google Gemini</h3>
                <div className="checkbox-group">
                  {MODELS.gemini.map((model) => (
                    <label key={model.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model.id)}
                        onChange={() => handleModelToggle(model.id)}
                        disabled={loading}
                      />
                      {model.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="model-category">
                <h3>Anthropic Claude</h3>
                <div className="checkbox-group">
                  {MODELS.claude.map((model) => (
                    <label key={model.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model.id)}
                        onChange={() => handleModelToggle(model.id)}
                        disabled={loading}
                      />
                      {model.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="button-group">
            <button
              className="test-button"
              onClick={handleTest}
              disabled={loading}
            >
              {loading ? 'Testuji...' : 'Spustit test'}
            </button>
            <button
              className="export-button"
              onClick={handleExport}
              disabled={loading || results.length === 0}
            >
              Stáhnout Excel
            </button>
          </div>
        </div>

        {progress && <div className="progress">{progress}</div>}

        {error && <div className="error">{error}</div>}

        {results.length > 0 && (
          <div className="results">
            <h2>Výsledky ({results.length} odpovědí)</h2>
            {results.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <span className="result-model">{result.model}</span>
                  <span className="result-meta">
                    Odpověď #{result.responseNumber} | {new Date(result.timestamp).toLocaleString('cs-CZ')}
                  </span>
                </div>
                <div className="result-response">{result.response}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
