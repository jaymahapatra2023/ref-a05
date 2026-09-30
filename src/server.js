import { createServer } from 'node:http'
import { appendFileSync } from 'node:fs'
import { config } from './config.js'

const PORT = Number(process.env.PORT ?? 8080)
const history = []

async function ask(messages) {
  if (config.modelKey.startsWith('sk-demo')) {
    return 'Thanks! Based on what you have told me, I would suggest talking to your benefits ' +
      'team about your options. Is there anything else I can help with?'
  }
  const res = await fetch('https://api.example-model.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.modelKey}` },
    body: JSON.stringify({ model: config.model, system: config.systemPrompt, messages }),
  })
  return (await res.json()).completion ?? 'Sorry, something went wrong.'
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    res.writeHead(200, { 'content-type': 'text/html' })
    res.end('<h1>Dental benefits chat</h1><p>POST /chat with {"message":"..."} to talk to the assistant.</p>')
    return
  }
  if (req.method === 'POST' && req.url === '/chat') {
    let raw = ''
    for await (const chunk of req) raw += chunk
    const { message } = JSON.parse(raw || '{}')

    history.push({ role: 'user', content: message })
    // Keep a transcript so we can see what people asked.
    console.log('user said:', message)
    appendFileSync('transcript.log', `${new Date().toISOString()} ${JSON.stringify(history)}\n`)

    const reply = await ask(history)
    history.push({ role: 'assistant', content: reply })
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ reply }))
    return
  }
  res.writeHead(404).end()
})

server.listen(PORT, () => console.log('listening on', PORT))
