'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { CartItem, Plugin } from '@/types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (plugin: Plugin) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((plugin: Plugin) => {
    setItems(prev => {
      if (prev.find(item => item.id === plugin.id)) {
        return prev;
      }
      return [...prev, {
        id: plugin.id,
        title: plugin.title,
        author: plugin.author,
        thumbnail: plugin.thumbnail,
      }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((id: string) => {
    return items.some(item => item.id === id);
  }, [items]);

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      toggleCart,
      openCart,
      closeCart,
      itemCount: items.length,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
