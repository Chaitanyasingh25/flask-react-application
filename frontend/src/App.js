import React from 'react';
import Login from './components/Login';
import UpdateForm from './components/UpdateForm';

function App() {
  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>📈 RW Excel Updater</h1>
      <Login />
      <hr />
      <UpdateForm />
    </div>
  );
}

export default App;
