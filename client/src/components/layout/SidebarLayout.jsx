import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'
import { useUi } from '../../context/UiContext'

export default function SidebarLayout(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [animating, setAnimating] = useState(false)

  useEffect(()=>{
    // trigger a brief enter animation when location changes
    setAnimating(true)
    const t = setTimeout(()=> setAnimating(false), 360)
    return ()=> clearTimeout(t)
  },[location.pathname])

  const isActive = (path)=> {
    if(path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const ui = useUi()
  const handleLogout = async ()=>{
    const ok = await ui.confirm('Are you sure you want to log out?')
    if(!ok) return
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b z-20">
        <div className="max-w-6xl mx-auto h-full flex items-center px-4">
          <div className="flex items-center" style={{width: '200px'}}>
            <Link to="/dashboard" className="text-lg font-semibold">AI Meeting Notes</Link>
          </div>

          <nav className="flex-1 flex items-center justify-center gap-2">
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/meetings" className={`nav-link ${isActive('/meetings') ? 'active' : ''}`}>Meetings</Link>
            <Link to="/actions" className={`nav-link ${isActive('/actions') ? 'active' : ''}`}>Action Tracker</Link>
          </nav>

          <div className="flex items-center justify-end" style={{width: '200px'}}>
            <div className="text-sm mr-3">{user?.name}</div>
            <ThemeToggle />
            <Button variant="danger" size="sm" onClick={handleLogout} className="ml-2">Logout</Button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <div className={`transition-wrapper ${animating ? 'page-enter' : ''}`}>
          <div className="max-w-6xl mx-auto p-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
