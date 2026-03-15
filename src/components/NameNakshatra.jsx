import { useState, useRef } from 'react'
import './NakshatraCalculator.css'
import './NameNakshatra.css'

const API_BASE = 'https://siddhagurukundli.onrender.com/api'

const NameNakshatra = ({ onBack }) => {
  const [name, setName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const resultRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setResult(null)
    if (!name.trim()) { setError('Please enter a name'); return }

    setLoading(true)
    try {
      const resp = await fetch(`${API_BASE}/nakshatra-by-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.detail || 'Lookup failed')
      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  return (
    <section className="nk-calc">
      <div className="container">
        <button className="nk-back" onClick={onBack}>← Back</button>

        <div className="nk-card">
          <div className="nk-card-header nn-header">
            <h2>🔤Nakshatra from Name</h2>
            <p>Find your Nakshatra, Rashi &amp; Pada from the first syllable of your name</p>
          </div>

          <form className="nk-form" onSubmit={handleSubmit}>
            <div className="nk-row">
              <div className="nk-field nk-field-full">
                <label htmlFor="nn-name">Your Name (Telugu or English)</label>
                <input
                  id="nn-name" type="text" autoComplete="off"
                  placeholder="e.g. Shiva , ఆనంద్"
                  value={name} onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
            {error && <div className="nk-error">{error}</div>}
            <button type="submit" className="btn nk-submit" disabled={loading}>
              {loading ? 'Looking up...' : 'Find Nakshatra'}
            </button>
          </form>
        </div>

        {result && (
          <div className="nn-result-card" ref={resultRef}>
            <div className="nn-result-header">
              <h3>{result.name}</h3>
              <span className="nn-matched">Matched syllable: <strong>{result.matched_syllable}</strong></span>
            </div>
            <div className="nn-result-grid">
              <ResultTile icon="⭐" label="Nakshatra" value={result.nakshatra} sub={result.nakshatra_telugu} />
              <ResultTile icon="♎" label="Rashi" value={result.rashi} sub={result.rashi_telugu} />
              <ResultTile icon="🔢" label="Pada" value={result.pada_label} sub={`Pada ${result.pada}`} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

const ResultTile = ({ icon, label, value, sub }) => (
  <div className="nn-tile">
    <span className="nn-tile-icon">{icon}</span>
    <span className="nn-tile-label">{label}</span>
    <span className="nn-tile-value">{value}</span>
    {sub && <span className="nn-tile-sub">{sub}</span>}
  </div>
)

export default NameNakshatra
