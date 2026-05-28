import { useCart, CartItem } from "../contexts/CartContext";
import { X, Plus, Minus, Trash } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CartSidebar() {
  const navigate = useNavigate();
  const {
    state: { items, isOpen },
    toggleCart,
    removeItem,
    updateQuantity,
    getTotalPrice,
    closeCart,
  } = useCart();

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        closeCart();
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast(`${name} removed from cart.`);
  };

  const handleIncrease = (item: CartItem) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      handleRemove(item.id, item.name);
    }
  };

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white border-l-4 border-organic-brown shadow-lg z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b-2 border-organic-brown">
        <h2 className="font-acme text-3xl text-organic-brown">Your Cart</h2>
        <button
          onClick={toggleCart}
          aria-label="Close cart"
          className="p-2 rounded-md hover:bg-organic-cream transition-colors"
        >
          <X className="w-6 h-6 text-organic-brown" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <p className="text-organic-brown font-acme text-lg text-center mt-10">
            Your cart is empty.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 border-b border-organic-brown/30 pb-4"
            >
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-16 h-16 rounded-lg border-2 border-organic-brown/20"
              />
              <div className="flex-1">
                <h3 className="font-acme text-lg text-organic-brown">
                  {item.name}
                </h3>
                <p className="text-organic-brown/70 text-sm">
                  {item.selectedQuantityOption.label}
                </p>
                <p className="font-acme text-base text-organic-brown">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => handleDecrease(item)}
                    className="w-8 h-8 bg-organic-brown text-white rounded-lg flex items-center justify-center hover:bg-organic-black transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-acme text-lg text-organic-brown min-w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrease(item)}
                    className="w-8 h-8 bg-organic-brown text-white rounded-lg flex items-center justify-center hover:bg-organic-black transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.id, item.name)}
                    className="ml-4 p-1 rounded-md hover:bg-red-100 transition-colors"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t-2 border-organic-brown">
        <div className="flex justify-between font-acme text-xl text-organic-brown mb-4">
          <span>Total:</span>
          <span>₹{getTotalPrice().toFixed(2)}</span>
        </div>
        <button
          className="w-full bg-organic-brown text-white py-3 rounded-lg font-acme text-lg hover:bg-organic-black transition-colors"
          onClick={() => {
            closeCart();
            navigate('/checkout');
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
