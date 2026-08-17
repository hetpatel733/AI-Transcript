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
  const [file, setFile] = useState(null)
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
    let res
    if(file){
      const form = new FormData()
      form.append('title', meeting.title)
      form.append('date', meeting.date)
      form.append('type', meeting.type)
      form.append('participants', JSON.stringify(meeting.participants))
      form.append('transcriptFile', file)
      if(meeting.transcript) form.append('transcript', meeting.transcript)
      res = await updateMeeting(meetingId, form)
    }else{
      const body = { ...meeting, participants: meeting.participants }
      res = await updateMeeting(meetingId, body)
    }
    setSubmitting(false)
    if(res.success) navigate(`/meetings/${meetingId}`)
    else setError(res.message)
  }

  const handleFile = (e) => {
    const f = e.target.files[0]
    if(!f) return
    const allowed = ['text/plain','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if(!allowed.includes(f.type)) return setError('Only txt, pdf and docx files are supported')
    setFile(f)
    if(f.type === 'text/plain'){
      const reader = new FileReader()
      reader.onload = () => setMeeting({...meeting, transcript: reader.result})
      reader.readAsText(f)
    }
  }

  if(loading) return <LoadingSpinner />
  if(!meeting) return <div>Meeting not found</div>

  return (
    <div className="max-w-3xl bg-white rounded p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Meeting</h2>
      <form onSubmit={handleSubmit}>
        <Input label="Meeting Title *" value={meeting.title} onChange={e=>setMeeting({...meeting, title: e.target.value})} />
        <Input label="Meeting Date *" type="date" value={meeting.date ? new Date(meeting.date).toISOString().slice(0,10) : ''} onChange={e=>setMeeting({...meeting, date: e.target.value})} />
        <Input label="Meeting Type" value={meeting.type} onChange={e=>setMeeting({...meeting, type: e.target.value})} />
        <Textarea label="Participants (comma separated)" value={(meeting.participants||[]).join(', ')} onChange={e=>setMeeting({...meeting, participants: e.target.value.split(',').map(s=>s.trim())})} />
        <Textarea label="Transcript" value={meeting.transcript} onChange={e=>setMeeting({...meeting, transcript: e.target.value})} />
        <input type="file" accept=".txt,.pdf,.docx" onChange={handleFile} className="mt-2" />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="mt-4">
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save changes'}</Button>
        </div>
      </form>
    </div>
  )
}
