import React from 'react'
import Link from 'next/link'

interface LogoProps {
  variant?: 'icon' | 'full'
  className?: string
}

export function Logo({ variant = 'full', className = '' }: LogoProps) {
  const iconSize = variant === 'icon' ? 'h-8 w-8' : 'h-10 w-10'
  
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <div className={`${iconSize} flex-shrink-0`}>
        <svg 
          className="w-full h-full" 
          viewBox="0 0 280 280" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3B82F6' }}/>
              <stop offset="50%" style={{ stopColor: '#8B5CF6' }}/>
              <stop offset="100%" style={{ stopColor: '#10B981' }}/>
            </linearGradient>
            <linearGradient id="nodeGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3B82F6' }}/>
              <stop offset="100%" style={{ stopColor: '#1E40AF' }}/>
            </linearGradient>
            <linearGradient id="nodeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#8B5CF6' }}/>
              <stop offset="100%" style={{ stopColor: '#7C3AED' }}/>
            </linearGradient>
            <linearGradient id="nodeGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#10B981' }}/>
              <stop offset="100%" style={{ stopColor: '#059669' }}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Conexões entre nós */}
          <g opacity="0.7">
            <path d="M140,60 L200,120" stroke="url(#primaryGradient)" strokeWidth="2" fill="none"/>
            <path d="M200,120 L200,200" stroke="url(#primaryGradient)" strokeWidth="2" fill="none"/>
            <path d="M200,200 L140,240" stroke="url(#primaryGradient)" strokeWidth="2" fill="none"/>
            <path d="M140,240 L80,200" stroke="url(#primaryGradient)" strokeWidth="2" fill="none"/>
            <path d="M80,200 L80,120" stroke="url(#primaryGradient)" strokeWidth="2" fill="none"/>
            <path d="M80,120 L140,60" stroke="url(#primaryGradient)" strokeWidth="2" fill="none"/>
            
            {/* Conexões internas */}
            <path d="M140,140 L140,60" stroke="url(#primaryGradient)" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <path d="M140,140 L200,120" stroke="url(#primaryGradient)" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <path d="M140,140 L200,200" stroke="url(#primaryGradient)" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <path d="M140,140 L140,240" stroke="url(#primaryGradient)" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <path d="M140,140 L80,200" stroke="url(#primaryGradient)" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <path d="M140,140 L80,120" stroke="url(#primaryGradient)" strokeWidth="1.5" fill="none" opacity="0.5"/>
          </g>
          
          {/* Nós especializados */}
          <circle cx="140" cy="60" r="16" fill="url(#nodeGradient1)" filter="url(#glow)"/>
          <circle cx="200" cy="120" r="14" fill="url(#nodeGradient2)" filter="url(#glow)"/>
          <circle cx="200" cy="200" r="14" fill="url(#nodeGradient3)" filter="url(#glow)"/>
          <circle cx="140" cy="240" r="14" fill="url(#nodeGradient1)" filter="url(#glow)"/>
          <circle cx="80" cy="200" r="14" fill="url(#nodeGradient2)" filter="url(#glow)"/>
          <circle cx="80" cy="120" r="14" fill="url(#nodeGradient3)" filter="url(#glow)"/>
          
          {/* Nó central */}
          <circle cx="140" cy="140" r="20" fill="url(#primaryGradient)" filter="url(#glow)"/>
        </svg>
      </div>
      
      {variant === 'full' && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
            Agno
          </span>
          <span className="text-xs text-muted-foreground -mt-1">
            Multi-Agent Platform
          </span>
        </div>
      )}
    </Link>
  )
}
