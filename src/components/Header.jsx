import React from "react";
import styles from '../styles/Header.module.css';

export default function Header({ style }) {
  return (
    <header className={styles.header} style={style}>
      <h1>Surya Teja Devi</h1>
      <p>Developer & Cyber Security Engineer</p>
    </header>
  );
}
