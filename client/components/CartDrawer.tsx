import React from "react";
import { useCart } from "../contexts/CartContext";
import { X } from "lucide-react";
import CartItemRow from "./CartItemRow";
import { Link } from "react-router-dom";

export default function CartDrawer() {
  const { state, closeCart, getTotalPrice } = useCart();

  if (!state.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l-2 border-organic-brown p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-acme text-lg text-organic-brown">Your Cart</h3>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-2 rounded-md hover:bg-organic-cream"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[70vh] mb-4">
          {state.items.length === 0 ? (
            <div className="text-center text-organic-brown/70">
              Your cart is empty.
            </div>
          ) : (
            state.items.map((item) => (
              <CartItemRow
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                image={item.image}
                category={item.category}
                quantity={item.quantity}
                selectedQuantityLabel={item.selectedQuantityOption?.label}
              />
            ))
          )}
        </div>

        <div className="border-t border-organic-brown/20 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-acme text-base text-organic-brown">
              Total:
            </span>
            <span className="font-acme text-lg text-organic-brown">
              ₹{getTotalPrice().toFixed(2)}
            </span>
          </div>

          <Link
            to="/checkout"
            onClick={closeCart}
            className="w-full block bg-organic-brown text-white py-3 rounded-lg text-center font-acme"
          >
            Proceed to Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
