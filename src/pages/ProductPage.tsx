import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { useCart } from '../components/CartContext';

const searchClient = algoliasearch(
  'SRD7V01PUE',
  '21d2cd80869e20eb0becf4065f058b95'
);
const INDEX_NAME = 'fashion_updated';

interface Product {
    objectID: string;
    name: string;
    price: {
        value: number;
    };
    brand: string;
    primary_image: string;
    list_categories: string[];

}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [addedToCart, setAddedToCart] = useState(false);

  React.useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const { results } = await searchClient.search({
          requests: [
            {
              indexName: INDEX_NAME,
              filters: `objectID:${id}`,
            },
          ],
        });

        if (results[0] && 'hits' in results[0] && results[0].hits.length > 0) {
          setProduct(results[0].hits[0] as Product);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem(
      {
        objectID: product.objectID,
        name: product.name,
        price: { value: product.price.value },
        brand: product.brand,
        primary_image: product.primary_image,
      },
      quantity
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm tracking-wider text-neutral-400">LOADING...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4">PRODUCT NOT FOUND</h1>
          <Link to="/" className="text-sm tracking-wider hover:text-neutral-600 transition-colors">
            RETURN TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm tracking-wider text-neutral-600 hover:text-black transition-colors"
        >
          ← BACK
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
              <img
                src={product.primary_image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Additional images could go here */}
          </div>

          {/* Product Details */}
          <div className="lg:pt-16">
            <div className="mb-8">
              {product.brand && (
                <p className="text-xs tracking-widest text-neutral-500 uppercase mb-3">
                  {product.brand}
                </p>
              )}
              <h1 className="text-3xl font-light mb-6">{product.name}</h1>
              <p className="text-2xl font-light mb-8">${product.price.value.toFixed(2)}</p>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <h3 className="text-xs tracking-widest mb-4 uppercase">SELECT SIZE</h3>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[50px] px-4 py-3 text-sm tracking-wider border transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-neutral-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-xs tracking-widest mb-4 uppercase">QUANTITY</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-neutral-300 hover:border-black transition-colors"
                >
                  −
                </button>
                <span className="min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-neutral-300 hover:border-black transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-black text-white text-sm tracking-widest hover:bg-neutral-800 transition-colors"
              >
                {addedToCart ? 'ADDED TO CART ✓' : 'ADD TO CART'}
              </button>
              <Link
                to="/cart"
                className="block w-full py-4 border border-black text-center text-sm tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                VIEW CART
              </Link>
            </div>

            {/* Product Info */}
            <div className="mt-12 space-y-6 text-sm">
             
              <div className="border-t border-neutral-200 pt-6">
                <p className="text-xs tracking-wider text-neutral-500 mb-2">DETAILS</p>
                <ul className="space-y-2 text-neutral-700">
                  <li>Premium materials</li>
                  <li>Tailored fit</li>
                  <li>Made with care</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
