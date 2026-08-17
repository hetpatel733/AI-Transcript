import React, { useEffect, useState } from 'react'
import { listMeetings, deleteMeeting } from '../../services/meetingApi'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useUi } from '../../context/UiContext'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function Meetings(){
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  const fetch = ()=>{
    setLoading(true)
    listMeetings().then(res=>{
      if(res.success) setMeetings(res.meetings || [])
      else setError(res.message)
    }).catch(()=>setError('Could not load meetings')).finally(()=>setLoading(false))
  }

  useEffect(()=>{ fetch() },[])

  const ui = useUi()
  const handleDelete = async (id)=>{
    const ok = await ui.confirm('Are you sure? This action cannot be undone.')
    if(!ok) return
    await deleteMeeting(id)
    fetch()
  }

  const filtered = meetings.filter(m=> m.title.toLowerCase().includes(query.toLowerCase()))

  if(loading) return <LoadingSpinner />

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Meetings</h1>
        <Link to="/meetings/new"><Button variant="primary" size="md">Create meeting</Button></Link>
      </div>
      <input placeholder="Search by title" value={query} onChange={e=>setQuery(e.target.value)} className="mb-4 p-2 border rounded w-full" />
      {filtered.length === 0 ? (
        <div className="p-6 bg-white rounded shadow">No meetings found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m=> {
            const mid = m.id || m._id || (m._id && m._id.$oid) || ''
            return (
            <div key={mid} className="p-3 bg-white rounded shadow flex justify-between">
              <div>
                <div className="font-semibold">{m.title}</div>
                <div className="text-sm text-gray-500">{m.date ? (new Date(m.date).toISOString().slice(0,10)) : '—'} · {m.type || '—'}</div>
                <div className="text-sm">Participants: {(m.participants||[]).length ? (m.participants||[]).join(', ') : '—'}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/meetings/${mid}`}><Button variant="ghost" size="sm">View</Button></Link>
                <Link to={`/meetings/${mid}/edit`}><Button variant="secondary" size="sm">Edit</Button></Link>
                <Button variant="danger" size="sm" onClick={()=>handleDelete(mid)}>Delete</Button>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  )
}
