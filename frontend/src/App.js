import React from 'react';
import SearchInterface from './components/SearchInterface';
import SearchInterfaceOpenAI from './components/SearchInterfaceOpenAI';

function App() {
    const hasOpenAIKey = process.env.REACT_APP_OPENAI_API_KEY;

    return (
        <div className="App">
            {hasOpenAIKey ? <SearchInterfaceOpenAI /> : <SearchInterface />}
        </div>
    );
}

export default App;