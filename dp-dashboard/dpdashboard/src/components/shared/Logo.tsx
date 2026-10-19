import React from 'react'

interface LogoProps {
  collapsed?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** `white` for dark backgrounds */
  variant?: 'default' | 'white'
}

export function Logo({ collapsed = false, className = '', size = 'md', variant = 'default' }: LogoProps) {
  const isWhite = variant === 'white'
  const src = `${import.meta.env.BASE_URL}${isWhite ? 'logo-white.png' : 'logo.png'}`

  const imageStyles = {
    sm: { width: '36px', height: '26px' },
    md: { width: '46px', height: '33px' },
    lg: { width: '56px', height: '40px' },
  }

  const arStyles = {
    sm: { fontSize: '16px' },
    md: { fontSize: '20px' },
    lg: { fontSize: '26px' },
  }

  const enStyles = {
    sm: { fontSize: '9px' },
    md: { fontSize: '10px' },
    lg: { fontSize: '12px' },
  }

  if (collapsed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={src}
          alt="Al Wathiqa"
          style={{ width: imageStyles[size].width, height: imageStyles[size].height, objectFit: 'contain' }}
          className="shrink-0 animate-fade-in"
        />
      </div>
    )
  }

  return (
    <div
      className={`select-none animate-fade-in ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}
      dir="ltr"
    >
      <img
        src={src}
        alt="Al Wathiqa Icon"
        style={{
          width: imageStyles[size].width,
          height: imageStyles[size].height,
          objectFit: 'contain',
          flexShrink: 0
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <span
          className="dark:text-white font-bold"
          style={{
            color: isWhite ? '#FFFFFF' : '#1F2354',
            fontSize: arStyles[size].fontSize,
            fontWeight: 800,
            lineHeight: 1.15,
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            letterSpacing: '0px',
          }}
        >
          الوثيقة
        </span>
        <span
          className="dark:text-blue-400 font-semibold"
          style={{
            color: isWhite ? '#9CA7E5' : '#5C66AF',
            fontSize: enStyles[size].fontSize,
            fontWeight: 700,
            letterSpacing: '0.4px',
            lineHeight: 1.2,
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            marginTop: '1px'
          }}
        >
          Al Wathiqa
        </span>
      </div>
    </div>
  )
}
