import { Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
// Header and Footer provided by Layout
import ProductFilter from "../components/ProductFilter";
import ProductCard from "../components/ProductCard";

interface QuantityOption {
  label: string;
  value: number; // multiplier for base price
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  categoryKey?: string;
  image?: string;
  inStock: boolean;
  quantityOptions: QuantityOption[];
}

export default function Marketplace() {
  const API_BASE = (import.meta as any).env.VITE_API_URL || "";
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const qParam = params.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("name-asc");

  const itemsPerPage = 12;

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories, sortBy]);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{key:string,name:string}>>([]);
  const [categoriesDerived, setCategoriesDerived] = useState(false);
  const [derivedBannerVisible, setDerivedBannerVisible] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch products first, then categories. If categories API returns empty or fails,
    // derive categories from the fetched products so the filter list is populated.
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let fetchedProducts: any[] = [];
        try {
          console.log('Marketplace: fetching /api/products');
          const response = await fetch(`${API_BASE}/api/products`);
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          const data = await response.json();
          console.log('Marketplace: received products count', Array.isArray(data) ? data.length : 0);
          setProducts(data);
          fetchedProducts = Array.isArray(data) ? data : [];
        } catch (error) {
          console.error("Failed to fetch products", error);
          setError("Failed to load products. Please try again.");
          fetchedProducts = [];
        }

        try {
          const res = await fetch(`${API_BASE}/api/categories`);
          if (res.ok) {
            const cats = await res.json();
            if (Array.isArray(cats) && cats.length > 0) {
              setCategories(cats.map((c: any) => ({ key: c.key, name: c.name })));
              return;
            }
          }
          // If API returned empty or non-ok, fall through to derive from products
        } catch (err) {
          console.warn('Failed to fetch categories', err);
        }

        // Derive categories from fetched products as a fallback
        try {
          const map = new Map<string, { key: string; name: string }>();
          fetchedProducts.forEach((p) => {
            const name = p.category ?? '';
            const key = (p as any).categoryKey ?? (name ? String(name).trim().toLowerCase() : '');
            if (!key) return;
            if (!map.has(key)) map.set(key, { key, name });
          });
          const derived = Array.from(map.values());
          setCategories(derived as any);
          // Record that we derived categories (UI may show admin-only banner)
          if (derived.length > 0) setCategoriesDerived(true);
        } catch (err) {
          console.warn('Failed to derive categories from products', err);
          setCategories([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Filtered and sorted products based on search, categories, and sort
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const productKey = product.categoryKey ?? (product.category ? String(product.category).trim().toLowerCase() : undefined);
      const matchesCategory =
        selectedCategories.length === 0 ||
        (productKey && selectedCategories.includes(productKey));
      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategories, sortBy]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-xl text-organic-brown font-acme">Loading marketplace...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-8">
            <p className="text-red-700 font-acme">❌ {error}</p>
          </div>
        )}

        {/* Main content (only show when not loading) */}
        {!isLoading && (
        <>
        {/* Admin-only banner when categories are derived */}
        {user?.role === 'admin' && categoriesDerived && derivedBannerVisible && (
          <div className="fixed top-6 right-6 z-50">
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded shadow">
              <div className="text-sm">Categories are being derived from product data — the categories API returned no results.</div>
              <button className="ml-2 text-sm underline" onClick={() => setDerivedBannerVisible(false)}>Dismiss</button>
            </div>
          </div>
        )}
        {/* Hero Banner */}
        <div className="mb-12">
          <div className="w-full h-80 bg-gradient-to-br from-organic-cream to-white border-2 border-organic-black rounded-xl relative overflow-hidden shadow-lg">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-organic-cream/20 to-transparent"></div>

            {/* Decorative elements */}
            <div className="absolute top-6 left-6 text-5xl opacity-15">🥦</div>
            <div className="absolute top-8 right-8 text-4xl opacity-15">🍎</div>
            <div className="absolute bottom-6 left-8 text-6xl opacity-15">
              🥬
            </div>
            <div className="absolute bottom-8 right-6 text-4xl opacity-15">
              🥕
            </div>

            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <h1 className="font-acme text-5xl text-organic-brown mb-3 drop-shadow-sm">
                  Organic Marketplace
                </h1>
                <p className="text-lg text-organic-brown/80 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Delhi's freshest organic products delivered to your door
                </p>
                <div className="flex items-center justify-center space-x-8 text-base text-organic-brown/70">
                  <span>🚚 Free delivery above ₹499</span>
                  <span>📞 Call: +91 11 4567 8901</span>
                  <span>⏰ Mon-Sun: 8AM-8PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className="flex-shrink-0">
            <ProductFilter
              categories={categories.length ? categories : Array.from(new Set(products.map((p) => p.category))).map((n: any) => ({ key: String(n).trim().toLowerCase(), name: n }))}
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar and Sort */}
            <div className="bg-gradient-to-r from-organic-cream/50 to-white border-2 border-organic-brown rounded-xl p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <span className="font-acme text-3xl text-organic-black">
                      🔍
                    </span>
                    <span className="font-acme text-2xl text-organic-black">
                      Search
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-80 bg-white border-2 border-organic-brown rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-organic-brown focus:border-organic-brown transition-all font-acme text-lg"
                      placeholder="Search products..."
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-organic-brown" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-acme text-xl text-organic-black">
                      Sort by:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white border-2 border-organic-brown rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-organic-brown focus:border-organic-brown transition-all font-acme text-base"
                    >
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="price-asc">Price Low-High</option>
                      <option value="price-desc">Price High-Low</option>
                    </select>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center space-x-2">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 font-acme text-lg rounded-lg border-2 transition-all ${
                        currentPage === page
                          ? "bg-organic-brown text-white border-organic-brown shadow-md"
                          : "bg-white text-organic-black border-organic-brown hover:bg-organic-cream hover:shadow-sm"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Empty state */}
            {paginatedProducts.length === 0 && filteredProducts.length === 0 && products.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-96 text-center">
                <div className="text-6xl mb-4">🌱</div>
                <h2 className="text-2xl font-acme text-organic-brown mb-2">No Products Found</h2>
                <p className="text-organic-brown/70">Check back soon for fresh organic products!</p>
              </div>
            )}

            {/* Filtered but no results state */}
            {paginatedProducts.length === 0 && filteredProducts.length === 0 && products.length > 0 && (
              <div className="flex flex-col items-center justify-center min-h-96 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-acme text-organic-brown mb-2">No Results Found</h2>
                <p className="text-organic-brown/70">Try adjusting your filters or search terms</p>
              </div>
            )}

            {/* Product Grid */}
            {paginatedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="flex justify-center">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    category={product.category}
                    image={product.image}
                    inStock={product.inStock}
                    quantityOptions={product.quantityOptions}
                  />
                </div>
              ))}
            </div>
            )}

            {/* Removed dev-only raw JSON dump */}

            {/* Bottom Pagination */}
            {paginatedProducts.length > 0 && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 font-acme text-xl ${
                      currentPage === page
                        ? "text-organic-brown font-bold"
                        : "text-organic-black"
                    } hover:text-organic-brown transition-colors`}
                    style={{
                      WebkitTextStrokeWidth: "1px",
                      WebkitTextStrokeColor: "#59452C",
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
