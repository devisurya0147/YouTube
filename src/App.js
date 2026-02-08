import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ThreeScene from './components/ThreeScene'
import Terminal from './components/Terminal'
import styles from './styles/App.module.css'

const Home = () => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check if mobile view
  const isMobile = dimensions.width <= 768

  // Calculate dimensions based on ratios
  const headerHeight = Math.round(dimensions.height * 0.1211)
  const middleHeight = isMobile ? 'auto' : Math.round(dimensions.height * 0.8330)
  const footerHeight = Math.round(dimensions.height * 0.0461)

  const leftWidth = isMobile ? 0 : Math.round(dimensions.width * 0.3995 - 0.25)
  const rightWidth = isMobile ? dimensions.width : Math.round(dimensions.width * 0.60 - 0.25)

  const dynamicStyles = {
    app: {
      width: `${dimensions.width}px`,
      height: isMobile ? 'auto' : `${dimensions.height}px`,
      minHeight: isMobile ? '100vh' : undefined,
    },
    header: {
      height: isMobile ? 'auto' : `${headerHeight}px`,
      width: `${dimensions.width}px`,
    },
    content: {
      height: isMobile ? 'auto' : `${middleHeight}px`,
      width: `${dimensions.width}px`,
      minHeight: isMobile ? 'calc(100vh - 120px)' : undefined,
    },
    left_panel: {
      width: `${leftWidth}px`,
      height: isMobile ? 0 : `${middleHeight}px`,
      display: isMobile ? 'none' : 'block',
    },
    right_panel: {
      width: `${rightWidth}px`,
      height: isMobile ? 'auto' : `${middleHeight}px`,
      minHeight: isMobile ? 'calc(100vh - 120px)' : undefined,
    },
    footer: {
      height: isMobile ? 'auto' : `${footerHeight}px`,
      width: `${dimensions.width}px`,
    },
  }

  return (
    <div className={styles.app} style={dynamicStyles.app}>
      <Header style={dynamicStyles.header} />
      <div className={styles.content} style={dynamicStyles.content}>
        <div className={styles.left_panel} style={dynamicStyles.left_panel}>
          <ThreeScene />
          <div className={styles.idCardLabel}>[Interactive Id Card]</div>
        </div>
        <div className={styles.right_panel} style={dynamicStyles.right_panel}>
          <Terminal />
        </div>
      </div>
      <Footer style={dynamicStyles.footer} />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App