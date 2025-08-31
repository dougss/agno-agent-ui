import { useCallback } from 'react'
import {
  getAgentSessionAPI,
  getAllAgentSessionsAPI,
  getPlaygroundTeamSessionsAPI,
  getPlaygroundTeamSessionAPI
} from '@/api/playground'
import { usePlaygroundStore } from '../store'
import { toast } from 'sonner'
import {
  PlaygroundChatMessage,
  ToolCall,
  ReasoningMessage,
  ChatEntry
} from '@/types/playground'
import { getJsonMarkdown } from '@/lib/utils'

interface SessionResponse {
  session_id: string
  agent_id: string
  user_id: string | null
  runs?: ChatEntry[]
  memory: {
    runs?: ChatEntry[]
    chats?: ChatEntry[]
  }
  agent_data: Record<string, unknown>
}

interface DynamicAgentSessionResponse {
  session_id: string
  agent_id: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: number
  }>
  created_at: number
  updated_at: number
}

interface LoaderArgs {
  entityType: 'agent' | 'team' | null
  agentId?: string | null
  teamId?: string | null
}

const useSessionLoader = () => {
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  const setIsSessionsLoading = usePlaygroundStore(
    (state) => state.setIsSessionsLoading
  )
  const setSessionsData = usePlaygroundStore((state) => state.setSessionsData)

  const getSessions = useCallback(
    async ({ entityType, agentId, teamId }: LoaderArgs) => {
      if (!selectedEndpoint) return

      try {
        setIsSessionsLoading(true)

        const sessions =
          entityType === 'team'
            ? await getPlaygroundTeamSessionsAPI(selectedEndpoint, teamId!)
            : await getAllAgentSessionsAPI(selectedEndpoint, agentId!)

        setSessionsData(sessions)
      } catch {
        toast.error('Error loading sessions')
        setSessionsData([])
      } finally {
        setIsSessionsLoading(false)
      }
    },
    [selectedEndpoint, setSessionsData, setIsSessionsLoading]
  )

  const getSession = useCallback(
    async ({ entityType, agentId, teamId }: LoaderArgs, sessionId: string) => {
      if (!selectedEndpoint || !sessionId) return

      try {
        if (entityType === 'team') {
          const response: SessionResponse = await getPlaygroundTeamSessionAPI(
            selectedEndpoint,
            teamId!,
            sessionId
          )

          if (response) {
            const sessionHistory = response.runs
              ? response.runs
              : response.memory.runs

            if (sessionHistory && Array.isArray(sessionHistory)) {
              const messagesForPlayground = sessionHistory.flatMap((run) => {
                const filteredMessages: PlaygroundChatMessage[] = []

                if (run.message) {
                  filteredMessages.push({
                    role: 'user',
                    content: run.message.content ?? '',
                    created_at: run.message.created_at
                  })
                }

                if (run.response) {
                  const toolCalls = [
                    ...(run.response.tools ?? []),
                    ...(run.response.extra_data?.reasoning_messages ?? []).reduce(
                      (acc: ToolCall[], msg: ReasoningMessage) => {
                        if (msg.role === 'tool') {
                          acc.push({
                            role: msg.role,
                            content: msg.content,
                            tool_call_id: msg.tool_call_id ?? '',
                            tool_name: msg.tool_name ?? '',
                            tool_args: msg.tool_args ?? {},
                            tool_call_error: msg.tool_call_error ?? false,
                            metrics: msg.metrics ?? { time: 0 },
                            created_at:
                              msg.created_at ?? Math.floor(Date.now() / 1000)
                          })
                        }
                        return acc
                      },
                      []
                    )
                  ]

                  filteredMessages.push({
                    role: 'agent',
                    content: (run.response.content as string) ?? '',
                    tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
                    extra_data: run.response.extra_data,
                    images: run.response.images,
                    videos: run.response.videos,
                    audio: run.response.audio,
                    response_audio: run.response.response_audio,
                    created_at: run.response.created_at
                  })
                }
                return filteredMessages
              })

              const processedMessages = messagesForPlayground.map(
                (message: PlaygroundChatMessage) => {
                  if (Array.isArray(message.content)) {
                    const textContent = message.content
                      .filter((item: { type: string }) => item.type === 'text')
                      .map((item) => item.text)
                      .join(' ')

                    return {
                      ...message,
                      content: textContent
                    }
                  }
                  if (typeof message.content !== 'string') {
                    return {
                      ...message,
                      content: getJsonMarkdown(message.content)
                    }
                  }
                  return message
                }
              )

              setMessages(processedMessages)
              return processedMessages
            }
          }
        } else {
          // Handle both playground agents and dynamic agents
          const response = await getAgentSessionAPI(
            selectedEndpoint,
            agentId!,
            sessionId
          )

          if (response) {
            // Check if it's a dynamic agent response (has messages array)
            if ('messages' in response) {
              const dynamicResponse = response as DynamicAgentSessionResponse
              const processedMessages: PlaygroundChatMessage[] = dynamicResponse.messages.map(
                (msg) => ({
                  role: msg.role,
                  content: msg.content,
                  created_at: msg.timestamp
                })
              )
              setMessages(processedMessages)
              return processedMessages
            } else {
              // Handle playground agent response (legacy format)
              const playgroundResponse = response as SessionResponse
              const sessionHistory = playgroundResponse.runs
                ? playgroundResponse.runs
                : playgroundResponse.memory.runs

              if (sessionHistory && Array.isArray(sessionHistory)) {
                const messagesForPlayground = sessionHistory.flatMap((run) => {
                  const filteredMessages: PlaygroundChatMessage[] = []

                  if (run.message) {
                    filteredMessages.push({
                      role: 'user',
                      content: run.message.content ?? '',
                      created_at: run.message.created_at
                    })
                  }

                  if (run.response) {
                    const toolCalls = [
                      ...(run.response.tools ?? []),
                      ...(run.response.extra_data?.reasoning_messages ?? []).reduce(
                        (acc: ToolCall[], msg: ReasoningMessage) => {
                          if (msg.role === 'tool') {
                            acc.push({
                              role: msg.role,
                              content: msg.content,
                              tool_call_id: msg.tool_call_id ?? '',
                              tool_name: msg.tool_name ?? '',
                              tool_args: msg.tool_args ?? {},
                              tool_call_error: msg.tool_call_error ?? false,
                              metrics: msg.metrics ?? { time: 0 },
                              created_at:
                                msg.created_at ?? Math.floor(Date.now() / 1000)
                            })
                          }
                          return acc
                        },
                        []
                      )
                    ]

                    filteredMessages.push({
                      role: 'agent',
                      content: (run.response.content as string) ?? '',
                      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
                      extra_data: run.response.extra_data,
                      images: run.response.images,
                      videos: run.response.videos,
                      audio: run.response.audio,
                      response_audio: run.response.response_audio,
                      created_at: run.response.created_at
                    })
                  }
                  return filteredMessages
                })

                const processedMessages = messagesForPlayground.map(
                  (message: PlaygroundChatMessage) => {
                    if (Array.isArray(message.content)) {
                      const textContent = message.content
                        .filter((item: { type: string }) => item.type === 'text')
                        .map((item) => item.text)
                        .join(' ')

                      return {
                        ...message,
                        content: textContent
                      }
                    }
                    if (typeof message.content !== 'string') {
                      return {
                        ...message,
                        content: getJsonMarkdown(message.content)
                      }
                    }
                    return message
                  }
                )

                setMessages(processedMessages)
                return processedMessages
              }
            }
          }
        }
      } catch {
        return null
      }
    },
    [selectedEndpoint, setMessages]
  )

  return { getSession, getSessions }
}

export default useSessionLoader
