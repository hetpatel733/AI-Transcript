import React from 'react'

export default function Input({ label, id, ...props }){
  return (
    <label className="block mb-3">
      {label && <span className="block text-sm mb-1">{label}</span>}
      <input id={id} className="w-full p-2 border rounded" {...props} />
    </label>
  )
}
