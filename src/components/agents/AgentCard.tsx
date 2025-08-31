import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Bot, 
  Code, 
  Search, 
  Target, 
  MessageSquare, 
  FolderOpen,
  Settings,
  MessageCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlaygroundStore } from '@/store';
import { deleteDynamicAgentAPI } from '@/api/playground';
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

interface AgentCardProps {
  agent: Agent;
  onAgentDeleted?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onAgentDeleted }) => {
  const router = useRouter();
  const { selectedEndpoint } = usePlaygroundStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getSpecializationIcon = (specialization?: string) => {
    switch (specialization) {
      case 'code':
        return Code;
      case 'research':
        return Search;
      case 'task':
        return Target;
      case 'communication':
        return MessageSquare;
      case 'project':
        return FolderOpen;
      default:
        return Bot;
    }
  };

  const getSpecializationColor = (specialization?: string) => {
    switch (specialization) {
      case 'code':
        return 'bg-agent-code';
      case 'research':
        return 'bg-agent-research';
      case 'task':
        return 'bg-agent-task';
      case 'communication':
        return 'bg-agent-communication';
      case 'project':
        return 'bg-agent-project';
      default:
        return 'bg-primary';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'active':
        return 'bg-status-online';
      case 'offline':
      case 'inactive':
        return 'bg-status-offline';
      case 'busy':
      case 'processing':
        return 'bg-status-busy';
      default:
        return 'bg-status-unknown';
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedEndpoint) {
      toast.error('Please select an endpoint first');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDynamicAgentAPI(selectedEndpoint, agent.id);
      toast.success(`Agent "${agent.name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      onAgentDeleted?.();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const IconComponent = getSpecializationIcon(agent.specialization);
  const specializationColor = getSpecializationColor(agent.specialization);
  const statusColor = getStatusColor(agent.status);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="glass-card hover:shadow-glow transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${specializationColor} text-white shadow-lg`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`}></div>
                    <span className="text-sm text-muted-foreground">
                      {agent.status || 'Unknown'}
                    </span>
                    {agent.specialization && (
                      <Badge variant="secondary" className="text-xs">
                        {agent.specialization}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {agent.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {agent.description}
              </p>
            )}

            {/* Execution Stats */}
            {agent.execution_stats && (
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-foreground">
                    {agent.execution_stats.total_executions || 0}
                  </div>
                  <div className="text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-500">
                    {agent.execution_stats.successful_executions || 0}
                  </div>
                  <div className="text-muted-foreground">Success</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-500">
                    {agent.execution_stats.failed_executions || 0}
                  </div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                asChild
                size="sm"
                className="flex-1 gradient-primary text-white hover:shadow-glow"
              >
                <Link href={`/agents/${agent.id}/chat`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hover:bg-muted/50"
              >
                <Link href={`/agents/${agent.id}/edit`}>
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span>Delete Agent</span>
                    </DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete <strong>{agent.name}</strong>? This action cannot be undone and will permanently remove the agent and all its data.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAgent}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Agent
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AgentCard;
