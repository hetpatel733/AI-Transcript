import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

const client = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

client.handleError = function(err){
  if(err?.response?.data?.message) return err.response.data
  return { success: false, message: 'Something went wrong. Please try again.' }
}

export default client
