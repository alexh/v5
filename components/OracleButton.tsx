import { type ReactNode } from 'react'

interface OracleButtonProps {
  onClick?: () => void
  href?: string
  children: ReactNode
  color: string
  variant?: 'outline' | 'solid'
}

export default function OracleButton({ 
  onClick, 
  href, 
  children, 
  color,
  variant = 'outline'
}: OracleButtonProps) {

  const buttonClasses = `
    transition-all duration-200
    hover:scale-105
    relative
    px-4 py-1
    ${variant === 'solid' ? `
      before:content-[''] before:absolute before:inset-0
      before:bg-current before:opacity-10
      before:transition-opacity before:duration-200
      hover:before:opacity-20
    ` : ''}
    after:content-[''] after:absolute after:inset-0
    after:border after:border-current after:opacity-50
    after:transition-all after:duration-200
    hover:after:scale-105 hover:after:opacity-100
    after:shadow-[0_0_15px_rgba(0,0,0,0.3)]
    hover:after:shadow-[0_0_20px_rgba(0,0,0,0.4)]
  `

  const content = (
    <div 
      className={buttonClasses} 
      style={{ 
        color: color || 'inherit',
        textShadow: `0 0 5px ${color}40`,
        fontFamily: "receipt-narrow, sans-serif",
        fontSize: "1.25rem"
      }}
    >
      {children}
    </div>
  )

  const buttonProps = {
    style: { color },
    className: 'contents'
  }

  if (href) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        {...buttonProps}
      >
        {content}
      </a>
    )
  }

  return (
    <button 
      onClick={onClick}
      {...buttonProps}
    >
      {content}
    </button>
  )
} 