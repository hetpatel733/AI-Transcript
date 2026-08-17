try{
  const pkg = require('@google-ai/generative-language')
  console.log('package keys:', Object.keys(pkg))
  console.log('package exported value:', pkg)
}catch(err){
  console.error('require failed:', err.message)
}
