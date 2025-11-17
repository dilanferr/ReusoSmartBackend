import React, { createContext, useContext, useState } from 'react'

const TabsContext = createContext(null)

export const Tabs = ({ defaultValue, children, className = '' }) => {
  const [value, setValue] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ children, className = '' }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>{children}</div>
)

export const TabsTrigger = ({ value, children }) => {
  const ctx = useContext(TabsContext)
  const active = ctx?.value === value
  return (
    <button
      onClick={() => ctx?.setValue(value)}
      className={`${active ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700'} border border-emerald-300 px-3 py-2 rounded-lg`}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, children }) => {
  const ctx = useContext(TabsContext)
  if (ctx?.value !== value) return null
  return <div>{children}</div>
}

export default Tabs