import React, { useEffect, useState } from 'react'
import { listActions, deleteAction, updateAction } from '../../services/actionApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Button from '../../components/ui/Button'
import { useUi } from '../../context/UiContext'

export default function Actions(){
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ task: '', owner: '', dueDate: '', priority: 'Medium', status: 'Open' })
  const [processingId, setProcessingId] = useState(null)
  const ui = useUi()

  const fetch = ()=>{
    setLoading(true)
    listActions().then(res=>{
      if(res.success) setActions(res.actionItems || [])
      else setError(res.message)
    }).catch(()=>setError('Could not load actions')).finally(()=>setLoading(false))
  }

  useEffect(()=>{ fetch() },[])

  const handleDelete = async (id)=>{
    const ok = await ui.confirm('Delete this action item?')
    if(!ok) return
    try{
      setProcessingId(id)
      const res = await deleteAction(id)
      setProcessingId(null)
      if(res.success) fetch()
      else ui.toast(res.message || 'Could not delete action')
    }catch(e){
      setProcessingId(null)
      ui.toast('Could not delete action')
    }
  }
  const startEdit = (a) => {
    setEditingId(a.id)
    setEditValues({ task: a.task || '', owner: a.owner || '', dueDate: a.dueDate || '', priority: a.priority || 'Medium', status: a.status || 'Open' })
  }

  const cancelEdit = ()=>{
    setEditingId(null)
    setEditValues({ task: '', owner: '', dueDate: '', priority: 'Medium', status: 'Open' })
  }

  const saveEdit = async (id)=>{
    const body = { task: editValues.task, owner: editValues.owner, dueDate: editValues.dueDate || null, priority: editValues.priority, status: editValues.status }
    const res = await updateAction(id, body)
    if(res.success){
      cancelEdit()
      fetch()
    }else{
      ui.toast(res.message || 'Could not update action')
    }
  }

  const handleDone = async (id) => {
    const ok = await ui.confirm('Mark this action as completed?')
    if(!ok) return
    try{
      setProcessingId(id)
      const res = await updateAction(id, { status: 'Completed' })
      setProcessingId(null)
      if(res.success) fetch()
      else ui.toast(res.message || 'Could not mark action as completed')
    }catch(e){
      setProcessingId(null)
      ui.toast('Could not mark action as completed')
    }
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
            <div key={a.id} className="p-3 bg-white rounded shadow">
              {editingId === a.id ? (
                <div>
                  <input className="w-full p-2 border rounded mb-2" value={editValues.task} onChange={e=>setEditValues(v=>({...v, task: e.target.value}))} />
                  <div className="flex gap-2 mb-2">
                    <input className="flex-1 p-2 border rounded" value={editValues.owner} onChange={e=>setEditValues(v=>({...v, owner: e.target.value}))} placeholder="Owner" />
                    <input type="date" className="p-2 border rounded" value={editValues.dueDate || ''} onChange={e=>setEditValues(v=>({...v, dueDate: e.target.value}))} />
                  </div>
                  <div className="flex gap-2 items-center mb-2">
                    <label className="text-sm">Priority:</label>
                    <select value={editValues.priority} onChange={e=>setEditValues(v=>({...v, priority: e.target.value}))} className="p-2 border rounded">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                    <label className="text-sm">Status:</label>
                    <select value={editValues.status} onChange={e=>setEditValues(v=>({...v, status: e.target.value}))} className="p-2 border rounded">
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Blocked</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={()=>saveEdit(a.id)}>Save</Button>
                    <Button variant="secondary" size="sm" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{a.task}</div>
                    <div className="text-sm text-gray-500">Meeting: {a.meetingId || '—'} · Owner: {a.owner || 'Unassigned'} · Due: {a.dueDate || 'Not specified'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.status === 'Completed' ? (
                      <Button variant="secondary" size="sm" disabled>Completed</Button>
                    ) : (
                      <Button variant="success" size="sm" onClick={()=>handleDone(a.id)} disabled={processingId===a.id}>{processingId===a.id ? 'Working...' : 'Done'}</Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={()=>startEdit(a)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={()=>handleDelete(a.id)}>Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
