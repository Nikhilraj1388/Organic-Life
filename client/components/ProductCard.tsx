import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  inStock?: boolean;
  quantityOptions?: { label: string; value: number }[];
}

export default function ProductCard({
  id,
  name,
  price,
  image = "/placeholder.svg",
  category,
  inStock = true,
  quantityOptions = [{ label: "1kg", value: 1 }],
}: ProductCardProps) {
  const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  const { addItem } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  // Ensure quantityOptions has at least one option
  const validQuantityOptions = quantityOptions && quantityOptions.length > 0 ? quantityOptions : [{ label: "1kg", value: 1 }];
  const [selectedOption, setSelectedOption] = useState(validQuantityOptions[0]);

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price: price * selectedOption.value,
      image,
      category,
      quantity: selectedQuantity,
      selectedQuantityOption: selectedOption,
    });
    toast.success(`${name} added to cart!`);
  };

  const increaseQuantity = () => {
    setSelectedQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setSelectedQuantity((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="w-full max-w-72 h-[32rem] bg-white border-2 border-organic-black rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-[1.02] relative">
      {/* Out of Stock Overlay */}
      {!inStock && (
        <div className="absolute inset-0 bg-gray-100/60 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-acme text-base shadow-lg transform rotate-12">
            Out of Stock
          </div>
        </div>
      )}

      <div
        className={`w-full h-full flex flex-col ${!inStock ? "opacity-40" : ""}`}
      >
        {/* Image Section */}
        <div className="relative h-44 bg-gradient-to-br from-organic-cream to-organic-cream/80 flex items-center justify-center p-4">
          <div className="w-28 h-28 bg-white/80 rounded-full flex items-center justify-center border-3 border-organic-brown/30 shadow-lg group-hover:shadow-xl transition-shadow">
            <img
              src={image}
              alt={name}
              className="w-20 h-20 opacity-60 group-hover:opacity-80 transition-opacity"
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute top-2 right-2 w-3 h-3 bg-organic-brown/20 rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-organic-brown/30 rounded-full"></div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-5">
          {/* Product Info */}
          <div className="text-center mb-4">
            <h3 className="font-acme text-xl text-organic-brown mb-2 line-clamp-2 group-hover:text-organic-black transition-colors leading-tight">
              {name}
            </h3>
            <p className="text-organic-brown/60 text-sm font-medium uppercase tracking-wide">
              {category}
            </p>
          </div>

          {/* Price Display */}
          <div className="text-center mb-5">
            <div className="inline-block bg-organic-brown text-white px-4 py-2 rounded-full font-acme text-2xl shadow-md">
              {inrFormatter.format(price * selectedOption.value)}
            </div>
          </div>

          {/* Controls Section */}
          <div className="mt-auto space-y-4">
            {/* Quantity Options */}
            {validQuantityOptions.length > 1 && (
              <div className="relative">
                <select
                  value={selectedOption.value}
                  onChange={(e) => {
                    const option = validQuantityOptions.find(
                      (opt) => opt.value === Number(e.target.value),
                    );
                    if (option) setSelectedOption(option);
                  }}
                  className="w-full bg-organic-cream border-2 border-organic-brown/40 rounded-lg px-3 py-2 text-sm font-acme text-organic-brown appearance-none cursor-pointer hover:bg-organic-cream/80 transition-colors"
                  disabled={!inStock}
                >
                  {validQuantityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-organic-brown"></div>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-organic-cream/50 rounded-lg p-2">
              <button
                onClick={decreaseQuantity}
                className="w-10 h-10 bg-organic-brown text-white rounded-lg flex items-center justify-center hover:bg-organic-black transition-all duration-200 hover:scale-110 shadow-md"
                disabled={!inStock}
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="flex-1 text-center">
                <span className="font-acme text-xl text-organic-brown bg-white px-4 py-1 rounded-md border-2 border-organic-brown/30">
                  {selectedQuantity}
                </span>
              </div>

              <button
                onClick={increaseQuantity}
                className="w-10 h-10 bg-organic-brown text-white rounded-lg flex items-center justify-center hover:bg-organic-black transition-all duration-200 hover:scale-110 shadow-md"
                disabled={!inStock}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-organic-brown to-organic-black text-white py-3 rounded-lg font-acme text-base hover:from-organic-black hover:to-organic-brown transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={!inStock}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
