import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Algolia Configuration
export const ALGOLIA_APP_ID = 'SRD7V01PUE';
export const ALGOLIA_API_KEY = '21d2cd80869e20eb0becf4065f058b95';
export const ALGOLIA_INDEX_NAME = 'fashion_updated';
export const ALGOLIA_INDEX_NAME_SUGGESTIONS = 'fashion_query_suggestions';


// Search Client
export const searchClient = algoliasearch(
  ALGOLIA_APP_ID,
  ALGOLIA_API_KEY
);

// InstantSearch Configuration
export const instantSearchConfig = {
  future: { preserveSharedStateOnUnmount: true },
};
