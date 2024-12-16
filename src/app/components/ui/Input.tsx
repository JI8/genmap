'use client'

import { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  rightElement?: ReactNode
  error?: string
}

export function Input({
  className,
  icon,
  rightElement,
  error,
  ...props
}: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'w-full bg-gray-50 text-gray-900 rounded-lg border border-gray-200',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          icon && 'pl-10',
          rightElement && 'pr-24',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-200',
          className
        )}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 