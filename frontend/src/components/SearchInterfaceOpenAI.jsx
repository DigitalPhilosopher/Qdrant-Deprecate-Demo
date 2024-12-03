import React, { useState, useEffect } from 'react';
import { Search, ThumbsDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { QdrantClient } from '@qdrant/js-client-rest';

const SearchInterfaceOpenAI = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const qdrantUrl = process.env.REACT_APP_QDRANT_URL || 'http://localhost';
      const qdrantPort = process.env.REACT_APP_QDRANT_PORT || '6333';
      const url = `${qdrantUrl}:${qdrantPort}`;

      const newClient = new QdrantClient({ url });
      setClient(newClient);
    } catch (err) {
      console.error('Failed to initialize Qdrant client:', err);
      setError('Failed to connect to search service');
    }
  }, []);

  const generateEmbeddings = async (text) => {
    const openaiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('OpenAI API key not found');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!client) {
      setError('Search service not available');
      return;
    }
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate embeddings using OpenAI
      const searchVector = await generateEmbeddings(searchQuery);

      const searchResults = await client.query('test_collection', {
        query: searchVector,
        limit: 10,
        filter: {
          must_not: [{
            key: 'deprecated',
            match: { value: true }
          }]
        },
        with_payload: true
      });

      const formattedResults = searchResults.points.map(result => ({
        id: result.id,
        score: result.score,
        ...result.payload,
      }));

      setResults(formattedResults);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownvote = async (id) => {
    if (!client) {
      setError('Search service not available');
      return;
    }

    try {
      await client.setPayload('test_collection', {
        payload: {
          deprecated: true,
        },
        points: [id],
      });

      setResults(results.filter(result => result.id !== id));
    } catch (err) {
      console.error('Failed to mark item as deprecated:', err);
      setError('Failed to update item. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search for a text..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="p-4 border rounded-lg flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Score: {result.score}</p>
              <p className="mt-1">{result.text}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger>
                <button className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <ThumbsDown className="h-5 w-5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Downvote</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to mark this response as deprecated? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDownvote(result.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchInterfaceOpenAI;