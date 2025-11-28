import './index.scss';
import './index.css';

import { Toaster } from 'react-hot-toast';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import ProtectedRoute from './common/ProtectedRoute';
import Home from './pages/home';
import LOGIN from './pages/login';
import Room from './pages/room';
import SIGNUP from './pages/signup';

const AppContent = () => {
  return (
    <>
      <div>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<LOGIN />} />
          <Route path="/signup" element={<SIGNUP />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
