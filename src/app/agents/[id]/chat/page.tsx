'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  MessageCircle, 
  User, 
  Bot,
  RefreshCw,
  Settings,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundStore } from '@/store';
import { 
  getDynamicAgentAPI, 
  dynamicAgentChatAPI,
  getAllAgentSessionsAPI,
  getAgentSessionAPI,
  deleteAgentSessionAPI,
  isDynamicAgent
} from '@/api/playground';
import { SessionEntry } from '@/types/playground';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'error';
}

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
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

const AgentChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const { selectedEndpoint } = usePlaygroundStore();
  
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const [chatSessions, setChatSessions] = useState<SessionEntry[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadAgentInfo = useCallback(async () => {
    if (!selectedEndpoint || !agentId) return;

    try {
      setIsLoadingAgent(true);
      const agentData = await getDynamicAgentAPI(selectedEndpoint, agentId);
      setAgent(agentData);
    } catch (error) {
      setError('Failed to load agent information');
      console.error('Error loading agent:', error);
    } finally {
      setIsLoadingAgent(false);
    }
  }, [selectedEndpoint, agentId]);

  const loadSessions = useCallback(async () => {
    if (!selectedEndpoint || !agentId) return;

    try {
      setIsLoadingSessions(true);
      const sessions = await getAllAgentSessionsAPI(selectedEndpoint, agentId);
      setChatSessions(sessions);
      
      // Set first session as current if available and no session is currently selected
      if (sessions.length > 0 && !currentSessionId) {
        setCurrentSessionId(sessions[0].session_id);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [selectedEndpoint, agentId]); // Removed currentSessionId dependency

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    if (!selectedEndpoint || !agentId || !sessionId) return;

    try {
      const sessionData = await getAgentSessionAPI(selectedEndpoint, agentId, sessionId);
      
      // Convert session messages to ChatMessage format
      const chatMessages: ChatMessage[] = [];
      
      if (sessionData.messages && Array.isArray(sessionData.messages)) {
        sessionData.messages.forEach((msg: any) => {
          chatMessages.push({
            id: `${msg.role}-${msg.timestamp || Date.now()}`,
            content: msg.content,
            sender: msg.role === 'user' ? 'user' : 'agent',
            timestamp: new Date(msg.timestamp * 1000 || Date.now()),
            status: 'read'
          });
        });
      }
      
      setMessages(chatMessages);
      setInputMessage(''); // Clear input when switching sessions
    } catch (error) {
      console.error('Error loading session messages:', error);
      setMessages([]);
    }
  }, [selectedEndpoint, agentId]);

  useEffect(() => {
    if (agentId && selectedEndpoint) {
      loadAgentInfo();
      loadSessions();
    }
  }, [agentId, selectedEndpoint, loadAgentInfo, loadSessions]);

  useEffect(() => {
    if (currentSessionId) {
      loadSessionMessages(currentSessionId);
    }
  }, [currentSessionId, loadSessionMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !agentId || !selectedEndpoint || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add agent message placeholder
      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        content: '',
        sender: 'agent',
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, agentMessage]);

      // Call streaming API
      const response = await dynamicAgentChatAPI(
        selectedEndpoint,
        agentId,
        messageToSend,
        undefined,
        currentSessionId || undefined,
        true // Enable streaming
      );

      if (response instanceof Response) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const eventData = JSON.parse(line.slice(6));
                  
                  if (eventData.event === 'RunStarted') {
                    // Update session ID if new session was created
                    if (eventData.session_id && eventData.session_id !== currentSessionId) {
                      setCurrentSessionId(eventData.session_id);
                      // Reload sessions to get the new one
                      setTimeout(() => loadSessions(), 100); // Small delay to avoid race conditions
                    }
                  } else if (eventData.event === 'RunResponseContent') {
                    // Update the last agent message with streaming content
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage && lastMessage.sender === 'agent') {
                        lastMessage.content += eventData.content;
                      }
                      return newMessages;
                    });
                  } else if (eventData.event === 'RunCompleted') {
                    // Mark message as completed
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage && lastMessage.sender === 'agent') {
                        lastMessage.status = 'read';
                      }
                      return newMessages;
                    });
                  }
                } catch (parseError) {
                  console.warn('Failed to parse streaming event:', line);
                }
              }
            }
          }
        }
      } else {
        // Fallback for non-streaming response
        const agentMessage: ChatMessage = {
          id: `agent-${Date.now()}`,
          content: response.content || response.response || response.message || 'No response received',
          sender: 'agent',
          timestamp: new Date(),
          status: 'read'
        };
        setMessages(prev => [...prev.slice(0, -1), agentMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'agent',
        timestamp: new Date(),
        status: 'error'
      };

      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const createNewSession = () => {
    const newSession: SessionEntry = {
      session_id: `session-${Date.now()}`,
      title: `Chat ${chatSessions.length + 1}`,
      created_at: Math.floor(Date.now() / 1000)
    };
    setChatSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.session_id);
    setMessages([]);
    setInputMessage('');
  };

  const deleteSession = async (sessionId: string) => {
    if (!selectedEndpoint || !agentId) return;

    try {
      await deleteAgentSessionAPI(selectedEndpoint, agentId, sessionId);
      
      // Remove from local state
      setChatSessions(prev => prev.filter(session => session.session_id !== sessionId));
      
      // If deleted session was current, switch to first available or create new
      if (currentSessionId === sessionId) {
        const remainingSessions = chatSessions.filter(session => session.session_id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].session_id);
        } else {
          setCurrentSessionId('');
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  if (!selectedEndpoint) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Endpoint Selected</h3>
            <p className="text-muted-foreground text-center">
              Please select an endpoint in the playground to chat with agents.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingAgent) {
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

  if (error || !agent) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <Bot className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Agent Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error || 'The requested agent could not be found.'}
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
    <div className="flex h-[calc(100vh-80px)] bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/agents')}
              className="hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{agent.name}</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  {agent.status || 'online'}
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

        <div className="p-4">
          <Button 
            onClick={createNewSession} 
            size="sm" 
            className="w-full gradient-primary text-white mb-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="p-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Chat History</h4>
          <div className="space-y-2">
            {isLoadingSessions ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Loading chat history...</p>
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No chat history</p>
              </div>
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentSessionId === session.session_id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleSessionClick(session.session_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.title}</p>
                                              <p className="text-xs opacity-70">
                          {session.created_at ? new Date(session.created_at * 1000).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.session_id);
                      }}
                      className="h-6 w-6 p-0 hover:bg-muted-foreground/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Chat with {agent.name}</h2>
              <p className="text-sm text-muted-foreground">
                {currentSessionId === '' ? 'New conversation' : `Conversation in session: ${currentSessionId}`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="hover:bg-muted/50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-muted/50"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground">
                  Send a message to begin chatting with {agent.name}
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'gradient-primary text-white'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className={`rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center space-x-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="gradient-primary text-white hover:shadow-glow"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChatPage;
