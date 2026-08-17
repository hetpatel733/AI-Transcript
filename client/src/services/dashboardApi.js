import client from './api'

export async function getDashboard(){
  try{
    const { data } = await client.get('/dashboard')
    return data
  }catch(e){
    return client.handleError(e)
  }
}
