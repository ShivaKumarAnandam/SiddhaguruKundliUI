import { useState, useEffect } from 'react'
import './HeroSlider.css'

const slides = [
  {
    text: "You are God indeed! Experiencing your divinity through meditation and samadhi is true spirituality."
  },
  {
    text: "True state of every being is Super Consciousness. Siddhaguru is one who has reached this state or the state of God beyond name and form."
  },
  {
    text: "Mind is a great obstacle in realizing the self. Switch the mind off with the grace of the Siddhaguru to realize 'You are God'."
  }
]

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <div className="slider-container">
      <div className="_slides">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`_slide ${index === currentSlide ? '-show' : ''}`}
            aria-hidden={index !== currentSlide}
          >
            <img src="/assets/img/main-banner-xl.jpg" alt="Siddhaguru" className="_banner" />
            <div className="container">
              <blockquote className="_content">
                <p>{slide.text}</p>
              </blockquote>
            </div>
          </div>
        ))}
      </div>
      <div className="_controls">
        {slides.map((_, index) => (
          <button 
            key={index}
            type="button" 
            data-index={index} 
            className={index === currentSlide ? '-showing' : ''}
            onClick={() => goToSlide(index)}
          >
            <span className="sr-only">Show slide {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default HeroSlider
