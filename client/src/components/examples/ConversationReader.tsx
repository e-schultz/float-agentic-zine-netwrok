import { ConversationReader } from '../ConversationReader'

export default function ConversationReaderExample() {
  const mockConversation = `
A sample conversation about digital information processing and the emergence of patterns through dialogue.
`

  return (
    <div className="h-[600px] p-4">
      <ConversationReader conversation={mockConversation} />
    </div>
  )
}