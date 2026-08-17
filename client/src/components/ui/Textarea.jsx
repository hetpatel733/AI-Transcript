import React from 'react'

export default function Textarea({ label, id, ...props }){
  return (
    <label className="block mb-3">
      {label && <span className="block text-sm mb-1">{label}</span>}
      <textarea id={id} className="w-full p-2 border rounded min-h-[140px]" {...props} />
    </label>
  )
}
