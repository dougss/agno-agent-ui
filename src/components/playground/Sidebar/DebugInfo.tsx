'use client'

import { usePlaygroundStore } from '@/store'
import { useDynamicAgents } from '@/hooks/useDynamicAgents'

export function DebugInfo() {
  const {
    agents,
    teams,
    dynamicAgents,
    isDynamicAgentsLoading,
    selectedEndpoint,
    isEndpointActive
  } = usePlaygroundStore()

  const { loadDynamicAgents } = useDynamicAgents()

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-xs">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Endpoint: {selectedEndpoint}</div>
        <div>Endpoint Active: {isEndpointActive ? 'Yes' : 'No'}</div>
        <div>Playground Agents: {agents.length}</div>
        <div>Dynamic Agents: {dynamicAgents.length}</div>
        <div>Teams: {teams.length}</div>
        <div>Loading Dynamic: {isDynamicAgentsLoading ? 'Yes' : 'No'}</div>
        <button 
          onClick={loadDynamicAgents}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Reload Dynamic Agents
        </button>
      </div>
    </div>
  )
}
