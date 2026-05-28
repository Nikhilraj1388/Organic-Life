import React, { createContext, useContext, useReducer, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  quantity: number;
  selectedQuantityOption: { label: string; value: number };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: Omit<CartItem, "quantity"> & { quantity?: number };
    }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

const initialState: CartState = {
  items: [],
  isOpen: false,
};

function init(initial: CartState) {
  try {
    const saved = localStorage.getItem("organic-life-cart");
    if (saved) {
      return JSON.parse(saved) as CartState;
    }
  } catch (e) {
    console.error("Failed to parse cart from localStorage", e);
  }
  return initial;
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? {
                  ...item,
                  quantity: item.quantity + (action.payload.quantity || 1),
                }
              : item,
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, quantity: action.payload.quantity || 1 },
        ],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: Math.max(0, action.payload.quantity) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };
    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      };
    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, init);
  const API_BASE = (import.meta as any).env.VITE_API_URL || "";

  // Debounced save to localStorage whenever state changes
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        // Save to per-user key if user is known via lastSavedUserId, else to generic key
        const lastSavedUser = localStorage.getItem("organic-life-last-user");
        const key = lastSavedUser
          ? `organic-life-cart:${lastSavedUser}`
          : "organic-life-cart";
        localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [state]);

  // Sync cart to server for a given userId
  const syncCartToServer = async (userId?: string) => {
    try {
      if (!userId) return;
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const payload = { cart: state };
      await fetch(`${API_BASE}/api/cart/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      // store last user id so we save to per-user key
      localStorage.setItem("organic-life-last-user", userId);
      // move generic cart to per-user key
      localStorage.setItem(
        `organic-life-cart:${userId}`,
        JSON.stringify(state),
      );
    } catch (e) {
      console.error("Failed to sync cart to server", e);
    }
  };

  // Listen for auth changes via custom event to trigger sync
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        if (detail && detail.user && detail.user.id) {
          syncCartToServer(detail.user.id);
        }
      } catch (err) {
        console.error("Failed handling auth-changed event", err);
      }
    };
    window.addEventListener("organic:auth-changed", handler as EventListener);
    return () =>
      window.removeEventListener(
        "organic:auth-changed",
        handler as EventListener,
      );
  }, [state]);

  const addItem = (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
  ) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const openCart = () => {
    dispatch({ type: "OPEN_CART" });
  };

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
