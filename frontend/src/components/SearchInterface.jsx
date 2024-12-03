import React, { useState, useEffect } from 'react';
import { Search, ThumbsDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { QdrantClient } from '@qdrant/js-client-rest';

const SearchInterface = () => {
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!client) {
      setError('Search service not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For testing, create a random vector (replace with actual embedding)
      const searchVector = Array.from({ length: 128 }, () => Math.random());

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
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownvote = (id) => {
    // Here you would make the actual API call to mark/delete the item
    setResults(results.filter(result => result.id !== id));
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
                  <AlertDialogAction onClick={() => handleDownvote(result.id)}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {searchQuery && results.length === 0 && !isLoading && (
        <Alert>
          <AlertTitle>No Results Found</AlertTitle>
          <AlertDescription>
            Try adjusting your search terms to find what you're looking for.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SearchInterface;