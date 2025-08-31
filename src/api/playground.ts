import { toast } from 'sonner'

import { APIRoutes } from './routes'

import {
  Agent,
  ComboboxAgent,
  SessionEntry,
  ComboboxTeam,
  Team
} from '@/types/playground'

export const getPlaygroundAgentsAPI = async (
  endpoint: string
): Promise<ComboboxAgent[]> => {
  const url = APIRoutes.GetPlaygroundAgents(endpoint)
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) {
      toast.error(`Failed to fetch playground agents: ${response.statusText}`)
      return []
    }
    const data = await response.json()
    // Transform the API response into the expected shape.
    const agents: ComboboxAgent[] = data.map((item: Agent) => ({
      value: item.agent_id || '',
      label: item.name || '',
      model: {
        provider: item.model?.provider || ''
      },
      storage: !!item.storage
    }))
    return agents
  } catch {
    toast.error('Error fetching playground agents')
    return []
  }
}

export const getPlaygroundStatusAPI = async (base: string): Promise<number> => {
  const response = await fetch(APIRoutes.PlaygroundStatus(base), {
    method: 'GET'
  })
  return response.status
}

export const getAllPlaygroundSessionsAPI = async (
  base: string,
  agentId: string
): Promise<SessionEntry[]> => {
  try {
    const response = await fetch(
      APIRoutes.GetPlaygroundSessions(base, agentId),
      {
        method: 'GET'
      }
    )
    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`Failed to fetch sessions: ${response.statusText}`)
    }
    return response.json()
  } catch {
    return []
  }
}

export const getPlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
) => {
  const response = await fetch(
    APIRoutes.GetPlaygroundSession(base, agentId, sessionId),
    {
      method: 'GET'
    }
  )
  return response.json()
}

export const deletePlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
) => {
  const response = await fetch(
    APIRoutes.DeletePlaygroundSession(base, agentId, sessionId),
    {
      method: 'DELETE'
    }
  )
  return response
}

export const getPlaygroundTeamsAPI = async (
  endpoint: string
): Promise<ComboboxTeam[]> => {
  const url = APIRoutes.GetPlayGroundTeams(endpoint)
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) {
      toast.error(`Failed to fetch playground teams: ${response.statusText}`)
      return []
    }
    const data = await response.json()
    // Transform the API response into the expected shape.
    const teams: ComboboxTeam[] = data.map((item: Team) => ({
      value: item.team_id || '',
      label: item.name || '',
      model: {
        provider: item.model?.provider || ''
      },
      storage: !!item.storage
    }))
    return teams
  } catch {
    toast.error('Error fetching playground teams')
    return []
  }
}

export const getPlaygroundTeamSessionsAPI = async (
  base: string,
  teamId: string
): Promise<SessionEntry[]> => {
  try {
    const response = await fetch(
      APIRoutes.GetPlaygroundTeamSessions(base, teamId),
      {
        method: 'GET'
      }
    )
    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`Failed to fetch team sessions: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching team sessions:', error)
    return []
  }
}

// Dynamic Agents Sessions API functions
export const getAllDynamicAgentSessionsAPI = async (
  base: string,
  agentId: string
): Promise<SessionEntry[]> => {
  try {
    const response = await fetch(
      APIRoutes.GetDynamicAgentSessions(base, agentId),
      {
        method: 'GET'
      }
    )
    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`Failed to fetch dynamic agent sessions: ${response.statusText}`)
    }
    return response.json()
  } catch {
    return []
  }
}

export const getDynamicAgentSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
) => {
  const response = await fetch(
    APIRoutes.GetDynamicAgentSession(base, agentId, sessionId),
    {
      method: 'GET'
    }
  )
  return response.json()
}

export const deleteDynamicAgentSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
) => {
  const response = await fetch(
    APIRoutes.DeleteDynamicAgentSession(base, agentId, sessionId),
    {
      method: 'DELETE'
    }
  )
  return response
}

// Helper function to determine if an agent is dynamic
export const isDynamicAgent = (agentId: string): boolean => {
  // Dynamic agents have UUID format (36 characters with hyphens)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(agentId)
}

// Unified function to get sessions for any agent type
export const getAllAgentSessionsAPI = async (
  base: string,
  agentId: string
): Promise<SessionEntry[]> => {
  if (isDynamicAgent(agentId)) {
    return getAllDynamicAgentSessionsAPI(base, agentId)
  } else {
    return getAllPlaygroundSessionsAPI(base, agentId)
  }
}

export const getAgentSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
) => {
  if (isDynamicAgent(agentId)) {
    return getDynamicAgentSessionAPI(base, agentId, sessionId)
  } else {
    return getPlaygroundSessionAPI(base, agentId, sessionId)
  }
}

export const deleteAgentSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
) => {
  if (isDynamicAgent(agentId)) {
    return deleteDynamicAgentSessionAPI(base, agentId, sessionId)
  } else {
    return deletePlaygroundSessionAPI(base, agentId, sessionId)
  }
}

export const getPlaygroundTeamSessionAPI = async (
  base: string,
  teamId: string,
  sessionId: string
) => {
  const response = await fetch(
    APIRoutes.GetPlaygroundTeamSession(base, teamId, sessionId),
    {
      method: 'GET'
    }
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch team session: ${response.statusText}`)
  }
  return response.json()
}

