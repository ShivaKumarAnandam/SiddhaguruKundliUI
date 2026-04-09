import { useState, useRef, useEffect, useCallback } from 'react'
import './NakshatraCalculator.css'
import './GocharaChart.css'
import LoadingSkeleton from './LoadingSkeleton'
import { API_BASE } from '../apiConfig'

const GocharaSouthIndian = ({ onBack }) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
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
        if (placeQuery && !placeValidated) {
          setPlaceQuery('')
          setError('Please select a place from the dropdown suggestions')
        }
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [placeQuery, placeValidated])

  // Set current date and time on mount
  useEffect(() => {
    const now = new Date()
    setDate(now.toISOString().split('T')[0])
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    setTime(`${hours}:${minutes}:${seconds}`)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setResult(null)
    if (!date) { setError('Please enter date'); return }
    if (!time) { setError('Please enter time'); return }
    if (!placeQuery.trim()) { setError('Please enter place'); return }
    if (!placeValidated || !selectedPlace) { setError('Please select a place from the dropdown suggestions'); return }

    const body = {
      date,
      time,
      place: placeQuery,
      latitude: selectedPlace.lat,
      longitude: selectedPlace.lon,
      timezone: selectedPlace.timezone
    }

    setLoading(true)
    try {
      const resp = await fetch(`${API_BASE}/gochara/south-indian`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.detail || 'Calculation failed')
      setResult(data)
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  // Draw South Indian Chart
  const drawChart = (chartData, lagnaRashi) => {
    if (!chartData) return null

    // South Indian chart FUNDAMENTAL RASHI LAYOUT (fixed positions in grid)
    // These are the Rashi indices (0-11) at each grid position:
    // Row 1: 11(Meen), 0(Mesh), 1(Vrish), 2(Mith)
    // Row 2: 10(Kumb), [center], 3(Kark)
    // Row 3: 9(Maka), [center], 4(Simh)
    // Row 4: 8(Dhan), 7(Vrish), 6(Tula), 5(Kany)

    // Map house numbers to grid positions based on lagna_rashi
    // House 1 starts at lagna_rashi position
    const getHouseAtPosition = (rashiIndex) => {
      // Calculate which house this rashi corresponds to
      const house = ((rashiIndex - lagnaRashi + 12) % 12) + 1
      return { house, planets: chartData[house] || [] }
    }

    const renderCell = (rashiIndex) => {
      const { house, planets } = getHouseAtPosition(rashiIndex)
      // Remove "Lagna" from the planet list since house number indicates Lagna position
      const planetsWithoutLagna = planets.filter(p => p !== 'Lagna')
      // Rashi images are numbered 1-12, but rashiIndex is 0-11, so add 1
      const rashiImageNumber = rashiIndex + 1
      return (
        <div className="chart-cell">
          <span className="house-number">{house}</span>
          <img
            src={`/assets/img/rashi_${rashiImageNumber}.png`}
            alt={`Rashi ${rashiImageNumber}`}
            className="rashi-icon"
          />
          <div className="planet-content">
            {planetsWithoutLagna.map((planet, idx) => (
              <div key={idx}>{planet}</div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="south-indian-chart">
        <div className="chart-grid">
          {/* Row 1 */}
          {renderCell(11)}
          {renderCell(0)}
          {renderCell(1)}
          {renderCell(2)}

          {/* Row 2 */}
          {renderCell(10)}
          <div className="chart-cell chart-center-merged">
            <img src="/assets/img/Water mark logo_NEW (1).png" alt="Siddhaguru" className="chart-logo" />
          </div>
          {renderCell(3)}

          {/* Row 3 */}
          {renderCell(9)}
          {renderCell(4)}

          {/* Row 4 */}
          {renderCell(8)}
          {renderCell(7)}
          {renderCell(6)}
          {renderCell(5)}
        </div>
      </div>
    )
  }

  return (
    <section className="nk-calc">
      <div className="container">
        <button className="nk-back" onClick={onBack}>← Back</button>

        <div className="nk-card">
          <div className="nk-card-header fh-header">
            <h2>Gochara Chart - South Indian (Nirayana)</h2>
            <p>Current planetary transit positions in South Indian chart style using Lahiri Ayanamsha</p>
          </div>

          <form className="nk-form" onSubmit={handleSubmit}>
            <div className="nk-row">
              <div className="nk-field nk-field-full">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="nk-row">
              <div className="nk-field nk-field-full">
                <label>Time (HH:MM:SS)</label>
                <input
                  type="time"
                  step="1"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="nk-row">
              <div className="nk-field nk-field-full">
                <label>Place</label>
                <div className="nk-place-wrap">
                  <input
                    ref={inputRef}
                    type="text"
                    autoComplete="off"
                    placeholder="Type city or village name..."
                    value={placeQuery}
                    onChange={handlePlaceInput}
                    onKeyDown={handlePlaceKeyDown}
                  />
                  {showDropdown && (
                    <div className="nk-place-dropdown" ref={dropdownRef}>
                      {searching && <div className="nk-place-loading">Searching...</div>}
                      {!searching && placeResults.length === 0 && placeQuery.length >= 2 &&
                        <div className="nk-place-loading">No places found</div>}
                      {placeResults.map((p, i) => (
                        <div
                          key={p.geoname_id || i}
                          className={`nk-place-item ${i === activeIdx ? 'active' : ''}`}
                          onClick={() => selectPlace(p)}
                        >
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
              disabled={loading || !placeValidated}
              style={{
                opacity: (loading || !placeValidated) ? 0.6 : 1,
                cursor: (loading || !placeValidated) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Calculating...' : 'Generate Gochara Chart'}
            </button>
          </form>
        </div>

        {loading && <LoadingSkeleton lines={8} title="Calculating planetary positions..." />}

        {result && (
          <div className="gc-result">
            <h3>Gochara Chart Result</h3>
            <div className="gc-metadata">
              <p><strong>Place:</strong> {result.metadata.place}</p>
              <p><strong>Date:</strong> {result.metadata.date}</p>
              <p><strong>Time:</strong> {result.metadata.time}</p>
              <p><strong>Timezone:</strong> {result.metadata.timezone}</p>
              <p><strong>Julian Day:</strong> {result.metadata.julian_day.toFixed(6)}</p>
            </div>

            {/* South Indian Chart */}
            <div className="chart-container">
              <h4>South Indian – Nirayana Gochara Chart</h4>
              {drawChart(result.chart, result.chart.lagna_rashi)}
            </div>

            {/* Planets Table */}
            <div className="planets-table-container">
              <h4>Planetary Positions</h4>
              <div className="table-responsive">
                <table className="planets-table">
                  <thead>
                    <tr>
                      <th>Planet</th>
                      <th>Longitude</th>
                      <th>Nakshatra</th>
                      <th>Pada</th>
                      <th>Nakshatra Lord</th>
                      <th>Full Degree</th>
                      <th>House</th>
                      <th>Latitude</th>
                      <th>Speed (°/day)</th>
                      <th>RA</th>
                      <th>Dec</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.planets_table.map((planet, idx) => (
                      <tr key={idx}>
                        <td><strong>{planet.planet}</strong></td>
                        <td>{planet.longitude}</td>
                        <td>{planet.nakshatra}</td>
                        <td>{planet.pada}</td>
                        <td>{planet.nakshatra_lord}</td>
                        <td>{planet.full_degree}°</td>
                        <td>{planet.house || '—'}</td>
                        <td>{planet.latitude}°</td>
                        <td>{planet.speed_deg_per_day > 0 ? '+' : ''}{planet.speed_deg_per_day}</td>
                        <td>{planet.right_ascension}°</td>
                        <td>{planet.declination > 0 ? '+' : ''}{planet.declination}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default GocharaSouthIndian
