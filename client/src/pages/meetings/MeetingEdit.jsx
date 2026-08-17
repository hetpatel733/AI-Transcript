import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMeeting, updateMeeting } from '../../services/meetingApi'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function MeetingEdit(){
  const { meetingId } = useParams()
  const [meeting, setMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    let mounted = true
    getMeeting(meetingId).then(res=>{
      if(!mounted) return
      if(res.success) setMeeting(res.meeting)
      else setError(res.message)
    }).finally(()=> mounted && setLoading(false))
    return ()=> mounted = false
  },[meetingId])

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError(null)
    if(!meeting.title) return setError('Meeting title cannot be empty')
    setSubmitting(true)
    const body = { ...meeting, participants: meeting.participants }
    const res = await updateMeeting(meetingId, body)
    setSubmitting(false)
    if(res.success) navigate(`/meetings/${meetingId}`)
    else setError(res.message)
  }

  if(loading) return <LoadingSpinner />
  if(!meeting) return <div>Meeting not found</div>

  return (
    <div className="max-w-3xl bg-white rounded p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Meeting</h2>
      <form onSubmit={handleSubmit}>
        <Input label="Meeting Title *" value={meeting.title} onChange={e=>setMeeting({...meeting, title: e.target.value})} />
        <Input label="Meeting Date *" type="date" value={meeting.date} onChange={e=>setMeeting({...meeting, date: e.target.value})} />
        <Input label="Meeting Type" value={meeting.type} onChange={e=>setMeeting({...meeting, type: e.target.value})} />
        <Textarea label="Participants (comma separated)" value={(meeting.participants||[]).join(', ')} onChange={e=>setMeeting({...meeting, participants: e.target.value.split(',').map(s=>s.trim())})} />
        <Textarea label="Transcript" value={meeting.transcript} onChange={e=>setMeeting({...meeting, transcript: e.target.value})} />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save changes'}</Button>
      </form>
    </div>
  )
}
