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

import type { UiState } from 'instantsearch.js/es/types';
import './App.css';
import { Header } from './components/Header';

import { history } from "instantsearch.js/es/lib/routers";

// Define custom route state type
type CustomRouteState = {
  q?: string;
  categories?: string[];
  brand?: string[];
  page?: number;
  size?: string[];
  color?: string[];
  gender?: string[];
  price?: string;
};

const routing = {
  router: history<CustomRouteState>({
    cleanUrlOnDispose: false,
  }),
  stateMapping: {
    stateToRoute(uiState: UiState): CustomRouteState {
      const indexUiState = uiState[ALGOLIA_INDEX_NAME];
      
      // Extract hierarchical categories from lvl0, lvl1, lvl2
      const hierarchicalMenu = indexUiState.hierarchicalMenu?.['hierarchical_categories.lvl0'] 
        || indexUiState.hierarchicalMenu?.['hierarchical_categories.lvl1']
        || indexUiState.hierarchicalMenu?.['hierarchical_categories.lvl2'];
      
      return {
        q: indexUiState.query,
        page: indexUiState.page,
        brand: indexUiState.refinementList?.brand,
        categories: hierarchicalMenu,
        size: indexUiState.refinementList?.available_sizes,
        color: indexUiState.refinementList?.['color.original_name'],
        gender: indexUiState.refinementList?.gender,
        price: indexUiState.range?.['price.value'],
      };
    },
    routeToState(routeState: CustomRouteState): UiState {
      const indexState: any = {
        query: routeState.q,
        page: routeState.page,
      };
      
      // Only add refinementList if there are actual refinements
      if (routeState.brand?.length || routeState.size?.length || routeState.color?.length || routeState.gender?.length) {
        indexState.refinementList = {};
        if (routeState.brand?.length) indexState.refinementList.brand = routeState.brand;
        if (routeState.size?.length) indexState.refinementList.available_sizes = routeState.size;
        if (routeState.color?.length) indexState.refinementList['color.original_name'] = routeState.color;
        if (routeState.gender?.length) indexState.refinementList.gender = routeState.gender;
      }
      
      // Only add hierarchicalMenu if there are categories
      if (routeState.categories?.length) {
        indexState.hierarchicalMenu = {
          'hierarchical_categories.lvl0': routeState.categories,
        };
      }
      
      // Only add range if there's a price
      if (routeState.price) {
        indexState.range = {
          'price.value': routeState.price
        };
      }
      
      return {
        [ALGOLIA_INDEX_NAME]: indexState,
      };
    },
  },
};


export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <InstantSearch
          searchClient={searchClient}
          indexName={ALGOLIA_INDEX_NAME}
          future={instantSearchConfig.future}
          routing={routing}
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
