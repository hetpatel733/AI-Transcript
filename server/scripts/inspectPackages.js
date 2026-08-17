const pkgs = [
  'googleapis',
  '@google-cloud/aiplatform',
  '@google-cloud/vertex-ai',
  '@google-cloud/ai-platform',
  'google-auth-library',
  '@google-cloud/ai',
  '@google-cloud/aiplatform-client'
]

for(const p of pkgs){
  try{
    console.log('\n---', p)
    const resolved = require.resolve(p)
    console.log('resolved to', resolved)
    const mod = require(p)
    console.log('keys:', Object.keys(mod).slice(0,50))
  }catch(err){
    console.error('require failed:', err.message)
  }
}
