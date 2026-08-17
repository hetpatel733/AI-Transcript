import React, { useEffect, useState } from 'react'
import { listActions, deleteAction } from '../../services/actionApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function Actions(){
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  const fetch = ()=>{
    setLoading(true)
    listActions().then(res=>{
      if(res.success) setActions(res.actionItems || [])
      else setError(res.message)
    }).catch(()=>setError('Could not load actions')).finally(()=>setLoading(false))
  }

  useEffect(()=>{ fetch() },[])

  const handleDelete = async (id)=>{
    if(!confirm('Are you sure? This action cannot be undone.')) return
    await deleteAction(id)
    fetch()
  }

  const filtered = actions.filter(a=> a.task.toLowerCase().includes(query.toLowerCase()))

  if(loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Action Tracker</h1>
      </div>
      <input placeholder="Search tasks" value={query} onChange={e=>setQuery(e.target.value)} className="mb-4 p-2 border rounded w-full" />

      {filtered.length === 0 ? (
        <div className="p-6 bg-white rounded shadow">No action items found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a=> (
            <div key={a.id} className="p-3 bg-white rounded shadow flex justify-between">
              <div>
                <div className="font-semibold">{a.task}</div>
                <div className="text-sm text-gray-500">Meeting: {a.meetingId || '—'} · Owner: {a.owner || 'Unassigned'} · Due: {a.dueDate || 'Not specified'}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-sm">Edit</button>
                <button className="text-sm text-red-600" onClick={()=>handleDelete(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
