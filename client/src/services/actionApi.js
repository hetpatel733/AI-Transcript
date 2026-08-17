import client from './api'

export async function listActions(params){
  try{
    const { data } = await client.get('/actions', { params })
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function createAction(body){
  try{
    const { data } = await client.post('/actions', body)
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function updateAction(actionId, body){
  try{
    const { data } = await client.put(`/actions/${actionId}`, body)
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function deleteAction(actionId){
  try{
    const { data } = await client.delete(`/actions/${actionId}`)
    return data
  }catch(e){
    return client.handleError(e)
  }
}
