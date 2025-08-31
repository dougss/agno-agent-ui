import { useEffect, useCallback } from 'react'
import { usePlaygroundStore } from '@/store'
import { getDynamicAgentsAPI } from '@/api/playground'

export const useDynamicAgents = () => {
  const {
    selectedEndpoint,
    dynamicAgents,
    setDynamicAgents,
    isDynamicAgentsLoading,
    setIsDynamicAgentsLoading
  } = usePlaygroundStore()

  const loadDynamicAgents = useCallback(async () => {
    if (!selectedEndpoint) return

    setIsDynamicAgentsLoading(true)
    try {
      const agents = await getDynamicAgentsAPI(selectedEndpoint)
      
      // Transform agents to match the expected format
      const transformedAgents = agents.map((agent: any) => ({
        value: agent.id,
        label: agent.name,
        model: {
          provider: agent.model_config?.model_id || 'gpt-4o-mini'
        },
        storage: true,
        type: 'dynamic' as const,
        specialization: agent.specialization,
        description: agent.description
      }))

      setDynamicAgents(transformedAgents)
    } catch (error) {
      console.error('Error loading dynamic agents:', error)
    } finally {
      setIsDynamicAgentsLoading(false)
    }
  }, [selectedEndpoint, setDynamicAgents, setIsDynamicAgentsLoading])

  useEffect(() => {
    loadDynamicAgents()
  }, [loadDynamicAgents])

  return {
    dynamicAgents,
    isDynamicAgentsLoading,
    loadDynamicAgents
  }
}
