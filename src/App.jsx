import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import MyAccount from './pages/MyAccount';
import MyBalance from './pages/MyBalance';
import MyLoans from './pages/MyLoans';
import MyCards from './pages/MyCards';
import Notices from './pages/Notices';
import Contact from './pages/Contact';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route 
                path="/myAccount" 
                element={
                  <ProtectedRoute>
                    <MyAccount />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/myBalance" 
                element={
                  <ProtectedRoute>
                    <MyBalance />
                  </ProtectedRoute>
                } 
              />~~
              <Route 
                path="/myLoans" 
                element={
                  <ProtectedRoute>
                    <MyLoans />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/myCards" 
                element={
                  <ProtectedRoute>
                    <MyCards />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notices" 
                element={
                  <ProtectedRoute>
                    <Notices />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
      </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
~``