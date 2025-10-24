'use client'

import { useState, useEffect } from 'react'

interface UseTypewriterOptions {
  text: string
  speed?: number // milliseconds per character
  delay?: number // delay before starting
  enabled?: boolean // whether to animate
}

export function useTypewriter({
  text,
  speed = 30,
  delay = 0,
  enabled = true
}: UseTypewriterOptions) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text)
      setIsComplete(true)
      return
    }

    setDisplayText('')
    setIsComplete(false)

    const startTimeout = setTimeout(() => {
      let currentIndex = 0

      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex))
          currentIndex++
        } else {
          setIsComplete(true)
          clearInterval(interval)
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [text, speed, delay, enabled])

  return { displayText, isComplete }
}
