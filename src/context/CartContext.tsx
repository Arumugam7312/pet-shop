import React, { createContext, useContext, useState, useEffect } from 'react';
import { Pet } from '../types';

interface CartItem extends Pet {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (pet: Pet) => void;
  removeFromCart: (petId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('petshop_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('petshop_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (pet: Pet) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === pet.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === pet.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...pet, quantity: 1 }];
    });
  };

  const removeFromCart = (petId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== petId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
