import { useCart } from './CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { EXPERIMENTAL_Autocomplete } from 'react-instantsearch';
import { ALGOLIA_INDEX_NAME, ALGOLIA_INDEX_NAME_SUGGESTIONS } from '../config/algolia';
import 'instantsearch.css/themes/satellite.css';

interface Subcategory {
  label: string;
  path: string;
}

interface CategoryDropdownProps {
  label: string;
  category: string;
  subcategories: Subcategory[];
}



function CategoryDropdown({ label, category, subcategories }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link 
        to={`/categories/${category}`} 
        className="hover:text-neutral-300 transition-colors inline-flex items-center gap-1 py-2"
      >
        {label}
        {subcategories.length > 0 && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </Link>
      
      {/* Dropdown Menu */}
      {isOpen && subcategories.length > 0 && (
        <div className="absolute top-full left-0 pt-0 w-56 bg-white text-black shadow-lg border border-neutral-200 z-50">
          <div className="py-2">
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory.path}
                to={`/categories/${encodeURIComponent(subcategory.path)}`}
                className="block px-4 py-2 text-sm hover:bg-neutral-100 transition-colors"
              >
                {subcategory.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Define your category structure here
const CATEGORIES = {
  women: [
    { label: 'Clothing', path: 'Women > Clothing' },
    { label: 'Shoes', path: 'Women > Shoes' },
    { label: 'Bags', path: 'Women > Bags' },
  ],
  men: [
    { label: 'Clothing', path: 'Men > Clothing' },
    { label: 'Shoes', path: 'Men > Shoes' },
  ],
  accessories: [
    { label: 'Women', path: 'Accessories > Women' },
    { label: 'Men', path: 'Accessories > Men' },
  ],
};

export function Header() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <header className="bg-black text-white">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="flex items-center justify-between py-6 border-b border-neutral-800">
          <div className="flex items-center space-x-12">
            <h1 className="text-2xl font-light tracking-[0.2em] uppercase">
              <Link to="/" className="hover:text-neutral-300 transition-colors">ATELIER</Link>
            </h1>
            <nav className="hidden md:flex space-x-8 text-sm tracking-wider">
              <CategoryDropdown label="WOMEN" category="Women" subcategories={CATEGORIES.women} />
              <CategoryDropdown label="MEN" category="Men" subcategories={CATEGORIES.men} />
              <CategoryDropdown label="ACCESSORIES" category="Accessories" subcategories={CATEGORIES.accessories} />
            </nav>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
             <EXPERIMENTAL_Autocomplete
              placeholder="Search products..."
              getSources={({ query }) => {
                // Only return sources if there's actual query input
                if (!query) return [];
                return undefined as any; // Let default behavior take over when there is a query
              }}
              classNames={{
                root: 'relative z-50',
                item: 'px-4 py-3 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0',
              }}
              panelComponent={({ elements }) => (
             <div className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Suggestions Column - Left */}
                <div className="border-r border-gray-200 pr-4">
                  {elements.suggestions}
                </div>

                {/* Products Column - Right */}
                <div className="pl-4">
                  {elements[ALGOLIA_INDEX_NAME]}
                </div>
              </div>
            </div>
              )}
              indices={[
                {
                  indexName: ALGOLIA_INDEX_NAME,
                  headerComponent: () => (
                    <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200">
                      <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
                        Products
                      </span>
                    </div>
                  ),
                  itemComponent: ({ item, onSelect }) => (
                    <div 
                      onClick={onSelect}
                      className="flex items-center gap-4"
                    >
                      {item.primary_image && (
                        <img 
                          src={item.primary_image} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name}</div>
                        {item.brand && (
                          <div className="text-xs text-neutral-500">{item.brand}</div>
                        )}
                      </div>
                      {item.price?.value && (
                        <div className="text-sm font-medium">${item.price.value}</div>
                      )}
                    </div>
                  ),
                  getURL: (item) => `/product/${item.objectID}`,
                },
              ]}
              showSuggestions={{
                indexName: ALGOLIA_INDEX_NAME_SUGGESTIONS,
                getURL: (item) => `/?q=${item.query}`,
                headerComponent: () => (
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                    <span className="text-xs uppercase tracking-wider text-neutral-600 font-semibold">
                      Suggestions
                    </span>
                  </div>
                ),
                itemComponent: ({ item, onSelect }) => (
                  <div 
                    onClick={onSelect}
                    className="px-4 py-3 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm text-neutral-700">{item.query}</span>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
          
          
          <div className="flex items-center space-x-6 text-sm">
            <button className="hover:text-neutral-300 transition-colors">ACCOUNT</button>
            <Link to="/cart" className="hover:text-neutral-300 transition-colors">
              CART ({totalItems})
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
