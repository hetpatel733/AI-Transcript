import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import Button from '../components/ui/Button'

const UiContext = createContext()

export function UiProvider({ children }){
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)

  const toast = useCallback((message, opts={})=>{
    const id = Date.now() + Math.random()
    const t = { id, message, type: opts.type || 'info' }
    setToasts(s=>[t, ...s])
    const timeout = opts.timeout || 3000
    setTimeout(()=> setToasts(s=> s.filter(x=> x.id !== id)), timeout)
    return id
  },[])

  const confirm = useCallback((message, opts={})=>{
    return new Promise((resolve)=>{
      setConfirmState({ message, resolve, opts })
    })
  },[])

  const handleConfirm = (val)=>{
    if(confirmState && confirmState.resolve) confirmState.resolve(val)
    setConfirmState(null)
  }

  // when a modal confirm is open, mark the document so UI (header) can respond (blur)
  useEffect(()=>{
    if(confirmState){
      document.documentElement.classList.add('ui-modal-open')
    }else{
      document.documentElement.classList.remove('ui-modal-open')
    }
    return ()=> document.documentElement.classList.remove('ui-modal-open')
  },[confirmState])

  return (
    <UiContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toasts container */}
      <div aria-live="polite" className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map(t=> (
          <div key={t.id} className={`p-3 rounded shadow-md bg-white dark:bg-gray-800 text-sm`}>
            {t.message}
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="relative bg-white dark:bg-gray-800 rounded p-8 max-w-lg w-full shadow-xl">
            <div className="mb-6 text-base">{confirmState.message}</div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" size="md" onClick={()=>handleConfirm(false)}>Cancel</Button>
              <Button variant="danger" size="md" onClick={()=>handleConfirm(true)}>Yes</Button>
            </div>
          </div>
        </div>
      )}
    </UiContext.Provider>
  )
}

export function useUi(){
  return useContext(UiContext)
}

export default UiContext
