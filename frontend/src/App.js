import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch data from backend
    axios.get('/api')
      .then(response => setMessage(response.data.message))
      .catch(error => console.error('Error fetching data:', error));

    axios.get('/api/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fullstack React + Node.js App</h1>
        <p>Backend Message: {message}</p>
        
        <h2>Users from Backend:</h2>
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;