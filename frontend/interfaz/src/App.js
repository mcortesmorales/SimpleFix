import logo from './logo.svg';
import './App.css';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/adminPanel';
import Header from './components/Header';
import FileUploadPage from './components/FileUploadPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DropPage from './pages/dropPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Renderiza Header en todas las páginas */}
        <Header />
        
        <Routes>
          <Route path="/subir" element={<FileUploadPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin" element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route path="/admin2" element={<AdminPanel />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/file-drop" element={<DropPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
