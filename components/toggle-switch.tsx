'use client'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'orange' | 'red'
}

export default function ToggleSwitch({ 
  checked, 
  onChange, 
  disabled = false, 
  size = 'md',
  color = 'blue'
}: ToggleSwitchProps) {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5',
    lg: 'w-12 h-6'
  }

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  const translateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-6' : 'translate-x-0.5'
  }

  const colorClasses = {
    blue: checked ? 'bg-blue-600' : 'bg-gray-300',
    green: checked ? 'bg-green-600' : 'bg-gray-300',
    orange: checked ? 'bg-orange-600' : 'bg-gray-300',
    red: checked ? 'bg-red-600' : 'bg-gray-300'
  }

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          ${thumbSizeClasses[size]}
          ${translateClasses[size]}
        `}
      />
    </button>
  )
}