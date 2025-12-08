import * as React from 'react';
import { Chat, useInstantSearch, useHits } from 'react-instantsearch';
import { Link } from 'react-router-dom';
import 'instantsearch.css/components/chat.css';
import type { Hit as AlgoliaHit } from 'instantsearch.js';
import { useCart } from './CartContext';

type Hit = AlgoliaHit & {
  name: string;
  primary_image: string;
  price: {
    value: number;
  };
  brand?: string;
  objectID: string;
};

function ItemComponent({ item }: { item: Hit }) {
  return (
    <article className="group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-400 transition-all duration-300 hover:shadow-lg">
      <div className="aspect-square overflow-hidden">
        <img 
          src={item.primary_image} 
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <h2 className="text-sm font-light mb-1">
          <Link
            to={`/product/${item.objectID}`}
            state={{ product: item }}
            className="text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            {item.name}
          </Link>
        </h2>
        {item?.price?.value && typeof item.price.value === 'number' && (
          <p className="text-sm text-neutral-500">${item.price.value.toFixed(2)}</p>
        )}
      </div>
    </article>
  );
}

export function ChatWithRefineTool() {
  const { addItem, items, totalItems, totalPrice } = useCart();
  return (
    <Chat
      agentId="ca91e49f-fbd7-4a0f-a53b-ded2dc5afb87"
      itemComponent={ItemComponent}
      tools={{
        addToCart: {
          layoutComponent: ({ message, addToolResult }) => {
            const callId = message.toolCallId;

            const [submitting, setSubmitting] = React.useState(false);

            // Derive inputs once per render
            const input = message.input ?? {};
            const objectID = input.objectID as string | undefined;
            const quantity = (input.quantity as number | undefined) ?? 1;
            const hit =
              input.item && 
              input.item.objectID === objectID &&
              input.item.primary_image // Ensure image is present
                ? input.item
                : null;

                
            if (hit && hit?.price && typeof hit.price.value !== 'number') {
              hit.price.value = parseFloat(hit.price.value) || 0;
            }
            console.log('AddToCart Tool - input.item:', input.item, 'hit:', hit);
            // Stable click handler
            const handleAdd = React.useCallback(async () => {
              if (!objectID || !hit) return; // extra guard
              try {
                setSubmitting(true);
                // Add to cart using context
                addItem({
                  objectID: hit.objectID,
                  name: hit.name,
                  price: {value: hit.price.value || 0},
                  brand: hit.brand,
                  primary_image: hit.primary_image,
                }, quantity);
                
                addToolResult({
                  tool: 'addToCart',
                  toolCallId: callId,
                  output: {
                    status: 'ok',
                    lineItem: { objectID, quantity },
                  },
                });
              } catch (e) {
                addToolResult({
                  tool: 'addToCart',
                  toolCallId: callId,
                  output: { status: 'error', message: String(e) },
                });
              } finally {
                setSubmitting(false);
              }
            }, [objectID, quantity, callId, addToolResult, hit, addItem]);

            // Render by message.state (pure render only)
            switch (message.state) {
              case 'input-streaming':
                return <div>Receiving request to add to cart…</div>;

              case 'input-available':
                if (!objectID) return <div>Missing product id.</div>;
                return (
                  <div>
                    {hit ? (
                      <div className="mb-3">
                        <ItemComponent item={hit} />
                      </div>
                    ) : (
                      <div className="mb-3 opacity-70">
                        Preview unavailable. Proceed to add{' '}
                        <code>{objectID}</code>?
                      </div>
                    )}
                    <button
                      onClick={handleAdd}
                      disabled={submitting}
                      className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting
                        ? 'Adding…'
                        : `Add${hit?.name ? ` “${hit.name}”` : ''} to cart`}
                    </button>
                  </div>
                );

              case 'output-available': {
                const out = message.output;
                if (out?.status === 'ok') {
                  const li = out.lineItem;
                  return (
                    <div>
                      Added {li?.objectID} (qty {li?.quantity ?? 1}) to the
                      cart.
                    </div>
                  );
                }
                if (out?.status === 'error') {
                  return (
                    <div>
                      Couldn’t add to cart: {out.message ?? 'Unknown error'}
                    </div>
                  );
                }
                return <div>Cart updated.</div>;
              }

              case 'output-error':
                return <div>There was an error with the request.</div>;

              default:
                return null;
            }
          },
        },
        viewCart: {
          layoutComponent: ({ message, addToolResult }) => {
            const callId = message.toolCallId;
            const sentRef = React.useRef(false);
            
            // Auto-return cart data to agent
            React.useEffect(() => {
              if (message.state === 'input-available' && !sentRef.current) {
                addToolResult({
                  toolCallId: callId,
                  output: {
                    itemCount: totalItems,
                    totalPrice: totalPrice.toFixed(2),
                    isEmpty: items.length === 0,
                    items: items.map(item => ({
                      name: item.name,
                      quantity: item.quantity,
                      price: item.price.value,
                      objectID: item.objectID
                    }))
                  }
                });
                sentRef.current = true;
              }
            }, [message.state, callId, addToolResult]);
            
            switch (message.state) {
              case 'input-streaming':
                return <div>Checking your cart...</div>;
                
              case 'input-available':
                return <div>Loading cart...</div>;
                
              case 'output-available':
                return (
                  <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                    {items.length === 0 ? (
                      <p className="text-sm text-neutral-600 mb-3">Your cart is empty</p>
                    ) : (
                      <>
                        <div className="text-sm mb-3">
                          <p className="font-medium">{totalItems} {totalItems === 1 ? 'item' : 'items'} in cart</p>
                          <p className="text-neutral-600">Total: ${totalPrice.toFixed(2)}</p>
                        </div>
                        <ul className="text-sm space-y-1 mb-3 text-neutral-700">
                          {items.map(item => (
                            <li key={item.objectID}>
                              • {item.name} (x{item.quantity})
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <Link
                      to="/cart"
                      className="inline-block px-4 py-2 bg-black text-white text-sm hover:bg-neutral-800 transition-colors rounded"
                    >
                      View Full Cart
                    </Link>
                  </div>
                );
                
              case 'output-error':
                return <div>Failed to load cart</div>;
                
              default:
                return null;
            }
          }
        },
        algolia_search_index: {
          layoutComponent: ({
            message,
            indexUiState,
            setIndexUiState,
            addToolResult,
          }) => {
            const [query, setQuery] = React.useState<string | null>(null);
            const { results, status } = useInstantSearch();
            const [topHits, setTopHits] = React.useState([]);
            const sentRef = React.useRef<Set<string>>(new Set());
            const callId = message.toolCallId;

            const persistedItems = message.output?.items as any[] | undefined;

            React.useEffect(() => {
              if (message.state === 'input-available' && message.input?.query) {
                const q = message.input.query;
                setQuery(q);
                setTopHits(null);
                setIndexUiState((prev) => ({ ...prev, query: q }));
              }
            }, [message.state, message.input?.query, setIndexUiState]);

            React.useEffect(() => {
              if (!query) return;
              if (status !== 'idle') return;
              if (indexUiState?.query !== query) return;
              if (sentRef.current.has(callId)) return;

              const top3 = results.hits.slice(0, 3);
              setTopHits(top3);

              addToolResult({
                toolCallId: message.toolCallId,
                output: {
                  query: query,
                  count: top3.length,
                  items: top3.map((h) => ({
                    objectID: h.objectID,
                    name: h.name,
                    price: h.price.value,
                    primary_image: h.primary_image,
                  })),
                },
              });
              setQuery(null);

              sentRef.current.add(callId);
            }, [
              results,
              status,
              indexUiState?.query,
              query,
              callId,
              addToolResult,
            ]);

            switch (message.state) {
              case 'input-streaming':
                return <div>Receiving Search Request...</div>;
              case 'input-available':
                return <div>Ran {query}</div>;
              case 'output-error':
                return <div>Search Failed</div>;
              case 'output-available':
                if (persistedItems) {
                  return (
                    <div>
                      <div className="mb-2 text-sm opacity-70">
                        Top results{query ? ` for “${query}”` : ''}:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {persistedItems.map((item: any) => (
                          <ItemComponent key={item.objectID} item={item} />
                        ))}
                        {persistedItems.length === 0 && (
                          <div className="opacity-70">No results.</div>
                        )}
                      </div>
                    </div>
                  );
                }
              default:
                if (topHits) {
                  return (
                    <div>
                      <div className="mb-2 text-sm opacity-70">
                        Top results:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {topHits.map((item: any) => (
                          <ItemComponent key={item.objectID} item={item} />
                        ))}
                        {topHits.length === 0 && (
                          <div className="opacity-70">No results.</div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return null;
                }
            }
          },
        },
      }}
    />
  );
}
