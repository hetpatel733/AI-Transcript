import React from 'react'
export default function Button({ children, className='', variant='primary', size='md', ...props }){
  const base = 'inline-flex items-center justify-center rounded font-medium'
  const sizeMap = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  const variantMap = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-100'
  }
  const classesArr = [base, sizeMap[size] || sizeMap.md, variantMap[variant] || variantMap.primary, className]
  const classes = classesArr.filter(Boolean).join(' ')
  return (
    <button className={classes} {...props}>{children}</button>
  )
}
