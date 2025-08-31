'use client'

import ChatInput from './ChatInput'
import MessageArea from './MessageArea'
import { AgentBuilder } from '../AgentBuilder/AgentBuilder'
import { usePlaygroundStore } from '@/store'
import { useDynamicAgents } from '@/hooks/useDynamicAgents'

const ChatArea = () => {
  const agentBuilderMode = usePlaygroundStore((state) => state.agentBuilderMode)
  const { loadDynamicAgents } = useDynamicAgents()

  const handleAgentCreated = () => {
    loadDynamicAgents()
  }

  if (agentBuilderMode) {
    return (
      <main className="relative m-1.5 flex flex-grow flex-col rounded-xl bg-background p-4">
        <AgentBuilder onAgentCreated={handleAgentCreated} />
      </main>
    )
  }

  return (
    <main className="relative m-1.5 flex flex-grow flex-col rounded-xl bg-background">
      <MessageArea />
      <div className="sticky bottom-0 ml-9 px-4 pb-2">
        <ChatInput />
      </div>
    </main>
  )
}

export default ChatArea
