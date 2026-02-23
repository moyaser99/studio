
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: any;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  updateQuantity: (productId: string, delta: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('app-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('app-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product: any) => {
    setCartItems((prevItems) => {
      // Check for same ID AND same color variant to avoid merging different colors
      const existingItemIndex = prevItems.findIndex((item) => 
        item.id === product.id && 
        item.selectedColor?.id === product.selectedColor?.id
      );
      
      const getCalculatedPrice = () => {
        if (product.discountType === 'permanent' && product.discountPrice) {
          return product.discountPrice;
        }
        if (product.discountType === 'timed' && product.discountPrice && product.discountEndDate) {
          const targetDate = product.discountEndDate.toDate ? product.discountEndDate.toDate().getTime() : new Date(product.discountEndDate).getTime();
          if (new Date().getTime() < targetDate) {
            return product.discountPrice;
          }
        }
        if (product.discountPercentage && product.discountPercentage > 0) {
          return product.price * (1 - product.discountPercentage / 100);
        }
        return product.price || 0;
      };

      const finalPrice = getCalculatedPrice();

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
          price: finalPrice,
          image: product.image || product.imageUrl // Update image to latest choice if matched
        };
        return newItems;
      }
      
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          nameEn: product.nameEn,
          price: finalPrice,
          image: product.image || product.imageUrl,
          quantity: 1,
          selectedColor: product.selectedColor
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number, variantId?: string) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === productId && (variantId === undefined || item.selectedColor?.id === variantId)
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => 
        !(item.id === productId && (variantId === undefined || item.selectedColor?.id === variantId))
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart, 
      totalItems, 
      totalPrice,
      isInitialized 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
