import React, { useState } from 'react';
import { Search, ThumbsDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockResults = [
    { id: 1, text: "This is the first answer from the database", score: 0.95 },
    { id: 2, text: "Here's another relevant response", score: 0.87 },
    { id: 3, text: "Third result from the knowledge base", score: 0.82 }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResults(mockResults);
      setIsLoading(false);
    }, 1000);
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