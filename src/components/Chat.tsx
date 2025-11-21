import * as React from 'react';
import { Chat, useInstantSearch, useHits } from 'react-instantsearch';
import { Link } from 'react-router-dom';
import 'instantsearch.css/components/chat.css';
import type { Hit as AlgoliaHit } from 'instantsearch.js';
import { useCart } from './CartContext';

type Hit = AlgoliaHit & {
  name: string;
  image: string;
  price?: number;
  brand?: string;
  objectID: string;
};

function ItemComponent({ item }: { item: Hit }) {
  return (
    <article className="group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-400 transition-all duration-300 hover:shadow-lg">
      <div className="aspect-square overflow-hidden">
        <img 
          src={item.image} 
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
        {item.price && (
          <p className="text-sm text-neutral-500">${item.price}</p>
        )}
      </div>
    </article>
  );
}

export function ChatWithRefineTool() {
  const { addItem } = useCart();
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
              input.item && input.item.objectID === objectID
                ? input.item
                : null;

            // Stable click handler
            const handleAdd = React.useCallback(async () => {
              if (!objectID || !hit) return; // extra guard
              try {
                setSubmitting(true);
                // Add to cart using context
                addItem({
                  objectID: hit.objectID,
                  name: hit.name,
                  price: hit.price || 0,
                  brand: hit.brand,
                  image: hit.image,
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
        algolia_search_index: {},
      }}
    />
  );
}
