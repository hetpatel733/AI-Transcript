import client from './api'

export async function listMeetings(){
  try{
    const { data } = await client.get('/meetings')
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function getMeeting(meetingId){
  try{
    const { data } = await client.get(`/meetings/${meetingId}`)
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function createMeeting(body){
  try{
    const config = {}
    if(body instanceof FormData){
      config.headers = { 'Content-Type': 'multipart/form-data' }
    }
    const { data } = await client.post('/meetings', body, config)
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function updateMeeting(meetingId, body){
  try{
    const config = {}
    if(body instanceof FormData){
      config.headers = { 'Content-Type': 'multipart/form-data' }
    }
    const { data } = await client.put(`/meetings/${meetingId}`, body, config)
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function deleteMeeting(meetingId){
  try{
    const { data } = await client.delete(`/meetings/${meetingId}`)
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function analyzeMeeting(meetingId){
  try{
    const { data } = await client.post(`/meetings/${meetingId}/analyze`)
    return data
  }catch(e){
    return client.handleError(e)
  }
}
