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

  // Calculate dimensions based on ratios
  const headerHeight = Math.round(dimensions.height * 0.1211)
  const middleHeight = Math.round(dimensions.height * 0.8330)
  const footerHeight = Math.round(dimensions.height * 0.0461)

  const leftWidth = Math.round(dimensions.width * 0.3995 - 0.25)
  const rightWidth = Math.round(dimensions.width * 0.60 - 0.25)

  const dynamicStyles = {
    app: {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
    },
    header: {
      height: `${headerHeight}px`,
      width: `${dimensions.width}px`,
    },
    content: {
      height: `${middleHeight}px`,
      width: `${dimensions.width}px`,
    },
    left_panel: {
      width: `${leftWidth}px`,
      height: `${middleHeight}px`,
    },
    right_panel: {
      width: `${rightWidth}px`,
      height: `${middleHeight}px`,
    },
    footer: {
      height: `${footerHeight}px`,
      width: `${dimensions.width}px`,
    },
  }

  return (
    <div className={styles.app} style={dynamicStyles.app}>
      <Header style={dynamicStyles.header} />
      <div className={styles.content} style={dynamicStyles.content}>
        <div className={styles.left_panel} style={dynamicStyles.left_panel}>
          <ThreeScene />
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