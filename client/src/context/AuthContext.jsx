import React, { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../services/authApi'

const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    // try to fetch current user
    let mounted = true
    authApi.me().then(res=>{
      if(!mounted) return
      if(res && res.success){
        setUser(res.user)
      }
    }).catch(()=>{})
    .finally(()=>mounted && setLoading(false))
    return ()=> mounted = false
  },[])

  const login = async (email, password)=>{
    setLoading(true)
    try{
      const res = await authApi.login({ email, password })
      if(res && res.success){
        setUser(res.user)
        return { success: true }
      }
      return { success: false, message: res?.message }
    }catch(err){
      return { success: false, message: 'Network error' }
    }finally{setLoading(false)}
  }

  const register = async (name, email, password)=>{
    setLoading(true)
    try{
      const res = await authApi.register({ name, email, password })
      if(res && res.success){
        setUser(res.user)
        return { success: true }
      }
      return { success: false, message: res?.message }
    }catch(err){
      return { success: false, message: 'Network error' }
    }finally{setLoading(false)}
  }

  const logout = async ()=>{
    setLoading(true)
    try{
      await authApi.logout()
    }catch(e){}
    setUser(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{user, loading, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
