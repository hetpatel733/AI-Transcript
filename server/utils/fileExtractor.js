const path = require('path')
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')

async function extractTextFromBuffer(filename, buffer){
  const ext = path.extname(filename || '').toLowerCase()
  try{
    if(ext === '.txt' || ext === ''){
      return buffer.toString('utf8')
    }
    if(ext === '.pdf'){
      const data = await pdfParse(buffer)
      return data.text || ''
    }
    if(ext === '.docx'){
      const res = await mammoth.extractRawText({buffer})
      return res.value || ''
    }
    // unsupported but try txt fallback
    return buffer.toString('utf8')
  }catch(err){
    console.error('fileExtractor error', err.message)
    throw err
  }
}

module.exports = { extractTextFromBuffer }
