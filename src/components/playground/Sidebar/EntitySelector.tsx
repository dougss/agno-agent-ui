'use client'

import * as React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { usePlaygroundStore } from '@/store'
import { useQueryState } from 'nuqs'
import Icon from '@/components/ui/icon'
import useChatActions from '@/hooks/useChatActions'
import { useDynamicAgents } from '@/hooks/useDynamicAgents'

export function EntitySelector() {
  const {
    mode,
    agents,
    teams,
    setMessages,
    setSelectedModel,
    setHasStorage,
    setSelectedTeamId
  } = usePlaygroundStore()
  const { focusChatInput } = useChatActions()
  const { dynamicAgents } = useDynamicAgents()
  const [agentId, setAgentId] = useQueryState('agent', {
    parse: (value) => value || undefined,
    history: 'push'
  })
  const [teamId, setTeamId] = useQueryState('team', {
    parse: (value) => value || undefined,
    history: 'push'
  })
  const [, setSessionId] = useQueryState('session')

  // Combine playground agents with dynamic agents
  const allAgents = [...agents, ...dynamicAgents]
  const currentEntities = mode === 'team' ? teams : allAgents
  const currentValue = mode === 'team' ? teamId : agentId
  const placeholder = mode === 'team' ? 'Select Team' : 'Select Agent'



  const handleOnValueChange = (value: string) => {
    const newValue = value === currentValue ? null : value
    const selectedEntity = currentEntities.find(
      (item) => item.value === newValue
    )

    setSelectedModel(selectedEntity?.model.provider || '')
    setHasStorage(!!selectedEntity?.storage)

    if (mode === 'team') {
      setSelectedTeamId(newValue)
      setTeamId(newValue)
      setAgentId(null)
    } else {
      setSelectedTeamId(null)
      setAgentId(newValue)
      setTeamId(null)
    }

    setMessages([])
    setSessionId(null)

    if (selectedEntity?.model.provider) {
      focusChatInput()
    }
  }

  if (currentEntities.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="h-9 w-full rounded-xl border border-primary/15 bg-primaryAccent text-xs font-medium uppercase opacity-50">
          <SelectValue placeholder={`No ${mode}s Available`} />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select
      value={currentValue || ''}
      onValueChange={(value) => handleOnValueChange(value)}
    >
      <SelectTrigger className="h-9 w-full rounded-xl border border-primary/15 bg-primaryAccent text-xs font-medium uppercase">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-none bg-primaryAccent font-dmmono shadow-lg">
        {currentEntities.map((entity, index) => (
          <SelectItem
            className="cursor-pointer"
            key={`${entity.value}-${index}`}
            value={entity.value}
          >
            <div className="flex items-center gap-3 text-xs font-medium uppercase">
              <Icon type={'user'} size="xs" />
              <div className="flex flex-col">
                <span>{entity.label}</span>
                {(entity as any).type === 'dynamic' && (
                  <span className="text-xs text-muted-foreground lowercase">
                    {(entity as any).specialization || 'Dynamic Agent'}
                  </span>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
