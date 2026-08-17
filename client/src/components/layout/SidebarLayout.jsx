import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

export default function SidebarLayout(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async ()=>{
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r p-4 hidden md:block fixed top-0 left-0 h-full">
        <div className="mb-6">
          <Link to="/dashboard" className="text-lg font-semibold">AI Meeting Notes</Link>
        </div>
        <nav className="space-y-2">
          <Link to="/dashboard" className="block py-2">Dashboard</Link>
          <Link to="/meetings" className="block py-2">Meetings</Link>
          <Link to="/actions" className="block py-2">Action Tracker</Link>
        </nav>
        <div className="mt-auto pt-6">
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="text-sm mb-2">{user?.name}</div>
          <Button variant="danger" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </aside>

      <div className="flex-1 p-4 md:ml-64">
        <Outlet />
      </div>
    </div>
  )
}
