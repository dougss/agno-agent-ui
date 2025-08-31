'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Settings, 
  Home,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';

const Header = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Playground' },
    { href: '/agents', icon: Users, label: 'Agents' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Logo variant="full" />
          </motion.div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`
                      flex items-center space-x-2 transition-all duration-200
                      ${isActive(item.href) 
                        ? 'bg-gradient-primary text-white shadow-glow' 
                        : 'hover:bg-muted/50'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Status Indicator */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse agent-status-online"></div>
            <span className="text-sm text-muted-foreground hidden sm:inline">System Online</span>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
