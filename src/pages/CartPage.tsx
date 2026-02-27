import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, CheckCircle, MapPin, Phone, Mail, User } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Cart, 2: Details, 3: Payment
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    paymentMethod: 'Credit Card'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          address: formData.address,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          payment_method: formData.paymentMethod,
          amount: cartTotal,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image_url: item.image_url,
            condition: item.health_status
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPlacedOrderId(data.id);
        setOrderSuccess(true);
        clearCart();
      }
    } catch (e) {
      console.error("Order error:", e);
    } finally {
      setIsOrdering(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-4">Order Placed!</h2>
            <p className="text-slate-500 mb-2">Thank you for your order. Your Order ID is:</p>
            <div className="bg-slate-100 dark:bg-slate-800 py-3 px-6 rounded-2xl font-black text-xl text-[#2ec2b3] mb-6 inline-block">
              {placedOrderId}
            </div>
            <p className="text-slate-500 mb-8">Estimated delivery: 3-5 business days. You can track your order in real-time.</p>
            <div className="space-y-4">
              <button 
                onClick={() => navigate(`/track-order/${placedOrderId}`)}
                className="w-full bg-[#2ec2b3] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#2ec2b3]/20 hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                Track Your Order
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="max-w-[1440px] mx-auto w-full px-8 py-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-12 tracking-tight">Your Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8">Looks like you haven't added any pets to your cart yet.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#2ec2b3] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#2ec2b3]/20 hover:brightness-105 transition-all"
            >
              Browse Pets
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Step Indicator */}
            <div className="lg:w-64 shrink-0">
              <div className="sticky top-24 space-y-4">
                {[
                  { id: 1, name: 'Review Cart' },
                  { id: 2, name: 'User Details' },
                  { id: 3, name: 'Payment' }
                ].map((s) => (
                  <div key={s.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s.id ? 'bg-[#2ec2b3] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                      {s.id}
                    </div>
                    <span className={`font-bold ${step === s.id ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-8">Review Your Selection</h2>
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 flex gap-6 shadow-sm border border-slate-200 dark:border-slate-800 group">
                      <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{item.name}</h3>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-[#2ec2b3] uppercase tracking-widest">{item.breed}</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-xs text-slate-500 font-medium">
                            Quantity: {item.quantity}
                          </div>
                          <div className="text-xl font-black text-[#f97316]">
                            ${(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end mt-8">
                    <button 
                      onClick={() => setStep(2)}
                      className="bg-[#2ec2b3] text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-[#2ec2b3]/20 hover:brightness-105 transition-all flex items-center gap-2"
                    >
                      Next: User Details
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-8">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3] transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3] transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3] transition-all"
                      />
                    </div>
                    <div className="relative md:col-span-2">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <textarea 
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Full Address"
                        rows={3}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3] transition-all"
                      />
                    </div>
                    <input 
                      required
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="District"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3] transition-all"
                    />
                    <input 
                      required
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3] transition-all"
                    />
                    <input 
                      required
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Pin Code"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3] transition-all"
                    />
                  </div>
                  <div className="flex justify-between mt-12">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-8 py-4 text-slate-500 font-bold hover:text-slate-900 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      disabled={!formData.name || !formData.email || !formData.phone || !formData.address}
                      className="bg-[#2ec2b3] text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-[#2ec2b3]/20 hover:brightness-105 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      Next: Payment
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-8">Payment Method</h2>
                  <div className="space-y-4">
                    {['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'].map((method) => (
                      <label 
                        key={method}
                        className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method ? 'border-[#2ec2b3] bg-[#2ec2b3]/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === method ? 'border-[#2ec2b3]' : 'border-slate-300'}`}>
                            {formData.paymentMethod === method && <div className="w-3 h-3 bg-[#2ec2b3] rounded-full" />}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{method}</span>
                        </div>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value={method}
                          checked={formData.paymentMethod === method}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Total to Pay</p>
                        <p className="text-4xl font-black text-slate-900 dark:text-slate-100">${cartTotal.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Items</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">{cart.length}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <button 
                        onClick={() => setStep(2)}
                        className="px-8 py-4 text-slate-500 font-bold hover:text-slate-900 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={isOrdering}
                        className="flex-1 bg-[#2ec2b3] text-white py-4 rounded-2xl font-bold shadow-xl shadow-[#2ec2b3]/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isOrdering ? 'Processing...' : (
                          <>
                            Confirm & Place Order
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
