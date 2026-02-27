import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { BrowsePage } from './pages/BrowsePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { PetDetailsPage } from './pages/PetDetailsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { CartPage } from './pages/CartPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/pet/:id" element={<PetDetailsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/track-order/:id" element={<OrderTrackingPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
