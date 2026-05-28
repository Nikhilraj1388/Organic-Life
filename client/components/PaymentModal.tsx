import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { getAuthToken } from "../lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "./ui/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  total: number;
  paymentMethod: 'online' | 'cod';
}

export default function PaymentModal({ isOpen, onClose, items, total, paymentMethod }: PaymentModalProps) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const API_BASE = (import.meta as any).env.VITE_API_URL || "";

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const createRazorpayOrderMutation = useMutation({
    mutationFn: async () => {
  const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/orders/create-razorpay-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ total }),
      });
      if (!response.ok) throw new Error("Failed to create Razorpay order");
      return response.json();
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (paymentData?: { paymentId: string; razorpayOrderId: string }) => {
  const token = getAuthToken();
      
      const orderPayload = {
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
        })),
        total,
        paymentMethod,
        paymentId: paymentData?.paymentId || 'COD',
        razorpayOrderId: paymentData?.razorpayOrderId || 'COD',
      };
      
      console.log('Creating order with payload:', JSON.stringify(orderPayload, null, 2));
      
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        throw new Error("Failed to create order");
      }
      
      const result = await response.json();
      console.log('Order created successfully:', result);
      return result;
    },
    onSuccess: () => {
      toast({ title: "Payment successful!", description: "Your order has been placed." });
      clearCart();
      onClose();
      navigate("/order-history");
    },
    onError: () => {
      toast({ title: "Order creation failed", description: "Please contact support.", variant: "destructive" });
    },
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Handle COD orders directly
    if (paymentMethod === 'cod') {
      try {
        await createOrderMutation.mutateAsync();
      } catch (error) {
        console.error("COD order creation failed:", error);
        toast({ title: "Order failed", description: "Please try again.", variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
      return;
    }
    
    // Handle online payment
    try {
      const orderData = await createRazorpayOrderMutation.mutateAsync();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Organic Life",
        description: "Payment for your order",
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            await createOrderMutation.mutateAsync({
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
            });
          } catch (error) {
            console.error("Order creation failed:", error);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initialization failed:", error);
      toast({ title: "Payment failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {paymentMethod === 'cod' ? 'Confirm Order' : 'Razorpay - Secure Payment'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center font-bold">Total: ₹{total.toFixed(2)}</div>
          {paymentMethod === 'cod' && (
            <p className="text-sm text-center text-gray-600">
              Pay ₹{total.toFixed(2)} in cash when your order is delivered
            </p>
          )}
          <Button onClick={handlePayment} className="w-full" disabled={isProcessing}>
            {isProcessing ? "Processing..." : paymentMethod === 'cod' ? 'Confirm Order' : 'Pay with Razorpay'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
