import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function SidebarLayout(){
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async ()=>{
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r p-4 hidden md:block">
        <div className="mb-6">
          <Link to="/dashboard" className="text-lg font-semibold">AI Meeting Notes</Link>
        </div>
        <nav className="space-y-2">
          <Link to="/dashboard" className="block py-2">Dashboard</Link>
          <Link to="/meetings" className="block py-2">Meetings</Link>
          <Link to="/actions" className="block py-2">Action Tracker</Link>
        </nav>
        <div className="mt-auto pt-6">
          <button onClick={toggle} className="text-sm py-2">Theme: {theme}</button>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="text-sm">{user?.name}</div>
          <button onClick={handleLogout} className="text-sm text-red-600">Logout</button>
        </div>
      </aside>

      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  )
}
