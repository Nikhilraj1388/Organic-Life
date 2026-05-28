import { useCart } from "../contexts/CartContext";
import { useState } from "react";
import PaymentModal from "../components/PaymentModal";
// Header and Footer provided by Layout
import { Trash, Plus, Minus, ShoppingBag, Wallet, Banknote } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Checkout() {
  const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  const {
    state: { items },
    removeItem,
    updateQuantity,
    getTotalPrice,
  } = useCart();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  
  const deliveryCharge = 50;
  const codCharge = paymentMethod === 'cod' ? 20 : 0;
  const finalTotal = getTotalPrice() + deliveryCharge + codCharge;

  const handleRemove = (id: string) => {
    removeItem(id);
  };

  const handleIncrease = (item: any) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = (item: any) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <ShoppingBag className="w-8 h-8 text-organic-brown mr-3" />
          <h1 className="font-acme text-4xl text-organic-brown">Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-organic-cream/20 border-2 border-organic-brown rounded-xl">
            <ShoppingBag className="w-16 h-16 text-organic-brown/50 mx-auto mb-4" />
            <p className="font-acme text-2xl text-organic-brown mb-4">
              Your cart is empty
            </p>
            <p className="text-organic-brown/70 mb-6">
              Add some fresh organic products to get started!
            </p>
            <Link
              to="/marketplace"
              className="bg-organic-brown text-white px-8 py-4 rounded-lg font-acme text-lg hover:bg-organic-black transition-colors inline-flex items-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-2 mb-6">
                <ShoppingBag className="w-6 h-6 text-organic-brown" />
                <h2 className="font-acme text-3xl text-organic-brown">
                  Cart Items ({items.length})
                </h2>
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-organic-brown rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg border-2 border-organic-brown/20 object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-acme text-xl text-organic-brown mb-1">
                        {item.name}
                      </h3>
                      <p className="text-organic-brown/70 text-sm mb-2">
                        {item.selectedQuantityOption.label}
                      </p>
                      <p className="font-acme text-lg text-organic-brown mb-3">
                        {inrFormatter.format(item.price * item.quantity)}
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-organic-cream/50 rounded-lg p-1">
                          <button
                            onClick={() => handleDecrease(item)}
                            className="w-8 h-8 bg-organic-brown text-white rounded-md flex items-center justify-center hover:bg-organic-black transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-acme text-lg text-organic-brown min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrease(item)}
                            className="w-8 h-8 bg-organic-brown text-white rounded-md flex items-center justify-center hover:bg-organic-black transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-2 rounded-lg hover:bg-red-100 transition-colors group"
                          title="Remove item"
                        >
                          <Trash className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-organic-cream/40 to-white border-2 border-organic-brown rounded-xl p-6 shadow-lg h-fit">
              <div className="flex items-center space-x-2 mb-6">
                <ShoppingBag className="w-6 h-6 text-organic-brown" />
                <h2 className="font-acme text-3xl text-organic-brown">
                  Order Summary
                </h2>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-acme text-lg text-organic-brown">
                  <span>Subtotal ({items.length} items):</span>
                  <span>{inrFormatter.format(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between font-acme text-lg text-organic-brown">
                  <span>Delivery:</span>
                  <span>{inrFormatter.format(deliveryCharge)}</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between font-acme text-lg text-organic-brown">
                    <span>COD Charges:</span>
                    <span>{inrFormatter.format(codCharge)}</span>
                  </div>
                )}
                <div className="border-t-2 border-organic-brown pt-3 flex justify-between font-acme text-xl text-organic-brown">
                  <span>Total:</span>
                  <span>{inrFormatter.format(finalTotal)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6 space-y-3">
                <h3 className="font-acme text-lg text-organic-brown mb-3">Payment Method</h3>
                
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                    paymentMethod === 'online'
                      ? 'border-organic-brown bg-organic-cream/50'
                      : 'border-organic-brown/30 hover:border-organic-brown/50'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-organic-brown" />
                  <div className="flex-1 text-left">
                    <p className="font-acme text-lg text-organic-brown">Online Payment</p>
                    <p className="text-sm text-organic-brown/70">Pay via Razorpay</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    paymentMethod === 'online'
                      ? 'border-organic-brown bg-organic-brown'
                      : 'border-organic-brown/30'
                  }`}>
                    {paymentMethod === 'online' && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                    paymentMethod === 'cod'
                      ? 'border-organic-brown bg-organic-cream/50'
                      : 'border-organic-brown/30 hover:border-organic-brown/50'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-organic-brown" />
                  <div className="flex-1 text-left">
                    <p className="font-acme text-lg text-organic-brown">Cash on Delivery</p>
                    <p className="text-sm text-organic-brown/70">+₹20 extra charges</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    paymentMethod === 'cod'
                      ? 'border-organic-brown bg-organic-brown'
                      : 'border-organic-brown/30'
                  }`}>
                    {paymentMethod === 'cod' && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </button>
              </div>

              <button
                className="w-full bg-gradient-to-r from-organic-brown to-organic-black text-white py-4 rounded-lg font-acme text-xl hover:from-organic-black hover:to-organic-brown transition-all duration-300 shadow-md hover:shadow-lg mb-4"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Proceed to Payment'}
              </button>

              <Link
                to="/marketplace"
                className="w-full bg-white border-2 border-organic-brown text-organic-brown py-3 rounded-lg font-acme text-lg hover:bg-organic-cream transition-colors inline-flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        )}
      </main>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        items={items}
        total={finalTotal}
        paymentMethod={paymentMethod}
      />
    </div>
  );
}
