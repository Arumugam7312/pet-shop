import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { PetCard } from '../components/PetCard';
import { 
  ArrowRight, PawPrint, ShieldCheck, Heart, Star, 
  ChevronRight, Sparkles, Clock, MapPin
} from 'lucide-react';
import { Pet } from '../types';
import { motion } from 'motion/react';

export const HomePage: React.FC = () => {
  const [featuredPets, setFeaturedPets] = useState<Pet[]>([]);

  useEffect(() => {
    fetch('/api/pets')
      .then(res => res.json())
      .then(data => setFeaturedPets(data.slice(0, 4)))
      .catch(e => console.error(e));
  }, []);

  const categories = [
    { name: 'Dogs', icon: '🐕', count: 120, color: 'bg-blue-50 text-blue-600' },
    { name: 'Cats', icon: '🐈', count: 85, color: 'bg-purple-50 text-purple-600' },
    { name: 'Birds', icon: '🦜', count: 45, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Rabbits', icon: '🐇', count: 30, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#2ec2b3]/5 -skew-x-12 translate-x-1/4" />
        <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2ec2b3]/10 text-[#2ec2b3] rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>New Arrivals are here!</span>
            </div>
            <h1 className="text-7xl font-black text-slate-900 dark:text-slate-100 leading-[1.1] mb-8 tracking-tight">
              Find Your New <br />
              <span className="text-[#2ec2b3]">Best Friend</span> Today.
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-lg leading-relaxed">
              Discover a wide variety of healthy, happy pets waiting for a loving home. We ensure the best care for every animal.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/browse" className="px-8 py-4 bg-[#2ec2b3] text-white rounded-2xl font-bold shadow-xl shadow-[#2ec2b3]/20 hover:brightness-105 transition-all flex items-center gap-2">
                Browse All Pets
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/categories" className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                View Categories
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[40px] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl">
              <img 
                src="https://picsum.photos/seed/pet-hero/800/800" 
                alt="Happy Dog" 
                className="w-full aspect-square object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Floating Cards */}
            <div className="absolute -bottom-10 -left-10 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-20 animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100">Verified Health</p>
                  <p className="text-xs text-slate-500">100% Certified</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">Browse by Category</h2>
              <p className="text-slate-500">Find the perfect pet type for your lifestyle.</p>
            </div>
            <Link to="/categories" className="text-[#2ec2b3] font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                to={`/browse?type=${cat.name}`}
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{cat.name}</h3>
                <p className="text-sm text-slate-500">{cat.count}+ Available</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pets */}
      <section className="py-24">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">Featured Pets</h2>
              <p className="text-slate-500">Meet some of our most lovable friends looking for a home.</p>
            </div>
            <Link to="/browse" className="text-[#2ec2b3] font-bold flex items-center gap-1 hover:underline">
              Browse All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredPets.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <PawPrint className="absolute top-10 left-10 w-32 h-32 rotate-12" />
          <PawPrint className="absolute bottom-10 right-10 w-32 h-32 -rotate-12" />
        </div>
        <div className="max-w-[1440px] mx-auto px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl font-black mb-6">Why Choose PetShop?</h2>
            <p className="text-slate-400 text-lg">We provide a seamless and trustworthy experience for both pets and their new owners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#2ec2b3]/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <ShieldCheck className="w-10 h-10 text-[#2ec2b3]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Verified Breeders</h3>
              <p className="text-slate-400">We only work with certified breeders who prioritize the health and well-being of their animals.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#2ec2b3]/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Heart className="w-10 h-10 text-[#2ec2b3]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Health Guarantee</h3>
              <p className="text-slate-400">Every pet comes with a comprehensive health check and up-to-date vaccination records.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#2ec2b3]/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Clock className="w-10 h-10 text-[#2ec2b3]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">24/7 Support</h3>
              <p className="text-slate-400">Our team of experts is always available to help you with any questions about your new pet.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
