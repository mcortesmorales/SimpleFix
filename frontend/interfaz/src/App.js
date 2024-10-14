import logo from './logo.svg';
import './App.css';
import Login from './components/login';
import AdminPanel from './pages/adminPanel';

function App() {
  return (
    <div className="App">
      <Login></Login>
      <AdminPanel></AdminPanel>
    </div>
  );
}

export default App;
