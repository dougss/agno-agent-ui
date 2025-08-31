'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Bot, 
  Code, 
  Search, 
  Target, 
  MessageSquare, 
  FolderOpen,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { usePlaygroundStore } from '@/store';
import { getDynamicAgentAPI } from '@/api/playground';
import { toast } from 'sonner';

interface AgentFormData {
  name: string;
  description: string;
  specialization: string;
  system_prompt: string;
  model_provider: string;
  capabilities: string[];
  tools: string[];
}

interface Agent {
  id: string;
  name: string;
  description?: string;
  specialization?: string;
  status?: string;
  role?: string;
  model_config?: {
    model_id?: string;
    provider?: string;
  };
  tools_config?: Array<{
    name: string;
    config: any;
    enabled: boolean;
  }>;
  instructions?: {
    system_message?: string;
    guidelines?: string[];
    examples?: Array<{
      input: string;
      output: string;
    }>;
  };
  system_message?: string;
}

const AgentEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const { selectedEndpoint } = usePlaygroundStore();
  
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    specialization: '',
    system_prompt: '',
    model_provider: 'gpt-4o-mini',
    capabilities: [],
    tools: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCapability, setNewCapability] = useState('');
  const [newTool, setNewTool] = useState('');

  const specializations = [
    { value: 'code', label: 'Code & Programming', icon: Code },
    { value: 'research', label: 'Research & Analysis', icon: Search },
    { value: 'task', label: 'Task Planning', icon: Target },
    { value: 'communication', label: 'Communication', icon: MessageSquare },
    { value: 'project', label: 'Project Management', icon: FolderOpen },
    { value: 'investimentos pessoais', label: 'Personal Investments', icon: Target }
  ];

  const modelProviders = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
  ];

  const availableTools = [
    'DuckDuckGoTools',
    'YFinanceTools',
    'ReasoningTools',
    'web_search',
    'web_scrape',
    'file_manager',
    'python_repl',
    'email',
    'slack',
    'database',
    'api_client'
  ];

  const getSpecializationIcon = (specialization: string) => {
    const spec = specializations.find(s => s.value === specialization);
    return spec ? spec.icon : Bot;
  };

  // Load agent data
  useEffect(() => {
    const loadAgent = async () => {
      if (!selectedEndpoint || !agentId) return;

      try {
        setIsLoading(true);
        const agentData = await getDynamicAgentAPI(selectedEndpoint, agentId);
        setAgent(agentData);
        
        // Extract tools from tools_config
        const tools = agentData.tools_config?.map(tool => tool.name) || [];
        
        // Extract capabilities from instructions guidelines
        const capabilities = agentData.instructions?.guidelines?.map(guideline => 
          guideline.replace(/^[0-9]+\)\s*/, '').trim()
        ) || [];
        
        // Get system message from instructions or system_message
        const systemMessage = agentData.instructions?.system_message || agentData.system_message || '';
        
        // Populate form with agent data
        setFormData({
          name: agentData.name || '',
          description: agentData.description || '',
          specialization: agentData.specialization || '',
          system_prompt: systemMessage,
          model_provider: agentData.model_config?.model_id || 'gpt-4o-mini',
          capabilities: capabilities,
          tools: tools
        });
      } catch (error) {
        toast.error('Failed to load agent information');
        console.error('Error loading agent:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgent();
  }, [selectedEndpoint, agentId]);

  const addCapability = () => {
    if (newCapability.trim() && !formData.capabilities.includes(newCapability.trim())) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, newCapability.trim()]
      }));
      setNewCapability('');
    }
  };

  const removeCapability = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(c => c !== capability)
    }));
  };

  const addTool = () => {
    if (newTool.trim() && !formData.tools.includes(newTool.trim())) {
      setFormData(prev => ({
        ...prev,
        tools: [...prev.tools, newTool.trim()]
      }));
      setNewTool('');
    }
  };

  const removeTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t !== tool)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEndpoint || !agentId) {
      toast.error('Please select an endpoint first');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement agent update API call
      console.log('Updating agent:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Agent updated successfully!');
      
      // Redirect to agent chat
      router.push(`/agents/${agentId}/chat`);
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedEndpoint) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Endpoint Selected</h3>
            <p className="text-muted-foreground text-center">
              Please select an endpoint in the playground to edit agents.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading agent...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <Bot className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Agent Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The requested agent could not be found.
            </p>
            <Button onClick={() => router.push('/agents')} variant="outline">
              Back to Agents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/agents/${agentId}/chat`)}
            className="hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agent
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Edit Agent
            </h1>
            <p className="text-muted-foreground mt-1">
              Modify {agent.name}&apos;s configuration and capabilities
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Agent Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter agent name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this agent does"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Specialization</label>
                <Select 
                  value={formData.specialization} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => {
                      const IconComponent = spec.icon;
                      return (
                        <SelectItem key={spec.value} value={spec.value}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{spec.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Model Provider</label>
                <Select 
                  value={formData.model_provider} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, model_provider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Agent Preview */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Agent Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.name ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      formData.specialization === 'code' ? 'bg-agent-code' :
                      formData.specialization === 'research' ? 'bg-agent-research' :
                      formData.specialization === 'task' ? 'bg-agent-task' :
                      formData.specialization === 'communication' ? 'bg-agent-communication' :
                      formData.specialization === 'project' ? 'bg-agent-project' :
                      formData.specialization === 'investimentos pessoais' ? 'bg-agent-task' :
                      'bg-primary'
                    } text-white`}>
                      {formData.specialization ? 
                        React.createElement(getSpecializationIcon(formData.specialization), { className: "h-4 w-4" }) :
                        <Bot className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold">{formData.name}</h3>
                      {formData.specialization && (
                        <Badge variant="secondary" className="text-xs">
                          {specializations.find(s => s.value === formData.specialization)?.label || formData.specialization}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {formData.description && (
                    <p className="text-sm text-muted-foreground">
                      {formData.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Capabilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                      {formData.capabilities.length === 0 && (
                        <span className="text-xs text-muted-foreground">No capabilities added</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Tools:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.tools.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                      {formData.tools.length === 0 && (
                        <span className="text-xs text-muted-foreground">No tools added</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>Start filling the form to see a preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Prompt */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>System Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <TextArea
              value={formData.system_prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
              placeholder="Define the agent's behavior, personality, and instructions..."
              rows={6}
              required
            />
          </CardContent>
        </Card>

        {/* Capabilities */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Capabilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
                placeholder="Add a capability"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
              />
              <Button type="button" onClick={addCapability} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.capabilities.map((capability) => (
                <Badge key={capability} variant="secondary" className="flex items-center space-x-1">
                  <span>{capability}</span>
                  <button
                    type="button"
                    onClick={() => removeCapability(capability)}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tools */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Select value={newTool} onValueChange={setNewTool}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a tool" />
                </SelectTrigger>
                <SelectContent>
                  {availableTools.map((tool) => (
                    <SelectItem key={tool} value={tool}>
                      {tool}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addTool} size="sm" disabled={!newTool}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.tools.map((tool) => (
                <Badge key={tool} variant="secondary" className="flex items-center space-x-1">
                  <span>{tool}</span>
                  <button
                    type="button"
                    onClick={() => removeTool(tool)}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/agents/${agentId}/chat`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.description}
            className="gradient-primary text-white hover:shadow-glow"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Agent
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AgentEditPage;
