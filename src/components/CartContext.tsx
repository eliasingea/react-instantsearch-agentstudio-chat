import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  objectID: string;
  name: string;
  price: number;
  brand?: string;
  image?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (objectID: string) => void;
  updateQuantity: (objectID: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.objectID === item.objectID);
      if (existingItem) {
        return prevItems.map((i) =>
          i.objectID === item.objectID
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prevItems, { ...item, quantity }];
    });
  };

  const removeItem = (objectID: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.objectID !== objectID));
  };

  const updateQuantity = (objectID: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(objectID);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.objectID === objectID ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
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
