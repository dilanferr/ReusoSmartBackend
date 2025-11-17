import React from 'react'

export const Button = ({ children, className = '', onClick, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition ${className}`}
  >
    {children}
  </button>
)

export default Button