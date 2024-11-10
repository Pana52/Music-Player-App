import React from 'react';
import './App.css';
import './backgrounds/Waves.css';
import MusicLibrary from './MusicLibrary'; // Ensure this import is correct

function App() {
  return (
    <div className="App">
      {/* You can add a header or navbar here if needed */}
      <div className='wave'></div>
      <div className='wave'></div>
      
      <MusicLibrary />
    </div>
  );
}

export default App;
