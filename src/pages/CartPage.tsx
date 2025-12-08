import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../components/CartContext';

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-[1200px] mx-auto px-8 py-24">
          <div className="text-center">
            <h1 className="text-3xl font-light mb-6 tracking-wide">YOUR CART IS EMPTY</h1>
            <p className="text-neutral-600 mb-8 tracking-wider text-sm">
              Add items to your cart to see them here
            </p>
            <Link
              to="/"
              className="inline-block px-8 py-4 bg-black text-white text-sm tracking-widest hover:bg-neutral-800 transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-light mb-2 tracking-wide">SHOPPING CART</h1>
          <p className="text-sm text-neutral-600 tracking-wider">
            {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.objectID}
                className="bg-white border border-neutral-200 p-6 flex gap-6"
              >
                {/* Product Image */}
                <Link
                  to={`/product/${item.objectID}`}
                  className="w-32 h-32 flex-shrink-0 bg-neutral-100 overflow-hidden"
                >
                  {item.primary_image && (
                    <img
                      src={item.primary_image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </Link>

                {/* Product Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {item.brand && (
                      <p className="text-xs tracking-widest text-neutral-500 uppercase mb-1">
                        {item.brand}
                      </p>
                    )}
                    <Link
                      to={`/product/${item.objectID}`}
                      className="text-base font-light hover:text-neutral-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-neutral-600 mt-2">
                      ${item.price.value.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.objectID, item.quantity - 1)}
                        className="w-8 h-8 border border-neutral-300 hover:border-black transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="min-w-[30px] text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.objectID, item.quantity + 1)}
                        className="w-8 h-8 border border-neutral-300 hover:border-black transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.objectID)}
                      className="text-xs tracking-wider text-neutral-500 hover:text-black transition-colors"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-base font-light">
                    ${(item.price.value * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="text-xs tracking-wider text-neutral-500 hover:text-black transition-colors"
            >
              CLEAR CART
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-200 p-8 sticky top-8">
              <h2 className="text-sm tracking-widest mb-6 uppercase">ORDER SUMMARY</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="text-neutral-400">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-light mb-8">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <button className="w-full py-4 bg-black text-white text-sm tracking-widest hover:bg-neutral-800 transition-colors mb-4">
                CHECKOUT
              </button>

              <Link
                to="/"
                className="block text-center text-sm tracking-wider text-neutral-600 hover:text-black transition-colors"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
