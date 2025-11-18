import React, { useEffect, useState } from 'react'
import styles from '../styles/App.module.css'

const Footer = ({ style }) => {
  const [dateTime, setDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={styles.footer} style={style}>
      <span>surya@portfolio:~$</span>
      {dateTime.toLocaleString()}
    </div>
  )
}

export default Footer