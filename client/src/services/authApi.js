import client from './api'

export async function login(body){
  try{
    const { data } = await client.post('/auth/login', body)
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function register(body){
  try{
    const { data } = await client.post('/auth/register', body)
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function logout(){
  try{
    const { data } = await client.post('/auth/logout')
    return data
  }catch(e){
    return client.handleError(e)
  }
}

export async function me(){
  try{
    const { data } = await client.get('/auth/me')
    return data
  }catch(e){
    return client.handleError(e)
  }
}
