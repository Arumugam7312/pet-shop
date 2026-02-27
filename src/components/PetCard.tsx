import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Palette, ShoppingCart } from 'lucide-react';
import { Pet } from '../types';
import { useCart } from '../context/CartContext';

interface PetCardProps {
  pet: Pet;
}

export const PetCard: React.FC<PetCardProps> = ({ pet }) => {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 flex flex-col h-full">
      <div className="relative aspect-square shrink-0">
        <img 
          className="w-full h-full object-cover" 
          src={pet.image_url} 
          alt={pet.name}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
          <span className={`text-sm font-bold ${pet.gender === 'Male' ? 'text-blue-500' : 'text-pink-500'}`}>
            {pet.gender === 'Male' ? '♂' : '♀'}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {pet.gender}
          </span>
        </div>
        {pet.is_available === 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{pet.name}</h3>
          <span className="text-[#f97316] font-black">${pet.price.toLocaleString()}</span>
        </div>
        <p className="text-xs font-semibold text-[#2ec2b3] mb-3">{pet.breed}</p>
        <div className="space-y-1.5 mb-5 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Palette className="w-4 h-4" />
            <span>{pet.color}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>DOB: {new Date(pet.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className={`w-2 h-2 rounded-full ${pet.is_available === 1 ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className={pet.is_available === 1 ? 'text-emerald-600' : 'text-red-600'}>
              {pet.is_available === 1 ? 'Available' : 'Not Available'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link 
            to={`/pet/${pet.id}`}
            className="py-2.5 text-center border-2 border-[#2ec2b3]/20 text-[#2ec2b3] hover:bg-[#2ec2b3]/5 rounded-lg text-xs font-bold transition-all"
          >
            Details
          </Link>
          <button 
            onClick={() => addToCart(pet)}
            disabled={pet.is_available === 0}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              pet.is_available === 1 
                ? 'bg-[#2ec2b3] text-white hover:brightness-105 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
