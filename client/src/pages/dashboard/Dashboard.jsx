import React, { useEffect, useState } from 'react'
import { getDashboard } from '../../services/dashboardApi'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function Dashboard(){
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    getDashboard().then(res=>{
      if(!mounted) return
      if(res.success){
        setStats(res.stats || {})
        setRecent(res.recentMeetings || [])
      }else{
        setError(res.message)
      }
    }).catch(()=> setError('Could not load dashboard')).finally(()=> mounted && setLoading(false))
    return ()=> mounted = false
  },[])

  if(loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">Total Meetings<br/><strong>{stats?.totalMeetings ?? '—'}</strong></div>
        <div className="p-4 bg-white rounded shadow">Total Action Items<br/><strong>{stats?.totalActionItems ?? '—'}</strong></div>
        <div className="p-4 bg-white rounded shadow">Open Action Items<br/><strong>{stats?.openActionItems ?? '—'}</strong></div>
        <div className="p-4 bg-white rounded shadow">Overdue Action Items<br/><strong>{stats?.overdueActionItems ?? '—'}</strong></div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Recently Created Meetings</h2>
          <Link to="/meetings" className="text-sm text-blue-600">View all meetings</Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-6 bg-white rounded shadow">No meetings yet. Create your first meeting to start extracting AI-powered insights.</div>
        ) : (
          <div className="space-y-2">
            {recent.map(m=> (
              <div key={m.id} className="p-3 bg-white rounded shadow flex justify-between">
                <div>
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-sm text-gray-500">{m.date} · {m.type}</div>
                </div>
                <div className="text-sm">{(m.actionItems || []).length} actions</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
