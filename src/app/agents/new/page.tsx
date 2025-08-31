'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TextArea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { usePlaygroundStore } from '@/store'
import { agentBuilderChatAPI, parseSpecificationAPI, createAgentAPI } from '@/api/playground'
import { toast } from 'sonner'
import { Loader2, Bot, Sparkles, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AgentBuilderPage() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [specification, setSpecification] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  const router = useRouter()

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedEndpoint) return

    setIsLoading(true)
    const userMessage = message
    setMessage('')

    // Add user message to conversation
    setConversation(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await agentBuilderChatAPI(
        selectedEndpoint,
        userMessage,
        undefined,
        undefined,
        false
      )

      const assistantMessage = response.content || 'No response received'
      setConversation(prev => [...prev, { role: 'assistant', content: assistantMessage }])

      // Try to parse specification from the response
      try {
        const specResponse = await parseSpecificationAPI(selectedEndpoint, assistantMessage)
        if (specResponse.success && specResponse.specification) {
          setSpecification(specResponse.specification)
          toast.success(`Specification parsed with score: ${specResponse.validation_score}`)
        }
      } catch (error) {
        // Specification parsing failed, that's okay
        console.log('Could not parse specification from response')
      }

    } catch (error) {
      toast.error('Error communicating with Agent Builder')
      console.error('Agent Builder error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAgent = async () => {
    if (!specification || !selectedEndpoint) return

    setIsCreating(true)
    try {
      const response = await createAgentAPI(
        selectedEndpoint,
        specification,
        'web_user'
      )

      if (response.success) {
        toast.success(`Agent "${response.agent_id}" created successfully!`)
        setSpecification(null)
        setConversation([])
        router.push('/agents')
      } else {
        toast.error('Failed to create agent')
      }
    } catch (error) {
      toast.error('Error creating agent')
      console.error('Create agent error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col gap-4 h-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agent Builder
            </CardTitle>
            <CardDescription>
              Describe the agent you want to create and I'll help you build it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <TextArea
                placeholder="Describe the agent you want to create... (e.g., 'I need a marketing specialist agent that can help with social media campaigns')"
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !message.trim()}
                className="self-end"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {conversation.length > 0 && (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white border border-blue-500'
                          : 'bg-gray-800 text-white border border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {specification && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Agent Specification
              </CardTitle>
              <CardDescription>
                Review the generated specification before creating the agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {specification.agent_config?.name}
                </div>
                <div>
                  <strong>Specialization:</strong> {specification.agent_config?.specialization}
                </div>
                <div>
                  <strong>Model:</strong> {specification.model_config?.model_id}
                </div>
                <div>
                  <strong>Tools:</strong> {specification.tools_config?.length || 0}
                </div>
              </div>
              
              <div>
                <strong>Description:</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  {specification.agent_config?.description}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateAgent}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Agent...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Create Agent
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
