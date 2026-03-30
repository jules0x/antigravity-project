'use client'

import React, { useRef, useState } from 'react'
import './TiltCard.css'

interface TiltCardProps {
  children: React.ReactNode
  glowColor?: string
  className?: string
}

export const TiltCard: React.FC<TiltCardProps> = ({ children, glowColor = 'var(--color-primary)', className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Max rotation of 15 degrees
    const rotateX = ((y - centerY) / centerY) * -15
    const rotateY = ((x - centerX) / centerX) * 15

    setRotate({ x: rotateX, y: rotateY })
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
    setOpacity(0)
  }

  return (
    <div
      ref={cardRef}
      className={`tilt-card-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--rotate-x': `${rotate.x}deg`,
        '--rotate-y': `${rotate.y}deg`,
        '--glow-x': `${glowPos.x}%`,
        '--glow-y': `${glowPos.y}%`,
        '--glow-color': glowColor,
        '--glow-opacity': opacity,
      } as React.CSSProperties}
    >
      <div className="tilt-card-inner">
        <div className="tilt-card-glow" />
        <div className="tilt-card-content">
          {children}
        </div>
      </div>
    </div>
  )
}
