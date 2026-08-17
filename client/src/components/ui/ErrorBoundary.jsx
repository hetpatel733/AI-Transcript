import React from 'react'

export default class ErrorBoundary extends React.Component{
  constructor(props){
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error){
    return { hasError: true, error }
  }
  componentDidCatch(error, info){
    console.error('Uncaught error:', error, info)
  }
  render(){
    if(this.state.hasError){
      return (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <pre className="mt-4 p-3 bg-white rounded shadow text-sm text-red-700">{String(this.state.error)}</pre>
          <div className="mt-4">Try refreshing the page or contact support.</div>
        </div>
      )
    }
    return this.props.children
  }
}
