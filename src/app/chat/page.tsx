import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getChatChannels, getChannelMessages } from '@/app/actions/chat'
import ChatClient from '@/components/ChatClient'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const channels = await getChatChannels()
  const defaultChannelId = channels[0]?.id || ''
  const initialMessages = defaultChannelId ? await getChannelMessages(defaultChannelId) : []

  return (
    <div className="h-full w-full max-w-[1960px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col overflow-hidden">
      <ChatClient 
        initialChannels={channels} 
        initialMessages={initialMessages} 
        currentUser={session.user} 
      />
    </div>
  )
}
