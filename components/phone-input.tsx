'use client'

import { useState, useEffect } from 'react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export default function PhoneInput({ 
  value, 
  onChange, 
  placeholder = '05XX XXX XX XX',
  required = false,
  className = ''
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    setDisplayValue(formatPhoneDisplay(value))
  }, [value])

  const formatPhoneDisplay = (phone: string) => {
    // Sadece rakamları al
    const numbers = phone.replace(/\D/g, '')
    
    // Format: 05XX XXX XX XX
    if (numbers.length <= 4) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 9)} ${numbers.slice(9, 11)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const numbers = input.replace(/\D/g, '')
    
    // Maksimum 11 rakam (05XXXXXXXXX)
    if (numbers.length <= 11) {
      onChange(numbers)
      setDisplayValue(formatPhoneDisplay(numbers))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace, Delete, Tab, Arrow tuşlarına izin ver
    if ([8, 9, 37, 38, 39, 40, 46].includes(e.keyCode)) {
      return
    }
    
    // Sadece rakam girişine izin ver
    if (e.key < '0' || e.key > '9') {
      e.preventDefault()
    }
  }

  return (
    <input
      type="tel"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      required={required}
      className={className}
      maxLength={15} // "05XX XXX XX XX" formatı için
    />
  )
}
