import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, Search, PawPrint, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-3">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 text-[#2ec2b3]">
            <PawPrint className="w-8 h-8" />
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-black tracking-tight">PetShop</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-[#2ec2b3] transition-colors">Home</Link>
            <Link to="/browse" className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-[#2ec2b3] transition-colors">All Pets</Link>
            <Link to="/categories" className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-[#2ec2b3] transition-colors">Categories</Link>
            <Link to="/track-order/search" className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-[#2ec2b3] transition-colors">Track Order</Link>
            <Link to="/about" className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-[#2ec2b3] transition-colors">About</Link>
          </nav>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4">
          <form onSubmit={handleSearch} className="flex w-full max-w-md items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-400 px-3" 
              placeholder="Search breeds, types..." 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#2ec2b3]/20 transition-all">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/admin" className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#2ec2b3]/20 transition-all">
                  <User className="w-5 h-5" />
                </Link>
                <button 
                  onClick={logout}
                  className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#2ec2b3]/20 transition-all">
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
          <div className="h-10 w-10 rounded-full bg-[#2ec2b3]/30 border border-[#2ec2b3]/20 overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              src={user ? `https://picsum.photos/seed/${user.email}/100/100` : "https://picsum.photos/seed/guest/100/100"} 
              alt="User"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 px-8 bg-white dark:bg-slate-900">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-[#2ec2b3]/60">
          <PawPrint className="w-5 h-5" />
          <span className="text-sm font-bold">© 2024 PetShop Inventory System</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-slate-500">
          <Link to="/categories" className="hover:text-[#2ec2b3] transition-colors">Categories</Link>
          <Link to="/browse" className="hover:text-[#2ec2b3] transition-colors">All Pets</Link>
          <Link to="/about" className="hover:text-[#2ec2b3] transition-colors">About Us</Link>
          <Link to="/" className="hover:text-[#2ec2b3] transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};
