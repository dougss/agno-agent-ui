'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  RefreshCw, 
  Users, 
  Activity,
  Plus,
  Grid3X3,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundStore } from '@/store';
import { getDynamicAgentsAPI } from '@/api/playground';
import AgentCard from '@/components/agents/AgentCard';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  description?: string;
  specialization?: string;
  status?: string;
  type?: string;
  model?: {
    provider?: string;
  };
  execution_stats?: {
    total_executions?: number;
    successful_executions?: number;
    failed_executions?: number;
  };
}

const AgentsPage = () => {
  const router = useRouter();
  const { selectedEndpoint } = usePlaygroundStore();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load agents
  const loadAgents = useCallback(async () => {
    if (!selectedEndpoint) {
      setError('No endpoint selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const agentsData = await getDynamicAgentsAPI(selectedEndpoint);
      setAgents(agentsData);
      setFilteredAgents(agentsData);
    } catch (err) {
      setError('Failed to load agents');
      console.error('Error loading agents:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedEndpoint]);

  const handleAgentDeleted = () => {
    // Reload agents after deletion
    loadAgents();
  };

  // Filter agents
  useEffect(() => {
    let filtered = agents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => 
        agent.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Specialization filter
    if (specializationFilter !== 'all') {
      filtered = filtered.filter(agent => 
        agent.specialization?.toLowerCase() === specializationFilter.toLowerCase()
      );
    }

    setFilteredAgents(filtered);
  }, [agents, searchTerm, statusFilter, specializationFilter]);

  // Load agents on mount and when endpoint changes
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Get unique specializations for filter
  const specializations = Array.from(
    new Set(agents.map(agent => agent.specialization).filter(Boolean))
  );

  // Get unique statuses for filter
  const statuses = Array.from(
    new Set(agents.map(agent => agent.status).filter(Boolean))
  );

  if (!selectedEndpoint) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Endpoint Selected</h3>
            <p className="text-muted-foreground text-center">
              Please select an endpoint in the playground to view agents.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Agents
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and interact with your AI agents
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadAgents}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="gradient-primary text-white"
            onClick={() => router.push('/agents/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Agent
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {agents.filter(a => a.status === 'online' || a.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-amber-500"></div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">
                  {agents.filter(a => a.status === 'processing' || a.status === 'busy').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Specialization Filter */}
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {specializations.map(spec => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span>Loading agents...</span>
          </div>
        </div>
      ) : error ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Agents</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={loadAgents} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredAgents.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Agents Found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== 'all' || specializationFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No agents are available. Create your first agent to get started.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <AgentCard agent={agent} onAgentDeleted={handleAgentDeleted} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AgentsPage;
