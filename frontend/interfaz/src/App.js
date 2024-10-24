import logo from './logo.svg';
import './App.css';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import Header from './components/Header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      
    <Router>
    <Header />
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
    
    </AuthProvider>
  );
}

export default App;
