import logo from './logo.svg';
import './App.css';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/adminPanel';
import Header from './components/Header';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import SettingsPage from './pages/SettingsPage';
import DropPage from './pages/dropPage';
import RepairPage from './pages/RepairPage';
import DupRepairPage from './pages/DupRepairPage';


function App() {
  return (

    <Router>
      <AuthProvider>
        <Header></Header>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute allowedRoles={['Administrador', 'Operador']}>
                <Home />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin" element={
              <PrivateRoute>
                <AdminPanel allowedRoles={['Administrador']}/>
              </PrivateRoute>
            }
          />
          <Route path="/configuracion" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/file-drop" element={<PrivateRoute><DropPage /></PrivateRoute>} />
          <Route path="/repair" element={<PrivateRoute><RepairPage /></PrivateRoute>} />
          <Route path="/dup-repair" element={<PrivateRoute><DupRepairPage /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </Router>

  );
}

export default App;
