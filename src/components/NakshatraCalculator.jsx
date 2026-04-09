import { useState, useRef, useEffect, useCallback } from 'react'
import './NakshatraCalculator.css'
import { API_BASE } from '../apiConfig'

const NakshatraCalculator = ({ onBack }) => {
  // Form state
  const [name, setName] = useState('')
  const [gender, setGender] = useState('Male')
  const [date, setDate] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [ampm, setAmpm] = useState('AM')

  // Place search state
  const [placeQuery, setPlaceQuery] = useState('')
  const [placeResults, setPlaceResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [placeValidated, setPlaceValidated] = useState(false)
  const [searching, setSearching] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)
  const cacheRef = useRef({}) // Cache for place search results

  // Result state
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Place search with debounce and caching
  const searchPlaces = useCallback(async (q) => {
    if (q.length < 2) { setPlaceResults([]); setShowDropdown(false); return }
    
    // Check cache first
    if (cacheRef.current[q]) {
      setPlaceResults(cacheRef.current[q])
      setShowDropdown(true)
      setActiveIdx(-1)
      return
    }
    
    setSearching(true)
    setShowDropdown(true)
    try {
      const resp = await fetch(`${API_BASE}/places?q=${encodeURIComponent(q)}&max_rows=8`)
      const data = await resp.json()
      const results = data.results || []
      
      // Cache the results
      cacheRef.current[q] = results
      setPlaceResults(results)
      setActiveIdx(-1)
    } catch { setPlaceResults([]) }
    setSearching(false)
  }, [])

  const handlePlaceInput = (e) => {
    const val = e.target.value
    setPlaceQuery(val)
    setSelectedPlace(null)
    setPlaceValidated(false)
    clearTimeout(debounceRef.current)
    
    if (cacheRef.current[val]) {
      setPlaceResults(cacheRef.current[val])
      setShowDropdown(true)
      setActiveIdx(-1)
      return
    }
    
    debounceRef.current = setTimeout(() => searchPlaces(val), 150)
  }

  const selectPlace = (place) => {
    setPlaceQuery(place.display)
    setSelectedPlace(place)
    setPlaceValidated(true)
    setShowDropdown(false)
    setPlaceResults([])
  }

  const handlePlaceKeyDown = (e) => {
    if (!showDropdown || !placeResults.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, placeResults.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); selectPlace(placeResults[activeIdx]) }
    else if (e.key === 'Escape') { setShowDropdown(false) }
  }

  // Close dropdown on outside click and clear invalid input
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false)
        // Clear input if user didn't select from dropdown
        if (placeQuery && !placeValidated) {
          setPlaceQuery('')
          setError('Please select a place from the dropdown suggestions')
        }
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [placeQuery, placeValidated])

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!name.trim()) { setError('Please enter a name'); return }
    if (!date) { setError('Please enter date of birth'); return }
    if (!hour) { setError('Please enter time of birth'); return }
    if (!placeQuery.trim()) { setError('Please enter place of birth'); return }
    if (!placeValidated || !selectedPlace) { setError('Please select a place from the dropdown suggestions'); return }

    const body = {
      name: name.trim(),
      gender,
      date: date,
      hour: parseInt(hour),
      minute: parseInt(minute) || 0,
      ampm,
      place: placeQuery,
    }

    if (selectedPlace) {
      body.latitude = selectedPlace.lat
      body.longitude = selectedPlace.lon
      body.timezone = selectedPlace.timezone
    }

    setLoading(true)
    try {
      const resp = await fetch(`${API_BASE}/nakshatra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.detail || 'Calculation failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <section className="nk-calc">
      <div className="container">
        <button className="nk-back" onClick={onBack} aria-label="Go back">
          ← Back
        </button>

        <div className="nk-card">
          <div className="nk-card-header">
            <h2>🔯 Calculate Nakshatra</h2>
            <p>Enter birth details to find your Nakshatra, Rasi, and Pada</p>
          </div>

          <form className="nk-form" onSubmit={handleSubmit}>
            {/* Name & Gender */}
            <div className="nk-row">
              <div className="nk-field nk-field-grow">
                <label htmlFor="nk-name">Full Name</label>
                <input id="nk-name" type="text" placeholder="Enter your name"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="nk-field nk-field-gender">
                <label>Gender</label>
                <div className="nk-toggle-group">
                  <button type="button" className={`nk-toggle ${gender === 'Male' ? 'active' : ''}`}
                    onClick={() => setGender('Male')}>Male</button>
                  <button type="button" className={`nk-toggle ${gender === 'Female' ? 'active' : ''}`}
                    onClick={() => setGender('Female')}>Female</button>
                </div>
              </div>
            </div>

            {/* DOB */}
            <div className="nk-row">
              <div className="nk-field nk-field-full">
                <label htmlFor="nk-date">Date of Birth</label>
                <input id="nk-date" type="date" 
                  value={date} onChange={e => setDate(e.target.value)} 
                  max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            {/* TOB */}
            <div className="nk-row">
              <div className="nk-field">
                <label htmlFor="nk-hour">Hour</label>
                <input id="nk-hour" type="number" placeholder="HH" min="1" max="12"
                  value={hour} onChange={e => setHour(e.target.value)} />
              </div>
              <div className="nk-field">
                <label htmlFor="nk-minute">Minute</label>
                <input id="nk-minute" type="number" placeholder="MM" min="0" max="59"
                  value={minute} onChange={e => setMinute(e.target.value)} />
              </div>
              <div className="nk-field">
                <label>AM / PM</label>
                <div className="nk-toggle-group">
                  <button type="button" className={`nk-toggle ${ampm === 'AM' ? 'active' : ''}`}
                    onClick={() => setAmpm('AM')}>AM</button>
                  <button type="button" className={`nk-toggle ${ampm === 'PM' ? 'active' : ''}`}
                    onClick={() => setAmpm('PM')}>PM</button>
                </div>
              </div>
            </div>

            {/* Place search */}
            <div className="nk-row">
              <div className="nk-field nk-field-full">
                <label htmlFor="nk-place">Place of Birth</label>
                <div className="nk-place-wrap">
                  <input id="nk-place" ref={inputRef} type="text" autoComplete="off"
                    placeholder="Type city or village name..."
                    value={placeQuery} onChange={handlePlaceInput} onKeyDown={handlePlaceKeyDown} />
                  {showDropdown && (
                    <div className="nk-place-dropdown" ref={dropdownRef}>
                      {searching && <div className="nk-place-loading">Searching...</div>}
                      {!searching && placeResults.length === 0 && placeQuery.length >= 2 &&
                        <div className="nk-place-loading">No places found</div>}
                      {placeResults.map((p, i) => (
                        <div key={p.geoname_id || i}
                          className={`nk-place-item ${i === activeIdx ? 'active' : ''}`}
                          onClick={() => selectPlace(p)}>
                          <span className="nk-place-name">{p.name}</span>
                          <span className="nk-place-sub">
                            {[p.admin1, p.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedPlace && (
                  <div className="nk-geo-badge">
                    ✓ {selectedPlace.display} — {selectedPlace.lat.toFixed(4)}°N, {selectedPlace.lon.toFixed(4)}°E
                  </div>
                )}
              </div>
            </div>

            {error && <div className="nk-error">{error}</div>}

            <button type="submit" className="btn nk-submit" disabled={loading || !placeValidated}>
              {loading ? 'Calculating...' : 'Calculate Nakshatra'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="nk-result-card">
            <h3>Nakshatra Result</h3>
            <div className="nk-result-grid">
              <ResultRow label="Nakshatra" value={`${result.nakshatra} — ${result.pada_label} Pada`} highlight />
              <ResultRow label="Chandra Rasi" value={result.chandra_rasi} highlight />
              <ResultRow label="Deity" value={result.deity} />
              <ResultRow label="Gana" value={result.gana} />
              <ResultRow label="Animal Sign" value={result.animal_sign} />
              <ResultRow label="Zodiac" value={result.zodiac_sign} />
              <ResultRow label="Symbol" value={result.symbol} />
              <ResultRow label="Color" value={result.color} />
              <ResultRow label="Birthstone" value={result.birthstone} />
              <ResultRow label="Best Direction" value={result.best_direction} />
              <ResultRow label="Syllables" value={result.syllables?.join(', ')} />
              <ResultRow label="Moon Longitude" value={`${result.moon_longitude}°`} />
              <ResultRow label="Nakshatra Range" value={result.nakshatra_range} />
            </div>

            <div className="nk-result-meta">
              <h4>Birth Info</h4>
              <div className="nk-meta-grid">
                <span>Name: {result.name}</span>
                <span>Date: {result.date}</span>
                <span>Time: {result.time}</span>
                <span>Place: {result.place}</span>
                <span>Timezone: {result.timezone}</span>
                <span>Lat: {result.latitude?.toFixed(4)}</span>
                <span>Lon: {result.longitude?.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

const ResultRow = ({ label, value, highlight }) => (
  <div className={`nk-result-row ${highlight ? 'highlight' : ''}`}>
    <span className="nk-result-label">{label}</span>
    <span className="nk-result-value">{value}</span>
  </div>
)

export default NakshatraCalculator
