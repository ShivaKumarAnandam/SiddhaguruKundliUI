import { useState, useRef } from 'react'
import './Header.css'

const Header = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const menuRef = useRef(null)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSubmenu = (menu, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    // Get the clicked button's position before state change
    const clickedButton = event?.currentTarget
    const buttonTop = clickedButton?.getBoundingClientRect().top || 0
    
    setOpenSubmenu(openSubmenu === menu ? null : menu)
    
    // Prevent any scroll adjustment
    requestAnimationFrame(() => {
      if (menuRef.current && clickedButton) {
        const newButtonTop = clickedButton.getBoundingClientRect().top
        const scrollDiff = newButtonTop - buttonTop
        if (scrollDiff !== 0) {
          menuRef.current.scrollTop -= scrollDiff
        }
      }
    })
  }

  return (
    <header className="global-header">

      <div className="container">
        <div className="_logo-and-nav text-right">
          <a href="#" className="_logo-link" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }}>
            <img src="/assets/img/logo.png" width="84" height="62" alt="Siddhaguru" />
          </a>
          <nav className="global-nav text-left" id="globalnav">
            <button 
              type="button" 
              aria-expanded={isMenuOpen} 
              aria-controls="mainnav" 
              id="mainnavtrigger"
              onClick={toggleMenu}
            >
              <span className="sr-only">Site navigation</span>
              {!isMenuOpen ? (
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="hamburger">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="close">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                </svg>
              )}
            </button>
            <div id="mainnav" className={isMenuOpen ? '-open' : ''} ref={menuRef}>
              <div className="_mobile-menu-header">
                <a href="#" className="_logo-link" onClick={(e) => { e.preventDefault(); onNavigate?.('home'); setIsMenuOpen(false) }}>
                  <img src="/assets/img/logo.png" width="84" height="62" alt="Siddhaguru" />
                </a>
              </div>
              <div className="_menu-scroll-container">
              <ul className="_primary-menu">
                <li className={`_lvl-1-li -has-submenu ${openSubmenu === 'siddhaguru' ? '-active' : ''}`}>
                  <button 
                    type="button" 
                    className="_submenu-trigger _lvl-1-a" 
                    aria-expanded={openSubmenu === 'siddhaguru'}
                    onClick={(e) => toggleSubmenu('siddhaguru', e)}
                  >
                    Siddhaguru
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                    </svg>
                  </button>
                  <ul className={`_submenu ${openSubmenu === 'siddhaguru' ? '-open' : ''}`}>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>About Siddhaguru</button></li>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Shaktipat</button></li>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Discourses</button></li>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Siddhaguru's Aura</button></li>
                    <li className="_lvl-2-li">
                      <button className="_lvl-2-a _kundli-link" onClick={() => { onNavigate?.('name-nakshatra'); setIsMenuOpen(false); setOpenSubmenu(null) }}>
                        Rashi & Nakshatra from Name
                      </button>
                    </li>
                    <li className="_lvl-2-li">
                      <button className="_lvl-2-a _kundli-link" onClick={() => { onNavigate?.('nakshatra'); setIsMenuOpen(false); setOpenSubmenu(null) }}>
                        Rashi & Nakshatra
                      </button>
                    </li>
                    <li className="_lvl-2-li">
                      <button className="_lvl-2-a _kundli-link" onClick={() => { onNavigate?.('horoscope'); setIsMenuOpen(false); setOpenSubmenu(null) }}>
                        Kundli / Horoscope
                      </button>
                    </li>
                    <li className="_lvl-2-li">
                      <button className="_lvl-2-a _kundli-link" onClick={() => { onNavigate?.('nakshatra-ai'); setIsMenuOpen(false); setOpenSubmenu(null) }}>
                        Rashi & Nakshatra By Gemini AI ✨
                      </button>
                    </li>
                    <li className="_lvl-2-li">
                      <button className="_lvl-2-a _kundli-link" onClick={() => { onNavigate?.('horoscope-ai'); setIsMenuOpen(false); setOpenSubmenu(null) }}>
                        Kundli / Horoscope By Gemini AI ✨
                      </button>
                    </li>
                    <li className="_lvl-2-li">
                      <button className="_lvl-2-a _kundli-link" onClick={() => { onNavigate?.('gochara-ai'); setIsMenuOpen(false); setOpenSubmenu(null) }}>
                        Gochara By Gemini AI ✨
                      </button>
                    </li>
                    <li className="_lvl-2-li">
                      <button className="_lvl-2-a _kundli-link" onClick={() => { onNavigate?.('gochara-south-indian'); setIsMenuOpen(false); setOpenSubmenu(null) }}>
                        Gochara Chart - South Indian (Nirayana)
                      </button>
                    </li>
                  </ul>
                </li>
                <li className={`_lvl-1-li -has-submenu ${openSubmenu === 'wisdom' ? '-active' : ''}`}>
                  <button 
                    className="_lvl-1-a _submenu-trigger" 
                    type="button" 
                    aria-expanded={openSubmenu === 'wisdom'}
                    onClick={(e) => toggleSubmenu('wisdom', e)}
                  >
                    Wisdom
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                    </svg>
                  </button>
                  <ul className={`_submenu ${openSubmenu === 'wisdom' ? '-open' : ''}`}>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Books</button></li>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Songs</button></li>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Stotras</button></li>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Downloads</button></li>
                  </ul>
                </li>
                <li className={`_lvl-1-li -has-submenu ${openSubmenu === 'mahapeetam' ? '-active' : ''}`}>
                  <button 
                    className="_lvl-1-a _submenu-trigger" 
                    type="button" 
                    aria-expanded={openSubmenu === 'mahapeetam'}
                    onClick={(e) => toggleSubmenu('mahapeetam', e)}
                  >
                    Mahapeetam
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                    </svg>
                  </button>
                  <ul className={`_submenu ${openSubmenu === 'mahapeetam' ? '-open' : ''}`}>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Ramaneswaram</button></li>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Golden Siva Lingam Temple</button></li>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Dasa Mahavidya Temple</button></li>
                  </ul>
                </li>
                <li className={`_lvl-1-li -has-submenu ${openSubmenu === 'projects' ? '-active' : ''}`}>
                  <button 
                    className="_lvl-1-a _submenu-trigger" 
                    type="button" 
                    aria-expanded={openSubmenu === 'projects'}
                    onClick={(e) => toggleSubmenu('projects', e)}
                  >
                    Ongoing Projects
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                    </svg>
                  </button>
                  <ul className={`_submenu ${openSubmenu === 'projects' ? '-open' : ''}`}>
                    <li className="_lvl-2-li"><button className="_lvl-2-a" onClick={(e) => e.preventDefault()}>Shiva Shakti Sai Temple</button></li>
                  </ul>
                </li>
              </ul>
              <div className="_secondary-menu-container">
                <button 
                  type="button" 
                  className="_lvl-1-a _secondary-menu-trigger" 
                  aria-expanded={openSubmenu === 'more'}
                  onClick={(e) => toggleSubmenu('more', e)}
                >
                  More
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                  </svg>
                </button>
                <ul className={`_secondary-menu ${openSubmenu === 'more' ? '-open' : ''}`}>
                  <li className="_lvl-1-li"><button className="_lvl-1-a" onClick={(e) => e.preventDefault()}>Events</button></li>
                  <li className="_lvl-1-li"><button className="_lvl-1-a" onClick={(e) => e.preventDefault()}>Donate</button></li>
                  <li className="_lvl-1-li"><button className="_lvl-1-a" onClick={(e) => e.preventDefault()}>Articles</button></li>
                  <li className="_lvl-1-li"><button className="_lvl-1-a" onClick={(e) => e.preventDefault()}>Contact Us</button></li>
                </ul>
              </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
