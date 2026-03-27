import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface Solution {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: string;
  analysis: string;
}

function App() {
  const [problem, setProblem] = useState('');
  const [language, setLanguage] = useState('python');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!problem.trim()) {
      setError('Please enter a problem statement to generate solutions.');
      return;
    }

    setLoading(true);
    setSolutions([]);

    try {
      const response = await axios.post('http://localhost:3001/generate-solutions', { problem, language });
      if (!response.data?.approaches) {
        throw new Error('Unexpected response format from server.');
      }
      setSolutions(response.data.approaches);
    } catch (err) {
      console.error(err);
      setError('Unable to generate solutions right now. Please try again.');
    }

    setLoading(false);
  };

  const toggleAnalysis = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  const recentProblem = 
    solutions.length > 0 ? `Problem: ${problem.trim()} (language: ${language})` : 'Type a DSA problem and generate solutions.';

  return (
    <div className="App">
      <header className="hero">
        <div>
          <h1>CodeCoach AI</h1>
          <p>Instantly get brute-force, better, and optimal DSA solutions with complexity and analysis.</p>
        </div>
      </header>

      <main className="content">
        <section className="input-panel">
          <h2>Ask a Problem</h2>
          <p className="status">{recentProblem}</p>

          <form className="form" onSubmit={handleSubmit}>
            <textarea
              aria-label="Coding problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. Fibonacci series, Two Sum, Graph BFS, etc."
            />

            <div className="controls">
              <div className="select-group">
                <label htmlFor="language">Language</label>
                <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Thinking...' : 'Generate Solutions'}
              </button>
            </div>

            {error && <p className="error">{error}</p>}
          </form>
        </section>

        <section className="solutions-grid">
          {solutions.length === 0 && !loading && (
            <p className="empty-message">No solutions yet. Submit a problem to see code and analysis.</p>
          )}

          {solutions.map((solution, index) => (
            <article key={index} className="solution-card">
              <div className="solution-header">
                <h3>{solution.name}</h3>
                <div className="badges">
                  <span className="badge">Time: {solution.timeComplexity}</span>
                  <span className="badge">Space: {solution.spaceComplexity}</span>
                </div>
              </div>

              <div className="code-block">
                <pre>{solution.code}</pre>
              </div>

              <button className="secondary" onClick={() => toggleAnalysis(index)}>
                {expanded === index ? 'Hide Detail' : 'Show Detailed Analysis'}
              </button>

              {expanded === index && <p className="analysis">{solution.analysis}</p>}
            </article>
          ))}
        </section>
      </main>

      <footer className="footer">Powered by Gemini Flash API • DSA Learning Platform</footer>
    </div>
  );
}

export default App;
