import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {
 
  InstantSearch,
 
} from 'react-instantsearch';

import SearchPage from './pages/SearchPage';

import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CartProvider, useCart } from './components/CartContext';
import { searchClient, ALGOLIA_INDEX_NAME, instantSearchConfig } from './config/algolia';


import './App.css';
import { Header } from './components/Header';



export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <InstantSearch
          searchClient={searchClient}
          indexName={ALGOLIA_INDEX_NAME}
          future={instantSearchConfig.future}
          routing={true}
        >
          <Header />
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/categories/:category" element={<SearchPage />} />
          </Routes>
        </InstantSearch>
      </BrowserRouter>
    </CartProvider>
  );
}
