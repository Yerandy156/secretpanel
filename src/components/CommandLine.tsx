import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, Terminal, AlertTriangle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Command {
  input: string;
  output: string;
  error?: boolean;
  html?: boolean;
}

const AVAILABLE_COMMANDS = [
  { cmd: '$guest_mode', desc: 'Enter guest mode' },
  { cmd: '$help', desc: 'Show available commands' },
  { cmd: '$clear', desc: 'Clear terminal' },
  { cmd: '$exit', desc: 'Exit terminal' },
  { cmd: '$status', desc: 'Show system status' },
  { cmd: '$whoami', desc: 'Show current user info' },
  { cmd: '$users', desc: 'List all users' },
  { cmd: '$posts', desc: 'Show recent posts' },
  { cmd: '$time', desc: 'Show current time' },
  { cmd: '$version', desc: 'Show system version' },
  { cmd: '$about', desc: 'About SecureNexus' },
  { cmd: '$matrix', desc: 'Toggle matrix effect' },
];

export default function CommandLine({ onClose }: { onClose: () => void }) {
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showMatrix, setShowMatrix] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [commands]);

  const addCommand = (input: string, output: string, error = false, html = false) => {
    setCommands(prev => [...prev, { input, output, error, html }]);
    setCommandHistory(prev => [...prev, input]);
    setHistoryIndex(-1);
  };

  const handleCommand = async (input: string) => {
    const command = input.trim().toLowerCase();
    
    let output = '';
    let error = false;
    let html = false;

    switch (command) {
      case '$guest_mode':
        try {
          await login('$guest_mode', '');
          output = 'Entering guest mode...';
          setTimeout(onClose, 1000);
        } catch {
          output = 'Failed to enter guest mode';
          error = true;
        }
        break;

      case '$help':
        output = AVAILABLE_COMMANDS.map(cmd => 
          `${cmd.cmd.padEnd(15)} - ${cmd.desc}`
        ).join('\n');
        break;

      case '$clear':
        setCommands([]);
        return;

      case '$exit':
        onClose();
        return;

      case '$status':
        output = `
System Status:
-------------
Status: Online
Uptime: ${Math.floor(Math.random() * 24)} hours
Memory: ${Math.floor(Math.random() * 100)}% used
CPU: ${Math.floor(Math.random() * 100)}% utilized
Active Users: ${Math.floor(Math.random() * 50)}
`;
        break;

      case '$whoami':
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        output = `
Current User Information:
-----------------------
ID: ${user.id || 'Not logged in'}
Agent: ${user.agentId || 'Anonymous'}
Display Name: ${user.displayName || 'Unknown'}
Role: ${user.isCEO ? 'Administrator' : 'Standard User'}
`;
        break;

      case '$users':
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        output = users.map((u: any) => 
          `${u.displayName} (@${u.agentId})${u.isCEO ? ' [ADMIN]' : ''}`
        ).join('\n');
        break;

      case '$posts':
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        output = posts.slice(0, 5).map((p: any) => 
          `[${new Date(p.timestamp).toLocaleString()}] ${p.authorName}: ${p.content.substring(0, 50)}...`
        ).join('\n');
        break;

      case '$time':
        output = new Date().toLocaleString();
        break;

      case '$version':
        output = 'SecureNexus Terminal v2.0.0';
        break;

      case '$about':
        output = `
███████╗███████╗ ██████╗██╗   ██╗██████╗ ███████╗███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██╔════╝████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
███████╗█████╗  ██║     ██║   ██║██████╔╝█████╗  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
███████║███████╗╚██████╗╚██████╔╝██║  ██║███████╗██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝

SecureNexus Terminal v2.0.0
Copyright © 2024 SecureNexus Corporation
All rights reserved.

A state-of-the-art command-line interface for secure communication and system management.
`;
        break;

      case '$matrix':
        setShowMatrix(!showMatrix);
        output = showMatrix ? 'Matrix effect disabled' : 'Matrix effect enabled';
        break;

      default:
        if (command.startsWith('$')) {
          output = `Command not found: ${input}. Type $help for available commands.`;
          error = true;
        } else {
          output = `Invalid command format. Commands must start with $. Type $help for help.`;
          error = true;
        }
    }

    addCommand(input, output, error, html);
    setCurrentInput('');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentInput) {
      handleCommand(currentInput);
    } else if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length === 1) {
        setCurrentInput(suggestions[0]);
        setSuggestions([]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);

    if (value.startsWith('$')) {
      const matches = AVAILABLE_COMMANDS
        .map(cmd => cmd.cmd)
        .filter(cmd => cmd.startsWith(value));
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative">
      {showMatrix && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="animate-matrix text-purple-500 opacity-20 font-mono text-sm">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="whitespace-nowrap">
                {Array.from({ length: 50 }).map((_, j) => (
                  <span key={j}>{String.fromCharCode(33 + Math.random() * 93)}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-black/95 rounded-xl border border-purple-500/20 p-4 font-mono text-sm h-[60vh] flex flex-col relative">
        <div className="flex-1 overflow-auto space-y-2">
          <div className="text-purple-400 mb-4">
            Welcome to SecureNexus Terminal v2.0.0
            Type $help to see available commands
          </div>

          <AnimatePresence initial={false}>
            {commands.map((cmd, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                <div className="flex items-center space-x-2 text-purple-400">
                  <ChevronRight size={16} />
                  <span className="font-bold">{cmd.input}</span>
                </div>
                <div 
                  className={`ml-6 font-mono whitespace-pre-wrap ${
                    cmd.error ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {cmd.error && (
                    <div className="flex items-center space-x-2 mb-1 text-red-400">
                      <AlertTriangle size={14} />
                      <span>Error:</span>
                    </div>
                  )}
                  {cmd.html ? (
                    <div dangerouslySetInnerHTML={{ __html: cmd.output }} />
                  ) : (
                    cmd.output
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endOfMessagesRef} />
        </div>

        <div className="relative mt-4">
          {suggestions.length > 0 && (
            <div className="absolute bottom-full mb-2 bg-gray-900 border border-purple-500/20 rounded-lg p-2 w-full">
              {suggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className="px-2 py-1 hover:bg-purple-500/20 cursor-pointer rounded text-purple-400"
                  onClick={() => {
                    setCurrentInput(suggestion);
                    setSuggestions([]);
                    inputRef.current?.focus();
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-purple-400 border-t border-purple-500/20 pt-4">
            <ChevronRight size={16} />
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-purple-400 placeholder-purple-900"
              placeholder="Enter command..."
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
