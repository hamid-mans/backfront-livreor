export type Message = {
  id: number
  content: string
  author: string
  createdAt: string
}

export type MessageInput = Pick<Message, 'content' | 'author'>
