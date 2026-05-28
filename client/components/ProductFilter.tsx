import { ChevronDown, X } from "lucide-react";

interface CategoryOption { key: string; name: string }

interface ProductFilterProps {
  categories: CategoryOption[];
  selectedCategories: string[]; // array of category keys
  onCategoryChange: (categories: string[]) => void;
}

export default function ProductFilter({
  categories,
  selectedCategories,
  onCategoryChange,
}: ProductFilterProps) {
  const toggleCategory = (categoryKey: string) => {
    const newSelected = selectedCategories.includes(categoryKey)
      ? selectedCategories.filter((cat) => cat !== categoryKey)
      : [...selectedCategories, categoryKey];
    onCategoryChange(newSelected);
  };

  const clearFilters = () => {
    onCategoryChange([]);
  };

  return (
    <div className="w-80 bg-white border-2 border-organic-brown rounded-lg p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-acme text-2xl text-organic-black">Filters</h2>
        <ChevronDown className="w-5 h-5 text-organic-brown" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-acme text-xl text-organic-black">Categories</h3>
          {selectedCategories.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-organic-brown hover:text-organic-black text-sm font-medium flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.key}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-organic-cream/50 transition-colors"
            >
              <input
                type="checkbox"
                id={category.key}
                checked={selectedCategories.includes(category.key)}
                onChange={() => toggleCategory(category.key)}
                className="w-4 h-4 border border-organic-brown rounded focus:ring-organic-brown focus:ring-2 cursor-pointer"
              />
              <label
                htmlFor={category.key}
                className="text-organic-brown cursor-pointer font-medium text-sm"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-6 pt-4 border-t border-organic-brown/20">
          <h4 className="font-acme text-sm text-organic-black mb-2">
            Selected ({selectedCategories.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <span
                key={category}
                className="bg-organic-brown text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
              >
                <span>{category}</span>
                <button
                  onClick={() => toggleCategory(category)}
                  className="hover:bg-organic-black rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
