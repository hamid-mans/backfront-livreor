import type { Message, MessageInput } from '@/types/message'

const API_URL = import.meta.env.VITE_API_URL

export type PostMessageResult =
  | { ok: true; message: Message }
  | { ok: false; errors: Record<string, string> }

export async function getMessages(): Promise<Message[]> {
  const res = await fetch(`${API_URL}/messages`)
  return res.json()
}

export async function postMessage(input: MessageInput): Promise<PostMessageResult> {
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  if (res.status === 201) {
    return { ok: true, message: data }
  }

  if (res.status === 422) {
    return { ok: false, errors: data.errors }
  }

  throw new Error(`Erreur inattendue de l'API (${res.status})`)
}
