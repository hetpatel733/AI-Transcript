import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getMeeting, analyzeMeeting, deleteMeeting } from '../../services/meetingApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function MeetingDetail(){
  const { meetingId } = useParams()
  const [meeting, setMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    getMeeting(meetingId).then(res=>{
      if(!mounted) return
      if(res.success) setMeeting(res.meeting)
      else setError(res.message)
    }).catch(()=>setError('Could not load meeting')).finally(()=> mounted && setLoading(false))
    return ()=> mounted = false
  },[meetingId])

  const handleAnalyze = async ()=>{
    setAnalyzing(true)
    const res = await analyzeMeeting(meetingId)
    setAnalyzing(false)
    if(res.success){
      setMeeting(prev => ({...prev, ...res.analysis, actionItems: res.actionItems || prev.actionItems}))
    }
  }

  const handleDelete = async ()=>{
    if(!confirm('Are you sure? This action cannot be undone.')) return
    await deleteMeeting(meetingId)
    navigate('/meetings')
  }

  if(loading) return <LoadingSpinner />
  if(error) return <div className="text-red-600">{error}</div>
  if(!meeting) return <div>No meeting found.</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">{meeting.title}</h1>
          <div className="text-sm text-gray-500">{meeting.date} · {meeting.type}</div>
          <div className="text-sm">Participants: {(meeting.participants||[]).join(', ')}</div>
        </div>
        <div className="flex gap-2">
          <Link to={`/meetings/${meetingId}/edit`} className="px-3 py-2 bg-gray-200 rounded">Edit</Link>
          <button onClick={handleDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
          <button onClick={handleAnalyze} disabled={analyzing} aria-busy={analyzing} className={`px-3 py-2 text-white rounded ${analyzing ? 'bg-blue-400 opacity-70 cursor-not-allowed' : 'bg-blue-600'}`}>{analyzing ? 'Generating...' : 'Generate AI Analysis'}</button>
        </div>
      </div>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold mb-2">AI Summary</h3>
          <div>{meeting.summary || 'No summary available'}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold mb-2">Key Discussion Points</h3>
          {(meeting.discussionPoints && meeting.discussionPoints.length>0) ? (
            <ul className="list-disc pl-5">
              {meeting.discussionPoints.map((d,i)=>(<li key={i}>{d}</li>))}
            </ul>
          ) : (<div>No discussion points identified.</div>)}
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold mb-2">Key Decisions</h3>
          {(meeting.decisions && meeting.decisions.length>0) ? (
            <ul className="list-disc pl-5">
              {meeting.decisions.map((d,i)=>(<li key={i}>{d}</li>))}
            </ul>
          ) : (<div>No clear decisions identified.</div>)}
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold mb-2">Risks & Concerns</h3>
          {(meeting.risks && meeting.risks.length>0) ? (
            <ul className="list-disc pl-5">{meeting.risks.map((r,i)=>(<li key={i}>{r}</li>))}</ul>
          ) : (<div>No major risks or concerns identified.</div>)}
        </div>

        <div className="p-4 bg-white rounded shadow md:col-span-2">
          <h3 className="font-semibold mb-2">Action Items</h3>
          {(meeting.actionItems && meeting.actionItems.length>0) ? (
            <div className="space-y-2">
              {meeting.actionItems.map(a=> (
                <div key={a.id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{a.task}</div>
                    <div className="text-sm text-gray-500">Owner: {a.owner || 'Unassigned'} · Due: {a.dueDate || 'Not specified'}</div>
                  </div>
                  <div className="text-sm">{a.status || 'Open'}</div>
                </div>
              ))}
            </div>
          ) : (<div>No action items</div>)}
        </div>

        <div className="p-4 bg-white rounded shadow md:col-span-2">
          <h3 className="font-semibold mb-2">Transcript</h3>
          <pre className="whitespace-pre-wrap">{meeting.transcript}</pre>
        </div>
      </section>
    </div>
  )
}
