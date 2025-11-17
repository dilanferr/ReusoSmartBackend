import React from 'react'

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-emerald-200 rounded-xl ${className}`}>{children}</div>
)

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-b border-emerald-100 ${className}`}>{children}</div>
)

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-emerald-700 ${className}`}>{children}</h3>
)

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-4 py-4 ${className}`}>{children}</div>
)

export default Card