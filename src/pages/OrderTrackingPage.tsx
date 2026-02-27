import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { 
  Package, Truck, CheckCircle, Clock, MapPin, 
  ChevronRight, ArrowLeft, ExternalLink, Calendar, User
} from 'lucide-react';
import { motion } from 'motion/react';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id || id === 'search') {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/public/orders/${encodeURIComponent(id || '')}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2ec2b3] border-t-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <Package className="w-16 h-16 text-slate-300 mb-6" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-4">Track Your Order</h2>
          <p className="text-slate-500 mb-8 text-center max-w-md">Enter your Order ID (e.g., #ORD-1234) to see the current status and estimated delivery time.</p>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as any).orderId.value;
              if (input) window.location.href = `/track-order/${encodeURIComponent(input)}`;
            }}
            className="w-full max-w-md flex gap-2"
          >
            <input 
              name="orderId"
              placeholder="Enter Order ID..."
              className="flex-1 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-[#2ec2b3] outline-none font-bold"
            />
            <button className="px-8 py-4 bg-[#2ec2b3] text-white rounded-2xl font-bold hover:brightness-105 transition-all">
              Track
            </button>
          </form>

          <Link to="/" className="mt-12 text-slate-500 font-bold hover:text-[#2ec2b3] flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate estimated delivery (5 days after order date)
  const orderDate = new Date(order.date);
  const estDelivery = new Date(orderDate);
  estDelivery.setDate(orderDate.getDate() + 5);
  const estDeliveryStr = estDelivery.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const steps = [
    { title: 'Order Placed', icon: <Package className="w-5 h-5" />, date: order.date, completed: true },
    { title: 'Processing', icon: <Clock className="w-5 h-5" />, date: order.status === 'PENDING' ? 'Pending' : 'In Progress', completed: order.status !== 'PENDING' && order.status !== 'CANCELLED' },
    { title: 'Shipped', icon: <Truck className="w-5 h-5" />, date: (order.status === 'SHIPPED' || order.status === 'DELIVERED') ? 'Completed' : 'Pending', completed: order.status === 'SHIPPED' || order.status === 'DELIVERED' },
    { title: 'Delivered', icon: <CheckCircle className="w-5 h-5" />, date: order.status === 'DELIVERED' ? 'Completed' : 'Pending', completed: order.status === 'DELIVERED' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="max-w-4xl mx-auto w-full px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#2ec2b3] mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Top Banner */}
          <div className={`${order.status === 'CANCELLED' ? 'bg-red-500' : 'bg-[#2ec2b3]'} p-8 text-white`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">Order Tracking</p>
                <h1 className="text-3xl font-black">{order.id}</h1>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Estimated Delivery</p>
                <p className="text-xl font-black">{estDeliveryStr}</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* Progress Tracker */}
            <div className="relative mb-16">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2" />
              <div className="relative flex justify-between items-center">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${step.completed ? 'bg-[#2ec2b3] border-white dark:border-slate-900 text-white shadow-lg shadow-[#2ec2b3]/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300'}`}>
                      {step.icon}
                    </div>
                    <div className="absolute top-14 text-center whitespace-nowrap">
                      <p className={`text-sm font-bold ${step.completed ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>{step.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-24">
              {/* Order Items */}
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#2ec2b3]" />
                  Order Items
                </h3>
                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img src={item.pet_image} alt={item.pet_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{item.pet_name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-[#2ec2b3] font-bold">${item.pet_price.toLocaleString()}</p>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-bold uppercase">
                            {item.pet_condition || 'Excellent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Amount Paid</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">${order.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Shipping Info & Actions */}
              <div className="space-y-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#2ec2b3]" />
                    Shipping Details
                  </h3>
                  <div className="space-y-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{order.customer_name}</p>
                        <p className="text-xs">{order.customer_email}</p>
                        <p className="text-xs">{order.customer_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed">
                        {order.address}, {order.district}, {order.state} - {order.pincode}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm">
                        Payment: <span className="font-bold text-slate-900 dark:text-slate-100">{order.payment_method || 'N/A'}</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm">
                        Standard Shipping (3-5 Business Days)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Track with Partner
                  </button>
                  <p className="text-center text-xs text-slate-500">
                    Tracking link will be active once the order is shipped.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