export const deletePlaygroundTeamSessionAPI = async (
  base: string,
  teamId: string,
  sessionId: string
) => {
  const response = await fetch(
    APIRoutes.DeletePlaygroundTeamSession(base, teamId, sessionId),
    {
      method: 'DELETE'
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to delete team session: ${response.statusText}`)
  }
  return response
}

// Agent Builder APIs
export const getAgentBuilderDomainsAPI = async (endpoint: string) => {
  try {
    const response = await fetch(APIRoutes.GetAgentBuilderDomains(endpoint), {
      method: 'GET'
    })
    if (!response.ok) {
      toast.error(`Failed to fetch domains: ${response.statusText}`)
      return []
    }
    return response.json()
  } catch {
    toast.error('Error fetching domains')
    return []
  }
}

export const getAgentBuilderToolsAPI = async (endpoint: string) => {
  try {
    const response = await fetch(APIRoutes.GetAgentBuilderTools(endpoint), {
      method: 'GET'
    })
    if (!response.ok) {
      toast.error(`Failed to fetch tools: ${response.statusText}`)
      return []
    }
    return response.json()
  } catch {
    toast.error('Error fetching tools')
    return []
  }
}

export const agentBuilderChatAPI = async (
  endpoint: string,
  message: string,
  userId?: string,
  sessionId?: string,
  stream: boolean = false
) => {
  try {
    const response = await fetch(APIRoutes.AgentBuilderChat(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        user_id: userId,
        session_id: sessionId,
        stream
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to chat with agent builder: ${response.statusText}`)
    }
    
    if (stream) {
      return response
    }
    
    return response.json()
  } catch (error) {
    toast.error('Error chatting with agent builder')
    throw error
  }
}

export const parseSpecificationAPI = async (
  endpoint: string,
  responseText: string
) => {
  try {
    const response = await fetch(APIRoutes.ParseSpecification(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        response_text: responseText
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to parse specification: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    toast.error('Error parsing specification')
    throw error
  }
}

export const createAgentAPI = async (
  endpoint: string,
  specification: any,
  createdBy?: string
) => {
  try {
    const response = await fetch(APIRoutes.CreateAgent(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        specification,
        created_by: createdBy
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    toast.error('Error creating agent')
    throw error
  }
}

// Dynamic Agents APIs
export const getDynamicAgentsAPI = async (
  endpoint: string,
  specialization?: string,
  status?: string,
  limit?: number,
  offset?: number
): Promise<any[]> => {
  try {
    const params = new URLSearchParams()
    if (specialization) params.append('specialization', specialization)
    if (status) params.append('status', status)
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    
    const url = `${APIRoutes.GetDynamicAgents(endpoint)}?${params.toString()}`
    const response = await fetch(url, { method: 'GET' })
    
    if (!response.ok) {
      toast.error(`Failed to fetch dynamic agents: ${response.statusText}`)
      return []
    }
    
    const data = await response.json()
    return data.agents || []
  } catch {
    toast.error('Error fetching dynamic agents')
    return []
  }
}

export const getDynamicAgentAPI = async (endpoint: string, agentId: string) => {
  try {
    const response = await fetch(APIRoutes.GetDynamicAgent(endpoint, agentId), {
      method: 'GET'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dynamic agent: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    toast.error('Error fetching dynamic agent')
    throw error
  }
}

export const dynamicAgentChatAPI = async (
  endpoint: string,
  agentId: string,
  message: string,
  userId?: string,
  sessionId?: string,
  stream: boolean = false
) => {
  try {
    const response = await fetch(APIRoutes.DynamicAgentChat(endpoint, agentId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        user_id: userId,
        session_id: sessionId,
        stream
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to chat with dynamic agent: ${response.statusText}`)
    }
    
    if (stream) {
      return response
    }
    
    return response.json()
  } catch (error) {
    toast.error('Error chatting with dynamic agent')
    throw error
  }
}

export const updateDynamicAgentAPI = async (
  endpoint: string,
  agentId: string,
  updates: any
) => {
  try {
    const response = await fetch(APIRoutes.UpdateDynamicAgent(endpoint, agentId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update dynamic agent: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    toast.error('Error updating dynamic agent')
    throw error
  }
}

export const deleteDynamicAgentAPI = async (endpoint: string, agentId: string) => {
  try {
    const response = await fetch(APIRoutes.DeleteDynamicAgent(endpoint, agentId), {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete dynamic agent: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    toast.error('Error deleting dynamic agent')
    throw error
  }
}

export const getDynamicAgentPerformanceAPI = async (
  endpoint: string,
  agentId: string
) => {
  try {
    const response = await fetch(APIRoutes.GetDynamicAgentPerformance(endpoint, agentId), {
      method: 'GET'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch agent performance: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    toast.error('Error fetching agent performance')
    throw error
  }
}
