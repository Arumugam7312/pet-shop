import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { PetCard } from '../components/PetCard';
import { 
  ChevronRight, Info, CheckCircle, ShoppingCart, MessageCircle, 
  ShieldCheck, Truck, Star, ArrowRight, Verified, PawPrint
} from 'lucide-react';
import { Pet } from '../types';
import { useCart } from '../context/CartContext';

export const PetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [similarPets, setSimilarPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPet = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pets/${id}`);
        const data = await res.json();
        setPet(data);

        const similarRes = await fetch(`/api/pets?type=${data.type}`);
        const similarData = await similarRes.json();
        setSimilarPets(similarData.filter((p: Pet) => p.id !== data.id).slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  const handleAdopt = () => {
    if (!pet) return;
    addToCart(pet);
    navigate('/cart');
  };

  if (loading || !pet) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 w-full">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-[#2ec2b3]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/" className="hover:text-[#2ec2b3]">{pet.type}s</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">{pet.name} the {pet.breed}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <section className="rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
              <div className="aspect-[16/9] w-full">
                <img 
                  src={pet.image_url} 
                  alt={pet.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 p-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                    <img src={`https://picsum.photos/seed/${pet.id + i}/400/400`} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <span className="text-sm font-bold text-[#2ec2b3]">+12 More</span>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-[#2ec2b3]" />
                Pet Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {[
                  { label: 'Breed', value: pet.breed },
                  { label: 'Gender', value: pet.gender, icon: pet.gender === 'Male' ? '♂' : '♀' },
                  { label: 'Color', value: pet.color },
                  { label: 'Date of Birth', value: new Date(pet.dob).toLocaleDateString() },
                  { label: 'Age', value: '4 Months' }, // Mocked
                  { label: 'Vaccination', value: pet.vaccination_status, badge: true },
                  { label: 'Health Status', value: pet.health_status, highlight: true },
                  { label: 'ID Number', value: `#PET-${pet.id.toString().padStart(4, '0')}`, mono: true },
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                    <span className="text-slate-500 font-medium">{spec.label}</span>
                    <span className={`font-semibold ${spec.highlight ? 'text-[#2ec2b3]' : ''} ${spec.mono ? 'font-mono text-sm text-slate-400' : ''} flex items-center gap-1`}>
                      {spec.badge && (
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {spec.value}
                        </span>
                      )}
                      {!spec.badge && (
                        <>
                          {spec.icon && <span className={pet.gender === 'Male' ? 'text-blue-500' : 'text-pink-500'}>{spec.icon}</span>}
                          {spec.value}
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed space-y-4">
                <p>{pet.description}</p>
                <p>Storm has been raised in a family environment, making him excellent with children and other pets. He is already showing great progress in basic crate training and is very food-motivated, which makes training a joy.</p>
              </div>
            </section>
          </div>

          <div className="relative">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border border-[#2ec2b3]/5">
                <div className="mb-6">
                  <div className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-widest">Price</div>
                  <div className="text-5xl font-black text-[#f97316] leading-none">${pet.price.toLocaleString()}</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-sm font-bold">In Stock</div>
                      <div className="text-xs text-slate-500">Ready for pickup or shipping</div>
                    </div>
                  </div>
                  <button 
                    onClick={handleAdopt}
                    className="w-full bg-[#2ec2b3] hover:bg-[#2ec2b3]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#2ec2b3]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Adopt Now
                  </button>
                  <button className="w-full border-2 border-[#2ec2b3] text-[#2ec2b3] hover:bg-[#2ec2b3]/5 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Contact Seller
                  </button>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img src="https://picsum.photos/seed/breeder/100/100" alt="Breeder" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="font-bold">{pet.breeder_name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Verified className="w-3 h-3 text-[#2ec2b3]" />
                        Verified Breeder
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#f97316]">
                    {[...Array(4)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    <Star className="w-4 h-4" />
                    <span className="text-slate-500 text-xs ml-2">({pet.breeder_rating} / {pet.breeder_reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#2ec2b3]/5 dark:bg-[#2ec2b3]/10 rounded-xl p-6 border border-[#2ec2b3]/10 space-y-4">
                <div className="flex gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#2ec2b3]" />
                  <div className="text-xs">
                    <span className="font-bold block">Purchase Guarantee</span>
                    <span className="text-slate-500">Full refund if pet health isn't as described within 14 days.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Truck className="w-6 h-6 text-[#2ec2b3]" />
                  <div className="text-xs">
                    <span className="font-bold block">Safe Delivery</span>
                    <span className="text-slate-500">Nationwide temperature-controlled transport available.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">Similar {pet.type}s</h3>
            <Link to="/" className="text-[#2ec2b3] font-bold text-sm flex items-center gap-1 hover:underline">
              View all {pet.type}s <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarPets.map(p => (
              <PetCard key={p.id} pet={p} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
