/**
 * Simple AI service wrapper.
 * Supports provider "mock" returning deterministic structured JSON.
 * Real provider integration point exists but is not implemented.
 */

const provider = process.env.AI_PROVIDER || 'mock'

async function analyzeWithMock(transcript){
  // deterministic simple extraction: short summary + empty arrays
  const summary = transcript.split('\n').slice(0,3).join(' ').slice(0,500)
  return {
    summary: summary || 'No summary available',
    discussionPoints: [],
    decisions: [],
    actionItems: [],
    risks: [],
    unansweredQuestions: []
  }
}

async function analyze(transcript){
  if(provider === 'mock') return analyzeWithMock(transcript)
  // Placeholder for real provider integration
  throw new Error('AI provider not implemented')
}

module.exports = { analyze }
