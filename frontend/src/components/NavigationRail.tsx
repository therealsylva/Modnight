'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Home, TrendingUp, ShoppingCart, Palette } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';
import { useApp } from './AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}

export default function NavigationRail() {
  const { activeNav, setActiveNav } = useApp();
  const { itemCount, toggleCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const navItems: NavItem[] = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home,
      onClick: () => setActiveNav('home'),
    },
    { 
      id: 'trending', 
      label: 'Trending', 
      icon: TrendingUp,
      onClick: () => setActiveNav('trending'),
    },
  ];

  return (
    <motion.div
      className="fixed left-0 top-0 h-screen border-r border-border bg-[#0F0F10] z-40 hidden md:flex"
      initial={{ width: '60px' }}
      animate={{ width: isExpanded ? '200px' : '60px' }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav className="flex flex-col h-full py-4">
        <div className="px-3 mb-8">
          <img 
            src="/logo.svg" 
            alt="Logo" 
            className="h-9 w-9"
          />
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={item.onClick}
              className={`
                relative flex items-center gap-3 px-4 py-3 transition-colors
                ${activeNav === item.id 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
              `}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence>
                {activeNav === item.id && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-foreground"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    className="font-medium text-sm whitespace-nowrap"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}

          <motion.button
            onClick={toggleCart}
            className={`
              relative flex items-center gap-3 px-4 py-3 transition-colors
              ${activeNav === 'queue' 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }
            `}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-foreground text-background text-[10px] font-bold flex items-center justify-center rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key={itemCount}
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  className="font-medium text-sm whitespace-nowrap"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  Queue{itemCount > 0 ? ` (${itemCount})` : ''}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={() => router.push('/become-a-creator')}
            className="relative flex items-center gap-3 px-4 py-3 transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Palette className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  className="font-medium text-sm whitespace-nowrap"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  Become a Creator
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>


      </nav>
    </motion.div>
  );
}
