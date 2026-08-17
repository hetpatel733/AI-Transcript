import React, { useState } from 'react'
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

  if(user) navigate('/dashboard')

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

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
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
