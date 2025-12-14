'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  description?: string
  backUrl?: string
  backLabel?: string
  actions?: ReactNode
  children?: ReactNode
}

export default function AdminHeader({ 
  title, 
  description, 
  backUrl, 
  backLabel = 'Geri', 
  actions,
  children 
}: AdminHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Breadcrumb */}
      {backUrl && (
        <div className="mb-4">
          <Link 
            href={backUrl}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm font-medium"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Additional content */}
      {children && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  )
}

// Standart action button'lar için helper component'ler
export function AdminHeaderButton({ 
  href, 
  onClick,
  children, 
  variant = 'primary',
  icon: Icon
}: { 
  href?: string
  onClick?: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary'
  icon?: any
}) {
  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition"
  const variantClasses = variant === 'primary' 
    ? "bg-gray-900 text-white hover:bg-black" 
    : "border border-gray-300 text-gray-700 hover:bg-gray-50"

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${variantClasses}`}>
        {Icon && <Icon size={16} />}
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}