export interface World {
  description: string,
  summary: string
}

export async function fetchWorld(prompt: string) {
  const response = await fetch('/api/world', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userPrompt: prompt})
  })
  return await response.json() as World
}
