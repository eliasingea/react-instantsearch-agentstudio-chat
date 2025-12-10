import { useState, useEffect, useRef } from "react";
import { useSearchBox, useInstantSearch } from "react-instantsearch";
import { ALGOLIA_APP_ID, ALGOLIA_API_KEY } from "../config/algolia";

async function fetchAgent(input: any, agentId: string) {
  const api = `https://${ALGOLIA_APP_ID}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-4&stream=false`;
  
  const headers = {
    "x-algolia-application-id": ALGOLIA_APP_ID,
    "x-algolia-api-key": ALGOLIA_API_KEY,
    "Content-Type": "application/json",
  };
  
  console.log("Calling Algolia Agent with input:", input);
  try {
    const response = await fetch(api, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      throw new Error(`Agent API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Agent response:', data);
    
    return data;
     
  } catch (error) {
    console.error("Error calling Algolia Agent:", error);
    throw new Error("Failed to call Algolia Agent");
  }
}

async function callAgent(query: string, results: any[]) {
  const agentId = "2be82716-462a-4754-a6a9-9226cfab5b0b"; 
  try {
    const input = {
      messages: [
        {
          role: "user",
          content: `Generate a search summary for the query: "${query}". Here are the top results: ${JSON.stringify(results.slice(0, 5))}`
        }
      ]
    };
    
    console.log('Calling agent with query:', query);
    
    const data = await fetchAgent(input, agentId);
    console.log('Agent response:', data);
    
    // Extract summary from agent's content
    if (!data) {
      return { error: 'No response from agent' };
    }
    
    // The agent should return JSON with summary structure in its content
    if (data.content && typeof data.content === 'string') {
      try {
        const parsed = JSON.parse(data.content);
        if (parsed.summary || parsed.keyInsights || parsed.relatedSearches) {
          return {
            summary: parsed.summary || "",
            keyInsights: parsed.keyInsights || [],
            relatedSearches: parsed.relatedSearches || [],
            query: query
          };
        }
      } catch (e) {
        console.log('Content is not JSON, using as plain text summary');
        // If content exists but isn't JSON, just use it as the summary
        return {
          summary: data.content,
          keyInsights: [],
          relatedSearches: [],
          query: query
        };
      }
    }
    
    return { error: 'Agent did not return expected summary format' };
    
  } catch (error) {
    console.error("Error calling agent:", error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}


// AI Search Summary Component
export function AISearchSummary() {
  const { query, refine } = useSearchBox();
  const { results, status } = useInstantSearch();
  const [isExpanded, setIsExpanded] = useState(true);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const lastQueryRef = useRef<string>("");
  
  // Fetch summary when query changes and results are ready
  useEffect(() => {
    const fetchSummary = async () => {
      // Don't fetch if no query, still loading, or same query as before
      if (!query || status !== 'idle' || query === lastQueryRef.current) {
        return;
      }
      
      // Don't fetch if no results
      if (!results.hits || results.hits.length === 0) {
        return;
      }
      
      lastQueryRef.current = query;
      setLoading(true);
      setSummaryData(null); // Clear old summary immediately when new query starts
      
      try {
        const summary = await callAgent(query, results.hits);
        
        if (summary && !summary.error) {
          setSummaryData(summary);
        } else {
          console.error("Error fetching summary:", summary?.error);
          // Keep previous summary or use null
          setSummaryData(null);
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
        setSummaryData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, [query, status, results.hits]);
  
  // Don't show if no query
  if (!query) return null;
  
  // Show loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-blue-900">Generating AI overview...</span>
        </div>
      </div>
    );
  }
  
  // Don't show if no summary data
  if (!summaryData) return null;
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="font-medium text-blue-900">AI Overview</h3>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {isExpanded && (
        <>
          {/* Summary */}
          {summaryData.summary && (
            <p className="text-sm text-neutral-700 leading-relaxed mb-4">
              {summaryData.summary}
            </p>
          )}
          
          {/* Key Insights */}
          {summaryData.keyInsights && summaryData.keyInsights.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-blue-900 mb-2 uppercase tracking-wide">Key Insights</h4>
              <ul className="space-y-1">
                {summaryData.keyInsights.map((insight: string, idx: number) => (
                  <li key={idx} className="text-sm text-neutral-700 flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Related Searches */}
          {summaryData.relatedSearches && summaryData.relatedSearches.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-blue-900 mb-2 uppercase tracking-wide">Related Searches</h4>
              <div className="flex flex-wrap gap-2">
                {summaryData.relatedSearches.map((search: string, idx: number) => (
                  <span 
                    key={idx}
                    onClick={() => refine(search)}
                    className="text-xs px-3 py-1 bg-white border border-blue-200 rounded-full text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors"
                  >
                    {search}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      <p className="text-xs text-neutral-500 mt-4 italic">
        AI-generated summary • Experimental feature
      </p>
    </div>
  );
}