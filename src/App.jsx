import { useState } from 'react'
import Header from './components/Header'
import HeroSlider from './components/HeroSlider'
import Intro from './components/Intro'
import AtAGlance from './components/AtAGlance'
import Footer from './components/Footer'
import NakshatraCalculator from './components/NakshatraCalculator'
import NakshatraCalculatorAI from './components/NakshatraCalculatorAI'
import FullHoroscope from './components/FullHoroscope'
import FullHoroscopeAI from './components/FullHoroscopeAI'
import GocharaChartAI from './components/GocharaChartAI'
import NameNakshatra from './components/NameNakshatra'
import './App.css'

function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="App">
      <Header onNavigate={setPage} />
      <main>
        {page === 'home' && (
          <>
            <HeroSlider />
            <Intro />
            <AtAGlance />
          </>
        )}
        {page === 'nakshatra' && (
          <NakshatraCalculator onBack={() => setPage('home')} />
        )}
        {page === 'nakshatra-ai' && (
          <NakshatraCalculatorAI onBack={() => setPage('home')} />
        )}
        {page === 'horoscope' && (
          <FullHoroscope onBack={() => setPage('home')} />
        )}
        {page === 'horoscope-ai' && (
          <FullHoroscopeAI onBack={() => setPage('home')} />
        )}
        {page === 'gochara-ai' && (
          <GocharaChartAI onBack={() => setPage('home')} />
        )}
        {page === 'name-nakshatra' && (
          <NameNakshatra onBack={() => setPage('home')} />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
