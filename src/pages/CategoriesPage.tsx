import React from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { 
  ArrowRight, ChevronRight, PawPrint, Bird, Cat, Dog, 
  Rabbit, Fish, Turtle, Bug
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const categories = [
    { name: 'Dogs', icon: <Dog className="w-10 h-10" />, count: 124, color: 'bg-blue-50 text-blue-600', description: 'Loyal companions for every family.' },
    { name: 'Cats', icon: <Cat className="w-10 h-10" />, count: 86, color: 'bg-purple-50 text-purple-600', description: 'Elegant and independent feline friends.' },
    { name: 'Birds', icon: <Bird className="w-10 h-10" />, count: 42, color: 'bg-emerald-50 text-emerald-600', description: 'Colorful and chirpy feathered companions.' },
    { name: 'Rabbits', icon: <Rabbit className="w-10 h-10" />, count: 31, color: 'bg-orange-50 text-orange-600', description: 'Soft and gentle long-eared pets.' },
    { name: 'Fish', icon: <Fish className="w-10 h-10" />, count: 156, color: 'bg-cyan-50 text-cyan-600', description: 'Peaceful and beautiful aquatic life.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-20">
          <div className="max-w-[1440px] mx-auto px-8 text-center">
            <h1 className="text-5xl font-black text-slate-900 dark:text-slate-100 mb-6 tracking-tight">Browse by Category</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Explore our wide range of pet categories to find the perfect companion that matches your lifestyle and preferences.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-20">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, idx) => (
                <Link 
                  key={idx} 
                  to={`/browse?type=${cat.name}`}
                  className="bg-white dark:bg-slate-900 p-10 rounded-[32px] border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col items-center text-center"
                >
                  <div className={`w-24 h-24 ${cat.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-3">{cat.name}</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">{cat.description}</p>
                  <div className="mt-auto flex items-center gap-2 text-[#2ec2b3] font-bold">
                    <span>{cat.count} Pets Available</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#2ec2b3] text-white">
          <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black mb-4">Don't see what you're looking for?</h2>
              <p className="text-white/80 text-lg">New pets arrive daily! Sign up for our newsletter to get notified when your favorite breed becomes available.</p>
            </div>
            <div className="flex w-full md:w-auto gap-4">
              <input 
                placeholder="Enter your email" 
                className="bg-white/20 border border-white/30 rounded-2xl px-6 py-4 flex-1 md:w-80 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-[#2ec2b3] font-bold px-8 py-4 rounded-2xl hover:brightness-105 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
