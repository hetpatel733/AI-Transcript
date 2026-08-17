import React from 'react'

export default function LoadingSpinner(){
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-6 h-6 border-4 border-blue-400 border-dashed rounded-full animate-spin" />
    </div>
  )
}
