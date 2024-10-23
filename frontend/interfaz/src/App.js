import logo from './logo.svg';
import './App.css';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/adminPanel';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
