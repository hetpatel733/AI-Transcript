import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(()=>{ if(user) navigate('/dashboard') }, [user])

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    if(!email || !password){ setError('Email and password are required'); setSubmitting(false); return }
    const res = await login(email, password)
    setSubmitting(false)
    if(res.success) navigate('/dashboard')
    else setError(res.message || 'Invalid credentials')
  }

  const demoEmail = 'test@gmail.com'
  const demoPassword = 'Test@123'
  const handleAutoFill = ()=>{
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign In</h2>
      <div className="mb-4 p-4 rounded border flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">i</span>
            <strong>Try Demo Account</strong>
          </div>
          <div className="text-sm">Email: <span className="font-medium">{demoEmail}</span></div>
          <div className="text-sm">Password: <span className="font-medium">{demoPassword}</span></div>
        </div>
        <div>
          <Button variant="primary" size="sm" onClick={handleAutoFill}>Auto Fill</Button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Logging in...' : 'Login'}</Button>
      </form>
      <div className="mt-4 text-sm">Don't have an account? <Link to="/register" className="text-blue-600">Create account</Link></div>
    </div>
  )
}
