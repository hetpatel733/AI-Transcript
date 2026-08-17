import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard/Dashboard'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Meetings from './pages/meetings/Meetings'
import MeetingNew from './pages/meetings/MeetingNew'
import MeetingDetail from './pages/meetings/MeetingDetail'
import MeetingEdit from './pages/meetings/MeetingEdit'
import Actions from './pages/actions/Actions'
import { useAuth } from './context/AuthContext'
import SidebarLayout from './components/layout/SidebarLayout'

function PrivateRoute({ children }){
  const { user, loading } = useAuth()
  if(loading) return <div className="p-4">Loading...</div>
  if(!user) return <Navigate to="/login" replace />
  return children
}

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />

      <Route path="/" element={<PrivateRoute><SidebarLayout/></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace/>} />
        <Route path="dashboard" element={<Dashboard/>} />
        <Route path="meetings" >
          <Route index element={<Meetings/>} />
          <Route path="new" element={<MeetingNew/>} />
          <Route path=":meetingId" element={<MeetingDetail/>} />
          <Route path=":meetingId/edit" element={<MeetingEdit/>} />
        </Route>
        <Route path="actions" element={<Actions/>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace/>} />
    </Routes>
  )
}
