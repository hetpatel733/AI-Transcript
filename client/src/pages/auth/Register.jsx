import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { register, user } = useAuth()
  const navigate = useNavigate()

  if(user) navigate('/dashboard')

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError(null)
    if(!name) return setError('Name is required')
    if(!email) return setError('Email is required')
    if(!password) return setError('Password is required')
    if(password !== confirm) return setError('Passwords do not match')
    setSubmitting(true)
    const res = await register(name, email, password)
    setSubmitting(false)
    if(res.success) navigate('/dashboard')
    else setError(res.message || 'Registration failed')
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create account</h2>
      <form onSubmit={handleSubmit}>
        <Input label="Name" value={name} onChange={e=>setName(e.target.value)} />
        <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <Input label="Confirm Password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Register'}</Button>
      </form>
    </div>
  )
}
