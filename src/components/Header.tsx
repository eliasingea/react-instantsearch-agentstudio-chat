import { useCart } from './CartContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

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
