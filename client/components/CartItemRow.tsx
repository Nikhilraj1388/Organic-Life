import React from "react";
import { useCart } from "../contexts/CartContext";

interface Props {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  quantity: number;
  selectedQuantityLabel?: string;
}

export default function CartItemRow({
  id,
  name,
  price,
  image,
  category,
  quantity,
  selectedQuantityLabel,
}: Props) {
  const { updateQuantity, removeItem } = useCart();

  const dec = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(id, Math.max(0, quantity - 1));
  };

  const inc = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(id, quantity + 1);
  };

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeItem(id);
  };

  return (
    <div className="flex items-center gap-3 p-2 border border-organic-brown/10 rounded-md">
      <img
        src={image || "/placeholder.svg"}
        alt={name}
        className="w-16 h-16 object-cover rounded-md"
      />
      <div className="flex-1">
        <div className="font-medium text-organic-brown">{name}</div>
        {selectedQuantityLabel && (
          <div className="text-sm text-organic-brown/60">
            {selectedQuantityLabel}
          </div>
        )}
        <div className="text-sm text-organic-brown/80">₹{price.toFixed(2)}</div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={dec}
            aria-label="Decrease"
            className="px-2 py-1 bg-organic-cream rounded"
          >
            -
          </button>
          <div className="w-6 text-center">{quantity}</div>
          <button
            onClick={inc}
            aria-label="Increase"
            className="px-2 py-1 bg-organic-cream rounded"
          >
            +
          </button>
        </div>
        <button onClick={onRemove} className="text-xs text-red-500">
          Remove
        </button>
      </div>
    </div>
  );
}
