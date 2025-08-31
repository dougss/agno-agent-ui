export const APIRoutes = {
  // Playground routes
  GetPlaygroundAgents: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/playground/agents`,
  AgentRun: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/playground/agents/{agent_id}/runs`,
  PlaygroundStatus: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/playground/status`,
  GetPlaygroundSessions: (PlaygroundApiUrl: string, agentId: string) =>
    `${PlaygroundApiUrl}/v1/playground/agents/${agentId}/sessions`,
  GetPlaygroundSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string
  ) =>
    `${PlaygroundApiUrl}/v1/playground/agents/${agentId}/sessions/${sessionId}`,

  DeletePlaygroundSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string
  ) =>
    `${PlaygroundApiUrl}/v1/playground/agents/${agentId}/sessions/${sessionId}`,

  GetPlayGroundTeams: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/playground/teams`,
  TeamRun: (PlaygroundApiUrl: string, teamId: string) =>
    `${PlaygroundApiUrl}/v1/playground/teams/${teamId}/runs`,
  GetPlaygroundTeamSessions: (PlaygroundApiUrl: string, teamId: string) =>
    `${PlaygroundApiUrl}/v1/playground/teams/${teamId}/sessions`,
  GetPlaygroundTeamSession: (
    PlaygroundApiUrl: string,
    teamId: string,
    sessionId: string
  ) =>
    `${PlaygroundApiUrl}/v1/playground/teams/${teamId}/sessions/${sessionId}`,
  DeletePlaygroundTeamSession: (
    PlaygroundApiUrl: string,
    teamId: string,
    sessionId: string
  ) => `${PlaygroundApiUrl}/v1/playground/teams/${teamId}/sessions/${sessionId}`,

  // Agent Builder routes
  GetAgentBuilderDomains: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/agent-builder/domains`,
  GetAgentBuilderTools: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/agent-builder/tools`,
  AgentBuilderChat: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/agent-builder/chat`,
  ParseSpecification: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/agent-builder/parse-specification`,
  CreateAgent: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/agent-builder/create-agent`,

  // Dynamic Agents routes
  GetDynamicAgents: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/dynamic-agents`,
  GetDynamicAgent: (PlaygroundApiUrl: string, agentId: string) =>
    `${PlaygroundApiUrl}/v1/dynamic-agents/${agentId}`,
  DynamicAgentChat: (PlaygroundApiUrl: string, agentId: string) =>
    `${PlaygroundApiUrl}/v1/dynamic-agents/${agentId}/chat`,
  UpdateDynamicAgent: (PlaygroundApiUrl: string, agentId: string) =>
    `${PlaygroundApiUrl}/v1/dynamic-agents/${agentId}`,
  DeleteDynamicAgent: (PlaygroundApiUrl: string, agentId: string) =>
    `${PlaygroundApiUrl}/v1/dynamic-agents/${agentId}`,
  GetDynamicAgentPerformance: (PlaygroundApiUrl: string, agentId: string) =>
    `${PlaygroundApiUrl}/v1/dynamic-agents/${agentId}/performance`,

  // Dynamic Agents Sessions routes
  GetDynamicAgentSessions: (PlaygroundApiUrl: string, agentId: string) =>
    `${PlaygroundApiUrl}/v1/dynamic-agents/${agentId}/sessions`,
  GetDynamicAgentSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string
  ) =>
    `${PlaygroundApiUrl}/v1/dynamic-agents/${agentId}/sessions/${sessionId}`,
  DeleteDynamicAgentSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string
  ) =>
    `${PlaygroundApiUrl}/v1/dynamic-agents/${agentId}/sessions/${sessionId}`
}
