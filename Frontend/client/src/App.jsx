import React from 'react';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import GoogleSuccess from './components/GoogleSuccess';

function App() {
  return (
    <div>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login/>} />
            <Route path='/signup' element={<Signup/>} />
            <Route path="/google-success" element={<GoogleSuccess />}></Route>
          </Routes>
          </BrowserRouter>
      
    </div>
  );
}

export default App;