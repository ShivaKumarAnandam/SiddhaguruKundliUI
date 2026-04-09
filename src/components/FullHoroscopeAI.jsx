import { useState, useRef, useEffect, useCallback } from 'react'
import './NakshatraCalculator.css'
import './FullHoroscope.css'
import { useApiLockout } from '../hooks/useApiLockout'
import LoadingSkeleton from './LoadingSkeleton'
import { API_BASE } from '../apiConfig'
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const FullHoroscopeAI = ({ onBack }) => {
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
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openSection, setOpenSection] = useState('weekday')
  
  // Global API lockout hook
  const { isLocked, timeLeft, triggerLockout } = useApiLockout()

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
  
  const selectPlace = (p) => { setPlaceQuery(p.display); setSelectedPlace(p); setShowDropdown(false) }
  
  const handlePlaceKeyDown = (e) => {
    if (!showDropdown || !placeResults.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i+1, placeResults.length-1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i-1, 0)) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); selectPlace(placeResults[activeIdx]) }
    else if (e.key === 'Escape') setShowDropdown(false)
  }

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setResult(null)
    if (!name.trim()) { setError('Please enter a name'); return }
    if (!date) { setError('Please enter date of birth'); return }
    if (!hour) { setError('Please enter birth time'); return }
    if (!placeQuery.trim()) { setError('Please enter place'); return }
    
    const body = { 
      name: name.trim(), gender, date: date, 
      hour: parseInt(hour), minute: parseInt(minute) || 0, ampm, place: placeQuery 
    }
    if (selectedPlace) { 
      body.latitude = selectedPlace.lat
      body.longitude = selectedPlace.lon
      body.timezone = selectedPlace.timezone 
    }
    
    setLoading(true)
    try {
      const resp = await fetch(`${API_BASE}/horoscope/bygemini`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      })
      const data = await resp.json()
      
      // Check for 429 quota error
      if (resp.status === 429 || (data.detail && data.detail.includes('429'))) {
        triggerLockout() // Lock all AI buttons for 64 seconds
        setError('API quota exhausted. All AI features locked for 64 seconds to stay free.')
        return
      }
      
      if (!resp.ok) throw new Error(data.detail || 'AI calculation failed')
      setResult(data)
      setOpenSection('weekday')
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  const toggleSection = (key) => setOpenSection(openSection === key ? null : key)

  return (
    <section className="nk-calc">
      <div className="container">
        <button className="nk-back" onClick={onBack}>← Back</button>
        
        <div className="nk-card">
          <div className="nk-card-header fh-header">
            <h2>✨ Kundli / Horoscope with Gemini AI</h2>
            <p>AI-powered comprehensive Vedic horoscope using Google Gemini 2.5 Flash</p>
            <div className="ai-badge">⚡ Powered by Gemini AI</div>
          </div>

          <form className="nk-form" onSubmit={handleSubmit}>
            <div className="nk-row">
              <div className="nk-field nk-field-grow">
                <label>Full Name</label>
                <input type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
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
              <div className="nk-field nk-field-full">
                <label>Date of Birth</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div className="nk-row">
              <div className="nk-field">
                <label>Hour</label>
                <input type="number" placeholder="HH" min="1" max="12" value={hour} onChange={e => setHour(e.target.value)} />
              </div>
              <div className="nk-field">
                <label>Minute</label>
                <input type="number" placeholder="MM" min="0" max="59" value={minute} onChange={e => setMinute(e.target.value)} />
              </div>
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
                <label>Place of Birth</label>
                <div className="nk-place-wrap">
                  <input ref={inputRef} type="text" autoComplete="off" placeholder="Type city or village name..."
                    value={placeQuery} onChange={handlePlaceInput} onKeyDown={handlePlaceKeyDown} />
                  {showDropdown && (
                    <div className="nk-place-dropdown" ref={dropdownRef}>
                      {searching && <div className="nk-place-loading">Searching...</div>}
                      {!searching && placeResults.length === 0 && placeQuery.length >= 2 &&
                        <div className="nk-place-loading">No places found</div>}
                      {placeResults.map((p, i) => (
                        <div key={p.geoname_id || i} className={`nk-place-item ${i === activeIdx ? 'active' : ''}`}
                          onClick={() => selectPlace(p)}>
                          <span className="nk-place-name">{p.name}</span>
                          <span className="nk-place-sub">{[p.admin1, p.country].filter(Boolean).join(', ')}</span>
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

            <button 
              type="submit" 
              className="btn nk-submit" 
              disabled={loading || isLocked}
              style={{
                opacity: (loading || isLocked) ? 0.6 : 1,
                cursor: (loading || isLocked) ? 'not-allowed' : 'pointer',
                backgroundColor: isLocked ? '#666' : ''
              }}
            >
              {isLocked 
                ? `⏳ Wait ${timeLeft}s (API Resting)` 
                : loading 
                ? '✨ AI Calculating...' 
                : '✨ Generate Horoscope with AI'}
            </button>
          </form>
        </div>

        {loading && <LoadingSkeleton lines={10} title="✨ AI is generating your complete horoscope..." />}

        {result && (
          <div className="fh-result">
            <h3>✨ AI Horoscope Result</h3>
            
            <div className="fh-predictions">
              <PredictionCard title={result.predictions.weekday.title} description={result.predictions.weekday.description} 
                extra={`Ruling Planet: ${result.predictions.weekday.ruling_planet}`} isOpen={openSection === 'weekday'} onToggle={() => toggleSection('weekday')} />
              <PredictionCard title={result.predictions.nakshatra.title} description={result.predictions.nakshatra.description} 
                isOpen={openSection === 'nakshatra'} onToggle={() => toggleSection('nakshatra')} />
              <PredictionCard title={result.predictions.rasi.title} description={result.predictions.rasi.description} 
                isOpen={openSection === 'rasi'} onToggle={() => toggleSection('rasi')} />
              <PredictionCard title={result.predictions.tithi.title} description={result.predictions.tithi.description} 
                isOpen={openSection === 'tithi'} onToggle={() => toggleSection('tithi')} />
              <PredictionCard title={result.predictions.karana.title} description={result.predictions.karana.description} 
                isOpen={openSection === 'karana'} onToggle={() => toggleSection('karana')} />
              <PredictionCard title={result.predictions.yoga.title} description={result.predictions.yoga.description} 
                isOpen={openSection === 'yoga'} onToggle={() => toggleSection('yoga')} />
            </div>

            <div className="fh-birth-details">
              <h4>Birth Details</h4>
              <div className="fh-details-grid">
                <DetailRow label="Nakshatra" value={result.birth_details.nakshatra} />
                <DetailRow label="Weekday" value={result.birth_details.weekday} />
                <DetailRow label="Tithi" value={result.birth_details.tithi} />
                <DetailRow label="Yoga" value={result.birth_details.yoga} />
                <DetailRow label="Karana" value={result.birth_details.karana} />
                <DetailRow label="Vikram Samvat" value={result.birth_details.vikram_samvat} />
                <DetailRow label="Deity" value={result.birth_details.god} />
                <DetailRow label="Animal Sign" value={result.birth_details.animal_sign} />
                <DetailRow label="Rasi" value={result.birth_details.rasi} />
                <DetailRow label="Rasi Lord" value={result.birth_details.rasi_lord} />
                <DetailRow label="Ascendant" value={result.birth_details.ascendant} />
                <DetailRow label="Ascendant Lord" value={result.birth_details.ascendant_lord} />
                <DetailRow label="Ganam" value={result.birth_details.ganam} />
                <DetailRow label="Yoni" value={result.birth_details.yoni} />
                <DetailRow label="Gothram" value={result.birth_details.gothram} />
                <DetailRow label="Bhutham" value={result.birth_details.bhutham} />
                <DetailRow label="Sunrise" value={result.birth_details.sunrise} />
                <DetailRow label="Sunset" value={result.birth_details.sunset} />
              </div>
            </div>

            <div className="fh-technical">
              <h4>Technical Details</h4>
              <div className="fh-tech-grid">
                <span>Julian Day: {result.technical_details.julian_day}</span>
                <span>Moon Longitude: {result.technical_details.moon_longitude}°</span>
                <span>Moon Speed: {result.technical_details.moon_speed}°/day</span>
                <span>Ascendant Degree: {result.technical_details.ascendant_degree}°</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

const PredictionCard = ({ title, description, extra, isOpen, onToggle }) => (
  <div className={`fh-pred-card ${isOpen ? 'open' : ''}`}>
    <button className="fh-pred-header" onClick={onToggle}>
      <span>{title}</span>
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
      </svg>
    </button>
    {isOpen && (
      <div className="fh-pred-body">
        <p>{description}</p>
        {extra && <p className="fh-pred-extra">{extra}</p>}
      </div>
    )}
  </div>
)

const DetailRow = ({ label, value }) => (
  <div className="fh-detail-row">
    <span className="fh-detail-label">{label}:</span>
    <span className="fh-detail-value">{value}</span>
  </div>
)

export default FullHoroscopeAI
