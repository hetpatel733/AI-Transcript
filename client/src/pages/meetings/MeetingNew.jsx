import React, { useState } from 'react'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import { createMeeting } from '../../services/meetingApi'
import { useNavigate } from 'react-router-dom'

const types = ["Client Meeting","Sales Meeting","Project Meeting","Internal Meeting","Requirement Discussion","Retrospective","Other"]

export default function MeetingNew(){
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('')
  const [participants, setParticipants] = useState('')
  const [transcript, setTranscript] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleFile = (e)=>{
    const f = e.target.files[0]
    if(!f) return
    // accept txt, pdf, docx
    const allowed = ['text/plain','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if(!allowed.includes(f.type)) return setError('Only txt, pdf and docx files are supported')
    setFile(f)
    // if it's a txt file, load into textbox for immediate preview
    if(f.type === 'text/plain'){
      const reader = new FileReader()
      reader.onload = () => setTranscript(reader.result)
      reader.readAsText(f)
    }
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError(null)
    if(!title) return setError('Meeting title cannot be empty')

    setSubmitting(true)
    let res
    if(file){
      const form = new FormData()
      form.append('title', title)
      if(date) form.append('date', date)
      if(type) form.append('type', type)
      if(participants) form.append('participants', JSON.stringify(participants.split(',').map(s=>s.trim())))
      form.append('transcriptFile', file)
      // include transcript textbox content as fallback/override
      if(transcript) form.append('transcript', transcript)
      res = await createMeeting(form)
    }else{
      const body = { title }
      if(date) body.date = date
      if(type) body.type = type
      if(transcript) body.transcript = transcript
      if(participants) body.participants = participants.split(',').map(s=>s.trim())
      res = await createMeeting(body)
    }
    setSubmitting(false)
    if(res.success){
      navigate('/meetings')
    }else{
      setError(res.message)
    }
  }

  return (
    <div className="max-w-3xl bg-white rounded p-6">
      <h2 className="text-xl font-semibold mb-4">Create Meeting</h2>
      <form onSubmit={handleSubmit}>
        <Input label="Meeting Title *" value={title} onChange={e=>setTitle(e.target.value)} />
        <Input label="Meeting Date" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <label className="block mb-3">
          <span className="block text-sm mb-1">Meeting Type</span>
          <select value={type} onChange={e=>setType(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Select a type</option>
            {types.map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <Textarea label="Participants (comma separated)" value={participants} onChange={e=>setParticipants(e.target.value)} />

        <div className="mb-3">
          <label className="block text-sm mb-1">Transcript (optional) — server will try to extract date, type, and participants</label>
          <Textarea value={transcript} onChange={e=>setTranscript(e.target.value)} />
          <input type="file" accept=".txt,.pdf,.docx" onChange={handleFile} className="mt-2" />
        </div>

        {error && <div className="text-red-600 mb-2">{error}</div>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Meeting'}</Button>
      </form>
    </div>
  )
}
