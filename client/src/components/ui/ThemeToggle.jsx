import React from 'react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle(){
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="theme-toggle">
      <button
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={isDark ? 'Light' : 'Dark'}
        className="toggle-button"
        data-mode={isDark ? 'dark' : 'light'}
        onClick={toggle}
      >
        <span className="icon icon-left" aria-hidden>
          <svg className="icon-sun" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M4.93 4.93l1.41 1.41" />
              <path d="M17.66 17.66l1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="M4.93 19.07l1.41-1.41" />
              <path d="M17.66 6.34l1.41-1.41" />
            </g>
          </svg>
        </span>

        <span className="icon icon-right" aria-hidden>
          <svg className="icon-moon" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
          </svg>
        </span>

        <span className="thumb" />
      </button>
    </div>
  )
}
