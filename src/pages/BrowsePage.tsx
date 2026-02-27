import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { PetCard } from '../components/PetCard';
import { Filter, PawPrint, Users, Palette, Clock, MapPin, X } from 'lucide-react';
import { Pet } from '../types';
import { io } from 'socket.io-client';

const socket = io();

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  
  const typeParam = searchParams.get('type') || 'All';
  const genderParam = searchParams.get('gender') || 'All';
  const minPriceParam = parseInt(searchParams.get('minPrice') || '0');
  const maxPriceParam = parseInt(searchParams.get('maxPrice') || '5000');
  const searchQuery = searchParams.get('search') || '';

  const [filters, setFilters] = useState({
    type: typeParam,
    gender: genderParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam
  });

  useEffect(() => {
    setFilters({
      type: typeParam,
      gender: genderParam,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam
    });
  }, [typeParam, genderParam, minPriceParam, maxPriceParam]);

  useEffect(() => {
    fetchPets();

    socket.on('pet:added', (newPet) => {
      // Only add if it matches current filters (simplified: just add if not filtered by type/search)
      setPets(prev => [newPet, ...prev]);
    });

    socket.on('pet:deleted', (data) => {
      setPets(prev => prev.filter(p => p.id !== Number(data.id)));
    });

    return () => {
      socket.off('pet:added');
      socket.off('pet:deleted');
    };
  }, [filters, searchQuery]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filters.type,
        gender: filters.gender,
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString(),
        search: searchQuery
      });
      const res = await fetch(`/api/pets?${params}`);
      const data = await res.json();
      setPets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row gap-8 px-4 sm:px-8 py-8">
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#2ec2b3]" />
              Filters
            </h3>
            <div className="space-y-1">
              {['All', 'Dogs', 'Cats', 'Birds', 'Rabbits', 'Fish'].map(t => (
                <div 
                  key={t}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${filters.type === t ? 'bg-[#2ec2b3]/10 text-[#2ec2b3] font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('type', t);
                    setSearchParams(newParams);
                  }}
                >
                  <PawPrint className="w-5 h-5" />
                  <p className="text-sm">{t === 'All' ? 'All Pets' : t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6">Price Range</p>
            <div className="px-2">
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="100"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#2ec2b3]"
              />
              <div className="flex justify-between mt-4 text-xs font-medium text-slate-500">
                <span>$0</span>
                <span>${filters.maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('maxPrice', filters.maxPrice.toString());
              setSearchParams(newParams);
            }}
            className="w-full py-3 mt-4 bg-[#2ec2b3] text-white rounded-lg font-bold shadow-lg shadow-[#2ec2b3]/20 hover:brightness-105 active:scale-[0.98] transition-all"
          >
            Apply Filters
          </button>
        </aside>

        <section className="flex-1">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {searchQuery ? `Search results for "${searchQuery}"` : 'Browse Our Pets'}
              </h1>
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="mt-2 flex items-center gap-1 text-sm font-bold text-[#2ec2b3] hover:underline"
                >
                  <X className="w-4 h-4" /> Clear search
                </button>
              )}
              {!searchQuery && <p className="text-slate-500 mt-1">Find your new best friend from our curated selection.</p>}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>Sort by:</span>
              <select className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 font-bold pr-8 cursor-pointer">
                <option>Newest First</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-lg aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <>
              {pets.length === 0 ? (
                <div className="text-center py-20">
                  <PawPrint className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No pets found</h3>
                  <p className="text-slate-500">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {pets.map(pet => (
                    <PetCard key={pet.id} pet={pet} />
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex justify-center mt-12 gap-2">
            <button className="h-10 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-[#2ec2b3]/20 transition-all">Previous</button>
            <button className="h-10 w-10 rounded-lg bg-[#2ec2b3] text-white font-bold">1</button>
            <button className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-[#2ec2b3]/20 transition-all">2</button>
            <button className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-[#2ec2b3]/20 transition-all">3</button>
            <button className="h-10 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-[#2ec2b3]/20 transition-all">Next</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
