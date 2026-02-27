import React from 'react';
import { Header, Footer } from '../components/Layout';
import { 
  Heart, ShieldCheck, Users, Award, 
  CheckCircle, ArrowRight, PawPrint, Mail
} from 'lucide-react';
import { motion } from 'motion/react';

export const AboutPage: React.FC = () => {
  const stats = [
    { label: 'Happy Pets', value: '5,000+' },
    { label: 'Families Joined', value: '4,800+' },
    { label: 'Verified Breeders', value: '150+' },
    { label: 'Years Experience', value: '12+' },
  ];

  const values = [
    {
      title: 'Animal Welfare First',
      description: 'We prioritize the health and happiness of every animal above all else. Our strict vetting process ensures only the best care.',
      icon: <Heart className="w-6 h-6" />
    },
    {
      title: 'Trust & Transparency',
      description: 'Every pet comes with verified health records and breeder certifications. No hidden history, just happy beginnings.',
      icon: <ShieldCheck className="w-6 h-6" />
    },
    {
      title: 'Lifelong Support',
      description: 'Our relationship doesn\'t end at adoption. We provide 24/7 guidance for new pet parents to ensure a smooth transition.',
      icon: <Users className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-slate-900 text-white">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#2ec2b3]/10 -skew-x-12 translate-x-1/4" />
          <div className="max-w-[1440px] mx-auto px-8 relative z-10">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-6xl font-black mb-8 leading-tight">
                  Connecting Loving Homes with <span className="text-[#2ec2b3]">Perfect Companions.</span>
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed mb-12">
                  Founded in 2012, PetShop has grown from a small local initiative to the nation's most trusted platform for ethical pet adoption and breeder connections.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {stats.map((stat, idx) => (
                    <div key={idx}>
                      <p className="text-3xl font-black text-[#2ec2b3] mb-1">{stat.value}</p>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-24">
          <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="rounded-[40px] overflow-hidden shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/about-mission/800/1000" 
                  alt="Our Mission" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-xs">
                <Award className="w-12 h-12 text-[#2ec2b3] mb-4" />
                <p className="font-black text-slate-900 dark:text-slate-100 mb-2">Award Winning Service</p>
                <p className="text-sm text-slate-500">Recognized for ethical breeding standards 2023.</p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-8">Our Mission & Vision</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                At PetShop, we believe that every animal deserves a loving home and every family deserves the joy of a pet. Our mission is to bridge the gap between ethical breeders and responsible owners through a platform built on trust, transparency, and compassion.
              </p>
              <div className="space-y-6">
                {values.map((value, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="w-12 h-12 bg-[#2ec2b3]/10 rounded-2xl flex items-center justify-center text-[#2ec2b3] shrink-0">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{value.title}</h3>
                      <p className="text-slate-500 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-6">How We Work</h2>
              <p className="text-slate-500 text-lg">A simple, transparent process designed for the well-being of our pets.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Discovery', desc: 'Browse our curated list of healthy, happy pets.' },
                { step: '02', title: 'Vetting', desc: 'We verify every breeder and health record.' },
                { step: '03', title: 'Connection', desc: 'Meet your potential new family member.' },
                { step: '04', title: 'Adoption', desc: 'Welcome your new best friend home.' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
                  <span className="text-5xl font-black text-slate-100 dark:text-slate-800 absolute top-4 right-8">{item.step}</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 relative z-10">{item.title}</h3>
                  <p className="text-slate-500 relative z-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-24">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="bg-[#2ec2b3] rounded-[48px] p-12 md:p-20 text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 translate-x-1/4" />
              <div className="max-w-2xl relative z-10">
                <h2 className="text-5xl font-black mb-6">Have Questions? <br />We're Here to Help.</h2>
                <p className="text-white/80 text-xl mb-10">Our team of pet experts is ready to assist you in finding your perfect match or answering any care-related questions.</p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-white text-[#2ec2b3] px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:brightness-105 transition-all">
                    <Mail className="w-5 h-5" />
                    Contact Support
                  </button>
                  <button className="bg-white/20 border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all">
                    FAQs
                  </button>
                </div>
              </div>
              <div className="relative z-10">
                <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <PawPrint className="w-32 h-32 text-white/20" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
