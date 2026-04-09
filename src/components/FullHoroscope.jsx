import { useState, useRef, useEffect, useCallback } from 'react'
import './NakshatraCalculator.css'
import './FullHoroscope.css'
import { API_BASE } from '../apiConfig'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAY_EMOJI = { Monday: '🌙', Tuesday: '🔥', Wednesday: '💚', Thursday: '🪐', Friday: '💎', Saturday: '⚫', Sunday: '☀️' }

const FullHoroscope = ({ onBack }) => {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('Male')
  const [date, setDate] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [ampm, setAmpm] = useState('AM')
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
  const cacheRef = useRef({})
  const resultRef = useRef(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeDay, setActiveDay] = useState(0)
  const [openSection, setOpenSection] = useState('weekday')

  const searchPlaces = useCallback(async (q) => {
    if (q.length < 2) { setPlaceResults([]); setShowDropdown(false); return }
    if (cacheRef.current[q]) { setPlaceResults(cacheRef.current[q]); setShowDropdown(true); setActiveIdx(-1); return }
    setSearching(true); setShowDropdown(true)
    try {
      const resp = await fetch(`${API_BASE}/places?q=${encodeURIComponent(q)}&max_rows=8`)
      const data = await resp.json()
      const results = data.results || []
      cacheRef.current[q] = results
      setPlaceResults(results); setActiveIdx(-1)
    } catch { setPlaceResults([]) }
    setSearching(false)
  }, [])

  const handlePlaceInput = (e) => {
    const val = e.target.value
    setPlaceQuery(val); setSelectedPlace(null); setPlaceValidated(false)
    clearTimeout(debounceRef.current)
    
    if (cacheRef.current[val]) {
      setPlaceResults(cacheRef.current[val])
      setShowDropdown(true)
      setActiveIdx(-1)
      return
    }
    
    debounceRef.current = setTimeout(() => searchPlaces(val), 150)
  }
  const selectPlace = (p) => { setPlaceQuery(p.display); setSelectedPlace(p); setPlaceValidated(true); setShowDropdown(false) }
  const handlePlaceKeyDown = (e) => {
    if (!showDropdown || !placeResults.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, placeResults.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); selectPlace(placeResults[activeIdx]) }
    else if (e.key === 'Escape') setShowDropdown(false)
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setResult(null)
    if (!name.trim()) { setError('Please enter a name'); return }
    if (!date) { setError('Please enter date of birth'); return }
    if (!hour) { setError('Please enter birth time'); return }
    if (!placeQuery.trim()) { setError('Please enter place'); return }
    if (!placeValidated || !selectedPlace) { setError('Please select a place from the dropdown suggestions'); return }
    const body = { name: name.trim(), gender, date: date, hour: parseInt(hour), minute: parseInt(minute) || 0, ampm, place: placeQuery }
    if (selectedPlace) { body.latitude = selectedPlace.lat; body.longitude = selectedPlace.lon; body.timezone = selectedPlace.timezone }
    setLoading(true)
    try {
      const resp = await fetch(`${API_BASE}/weekly-horoscope`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.detail || 'Calculation failed')
      setResult(data); setActiveDay(0); setOpenSection('weekday')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  const toggleSection = (key) => setOpenSection(openSection === key ? null : key)
  const fmtDate = (ds) => { const [y, m, d] = ds.split('-'); return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}` }
  const currentDay = result?.days?.[activeDay]

  return (
    <section className="nk-calc">
      <div className="container">
        <button className="nk-back" onClick={onBack}>← Back</button>
        <div className="nk-card">
          <div className="nk-card-header fh-header">
            <h2>🪷 Weekly Horoscope</h2>
            <p>7-day Vedic Panchang predictions starting from today</p>
          </div>
          <form className="nk-form" onSubmit={handleSubmit}>
            <div className="nk-row">
              <div className="nk-field nk-field-grow">
                <label htmlFor="fh-name">Full Name</label>
                <input id="fh-name" type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="nk-field nk-field-gender">
                <label>Gender</label>
                <div className="nk-toggle-group">
                  <button type="button" className={`nk-toggle ${gender === 'Male' ? 'active' : ''}`} onClick={() => setGender('Male')}>Male</button>
                  <button type="button" className={`nk-toggle ${gender === 'Female' ? 'active' : ''}`} onClick={() => setGender('Female')}>Female</button>
                </div>
              </div>
            </div>
            <div className="nk-row">
              <div className="nk-field nk-field-full"><label htmlFor="fh-date">Date of Birth</label><input id="fh-date" type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} /></div>
            </div>
            <div className="nk-row">
              <div className="nk-field"><label htmlFor="fh-hour">Birth Hour</label><input id="fh-hour" type="number" placeholder="HH" min="1" max="12" value={hour} onChange={e => setHour(e.target.value)} /></div>
              <div className="nk-field"><label htmlFor="fh-min">Birth Minute</label><input id="fh-min" type="number" placeholder="MM" min="0" max="59" value={minute} onChange={e => setMinute(e.target.value)} /></div>
              <div className="nk-field">
                <label>AM / PM</label>
                <div className="nk-toggle-group">
                  <button type="button" className={`nk-toggle ${ampm === 'AM' ? 'active' : ''}`} onClick={() => setAmpm('AM')}>AM</button>
                  <button type="button" className={`nk-toggle ${ampm === 'PM' ? 'active' : ''}`} onClick={() => setAmpm('PM')}>PM</button>
                </div>
              </div>
            </div>
            <div className="nk-row">
              <div className="nk-field nk-field-full">
                <label htmlFor="fh-place">Place of Birth</label>
                <div className="nk-place-wrap">
                  <input id="fh-place" ref={inputRef} type="text" autoComplete="off" placeholder="Type city or village name..." value={placeQuery} onChange={handlePlaceInput} onKeyDown={handlePlaceKeyDown} />
                  {showDropdown && (
                    <div className="nk-place-dropdown" ref={dropdownRef}>
                      {searching && <div className="nk-place-loading">Searching...</div>}
                      {!searching && placeResults.length === 0 && placeQuery.length >= 2 && <div className="nk-place-loading">No places found</div>}
                      {placeResults.map((p, i) => (
                        <div key={p.geoname_id || i} className={`nk-place-item ${i === activeIdx ? 'active' : ''}`} onClick={() => selectPlace(p)}>
                          <span className="nk-place-name">{p.name}</span>
                          <span className="nk-place-sub">{[p.admin1, p.country].filter(Boolean).join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedPlace && <div className="nk-geo-badge">✓ {selectedPlace.display} — {selectedPlace.lat.toFixed(4)}°N, {selectedPlace.lon.toFixed(4)}°E</div>}
              </div>
            </div>
            {error && <div className="nk-error">{error}</div>}
            <button type="submit" className="btn nk-submit" disabled={loading || !placeValidated}>{loading ? 'Calculating...' : 'Get Weekly Horoscope'}</button>
          </form>
        </div>

        {/* ── Weekly Results ──────────────────────────────── */}
        {result && (
          <div className="fh-results" ref={resultRef}>
            {/* Person info bar */}
            <div className="fh-person-bar">
              <span>{result.input_details.name}</span>
              <span className="fh-person-sep">·</span>
              <span>Born: {result.input_details.birth_date}</span>
              <span className="fh-person-sep">·</span>
              <span>{result.input_details.place}</span>
            </div>

            {/* Birth Rasi/Nakshatra Banner */}
            {result.birth_details && (
              <div className="fh-birth-banner">
                <div className="fh-birth-item">
                  <span className="fh-birth-label">Your Janma Rasi</span>
                  <span className="fh-birth-value">{result.birth_details.rasu}</span>
                </div>
                <div className="fh-birth-item">
                  <span className="fh-birth-label">Your Janma Nakshatra</span>
                  <span className="fh-birth-value">{result.birth_details.nakshatra}</span>
                </div>
              </div>
            )}

            {/* Day selector tabs */}
            <div className="fh-day-tabs">
              {result.days.map((d, i) => (
                <button key={d.date} type="button" className={`fh-day-tab ${i === activeDay ? 'active' : ''}`} onClick={() => { setActiveDay(i); setOpenSection('weekday') }}>
                  <span className="fh-day-emoji">{WEEKDAY_EMOJI[d.weekday] || '📅'}</span>
                  <span className="fh-day-name">{d.weekday.slice(0, 3)}</span>
                  <span className="fh-day-date">{fmtDate(d.date)}</span>
                </button>
              ))}
            </div>

            {/* Active day summary chips */}
            {currentDay && (
              <div className="fh-summary-card">
                <div className="fh-summary-header">
                  <h3>{currentDay.weekday}, {fmtDate(currentDay.date)}</h3>
                </div>
                <div className="fh-chips">
                  <Chip label="Transit Nakshatra" value={currentDay.nakshatra} />
                  <Chip label="Current Rasi" value={currentDay.rasi} />
                  <Chip label="Tithi" value={currentDay.tithi} />
                  <Chip label="Yoga" value={currentDay.yoga} />
                </div>
              </div>
            )}

            {/* Prediction accordions for active day */}
            {currentDay && (
              <div className="fh-predictions">
                {['transit', 'weekday', 'nakshatra', 'tithi', 'karana', 'yoga'].map(key => {
                  const pred = currentDay.predictions[key]
                  if (!pred) return null
                  const icons = { transit: '🌓', weekday: '📅', nakshatra: '⭐', tithi: '🌙', karana: '🔱', yoga: '🕉️' }
                  return (
                    <PredictionSection key={key} sectionKey={key} title={pred.title} description={pred.description}
                      extra={pred.ruling_planet ? `Ruling Planet: ${pred.ruling_planet}` : null}
                      isOpen={openSection === key} onToggle={toggleSection} icon={icons[key]} />
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Sub-components ──────────────────────────────────── */
const Chip = ({ label, value }) => (
  <div className="fh-chip">
    <span className="fh-chip-label">{label}</span>
    <span className="fh-chip-value">{value}</span>
  </div>
)

const PredictionSection = ({ sectionKey, title, description, extra, isOpen, onToggle, icon }) => (
  <div className={`fh-pred-section ${isOpen ? 'open' : ''}`}>
    <button className="fh-pred-header" onClick={() => onToggle(sectionKey)} type="button">
      <span className="fh-pred-icon">{icon}</span>
      <span className="fh-pred-title">{title}</span>
      <span className="fh-pred-arrow">{isOpen ? '▾' : '▸'}</span>
    </button>
    {isOpen && (
      <div className="fh-pred-body">
        <p>{description}</p>
        {extra && <p className="fh-pred-extra">{extra}</p>}
      </div>
    )}
  </div>
)

export default FullHoroscope