import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, Settings, LogOut, Users, 
  ShoppingBag, Search, Bell, MoreHorizontal, TrendingUp, 
  TrendingDown, PawPrint, X, Check, Trash2, ExternalLink
} from 'lucide-react';
import { DashboardStats, Order, Pet } from '../types';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const socket = io();

export const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '', breed: '', type: 'Dog', gender: 'Male', color: '',
    dob: '', price: 0, description: '', image_url: '',
    health_status: 'Excellent', vaccination_status: 'Up to date',
    breeder_name: '', breeder_rating: 5.0, breeder_reviews: 0
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (selectedOrder) {
      fetch(`/api/admin/orders/${selectedOrder.id}/items`)
        .then(res => res.json())
        .then(data => setSelectedOrderItems(data))
        .catch(e => console.error(e));
    } else {
      setSelectedOrderItems([]);
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();

      socket.on('order:placed', (data) => {
        setOrders(prev => [data, ...prev]);
        setStats(data.stats);
      });

      socket.on('pet:added', (data) => {
        setPets(prev => [data, ...prev]);
        setStats(prev => prev ? { ...prev, totalPets: prev.totalPets + 1 } : null);
      });

      socket.on('pet:deleted', (data) => {
        setPets(prev => prev.filter(p => p.id !== Number(data.id)));
        setStats(prev => prev ? { ...prev, totalPets: prev.totalPets - 1 } : null);
      });

      return () => {
        socket.off('order:placed');
        socket.off('pet:added');
        socket.off('pet:deleted');
      };
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const ordersRes = await fetch('/api/admin/orders');
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      const petsRes = await fetch('/api/pets');
      const petsData = await petsRes.json();
      setPets(petsData);
    } catch (e) {
      console.error("Error fetching admin data:", e);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (e) {
      console.error("Status update error:", e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPet)
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewPet({
        name: '', breed: '', type: 'Dog', gender: 'Male', color: '',
        dob: '', price: 0, description: '', image_url: '',
        health_status: 'Excellent', vaccination_status: 'Up to date',
        breeder_name: '', breeder_rating: 5.0, breeder_reviews: 0
      });
    }
  };

  const handleDeletePet = async (id: number) => {
    if (confirm('Are you sure you want to delete this pet?')) {
      await fetch(`/api/admin/pets/${id}`, { method: 'DELETE' });
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 text-[#2ec2b3]">
          <PawPrint className="w-8 h-8" />
          <div>
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-black tracking-tight">PetAdmin</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Management Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={<PlusCircle className="w-5 h-5" />} label="Add Pet" onClick={() => setShowAddModal(true)} />
          <NavItem icon={<PawPrint className="w-5 h-5" />} label="Manage Pets" active={activeTab === 'Manage Pets'} onClick={() => setActiveTab('Manage Pets')} />
          <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Orders" active={activeTab === 'Orders'} onClick={() => setActiveTab('Orders')} />
          <NavItem icon={<Users className="w-5 h-5" />} label="Users" active={activeTab === 'Users'} onClick={() => setActiveTab('Users')} />
          <div className="pt-8 pb-4">
            <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
            <NavItem icon={<LogOut className="w-5 h-5 text-red-500" />} label="Logout" color="text-red-500" onClick={handleLogout} />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 w-full max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#2ec2b3]/50" 
                placeholder="Search for pets, orders or users..." 
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">Admin User</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Super Admin</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#2ec2b3]/20 overflow-hidden border border-[#2ec2b3]/20">
                <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'Dashboard' && (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="bg-[#2ec2b3]/10 border border-[#2ec2b3]/20 rounded-2xl p-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-[#2ec2b3] flex items-center justify-center text-white shadow-lg shadow-[#2ec2b3]/20">
                    <PlusCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Ready to expand your collection?</h3>
                    <p className="text-slate-500">Update your inventory with new arrivals today.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#2ec2b3] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#2ec2b3]/20 hover:brightness-105 transition-all"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add New Pet
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={<PawPrint className="w-6 h-6 text-[#2ec2b3]" />} 
                  label="TOTAL PETS" 
                  value={stats?.totalPets || 0} 
                  trend="+ 12%" 
                  trendUp={true} 
                />
                <StatCard 
                  icon={<ShoppingBag className="w-6 h-6 text-[#2ec2b3]" />} 
                  label="TOTAL ORDERS" 
                  value={stats?.totalOrders || 0} 
                  trend="+ 5%" 
                  trendUp={true} 
                />
                <StatCard 
                  icon={<TrendingUp className="w-6 h-6 text-[#2ec2b3]" />} 
                  label="TOTAL REVENUE" 
                  value={`$${stats?.totalRevenue.toLocaleString()}`} 
                  trend="+ 18%" 
                  trendUp={true} 
                />
                <StatCard 
                  icon={<Users className="w-6 h-6 text-[#2ec2b3]" />} 
                  label="TOTAL CUSTOMERS" 
                  value={stats?.totalCustomers || 0} 
                  trend="+ 12%" 
                  trendUp={true} 
                />
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Recent Orders</h3>
                  <button className="text-sm font-bold text-[#2ec2b3] hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-slate-100">{order.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <img src={`https://picsum.photos/seed/${order.customer_name}/100/100`} alt="" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{order.customer_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{order.date}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                              order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-slate-100">${order.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 text-slate-400 hover:text-[#2ec2b3] transition-colors"
                            >
                              <Search className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Manage Pets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Manage Pets</h2>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#2ec2b3] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Add Pet
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pets.map(pet => (
                  <div key={pet.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group">
                    <div className="aspect-square relative overflow-hidden">
                      <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button 
                          onClick={() => handleDeletePet(pet.id)}
                          className="p-2 bg-white/90 dark:bg-slate-900/90 text-red-500 rounded-lg shadow-sm hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-slate-900 dark:text-slate-100">{pet.name}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{pet.breed}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-black text-[#2ec2b3]">${pet.price.toLocaleString()}</span>
                        <span className="text-[10px] font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md uppercase tracking-widest">{pet.gender}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Pet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Add New Pet</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddPet} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Pet Name</label>
                  <input 
                    required
                    value={newPet.name}
                    onChange={e => setNewPet({...newPet, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3]" 
                    placeholder="e.g. Buddy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Breed</label>
                  <input 
                    required
                    value={newPet.breed}
                    onChange={e => setNewPet({...newPet, breed: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3]" 
                    placeholder="e.g. Golden Retriever"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Type</label>
                  <select 
                    value={newPet.type}
                    onChange={e => setNewPet({...newPet, type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3]"
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Gender</label>
                  <select 
                    value={newPet.gender}
                    onChange={e => setNewPet({...newPet, gender: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3]"
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Price ($)</label>
                  <input 
                    type="number"
                    required
                    value={newPet.price}
                    onChange={e => setNewPet({...newPet, price: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Image URL</label>
                  <input 
                    required
                    value={newPet.image_url}
                    onChange={e => setNewPet({...newPet, image_url: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3]" 
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  required
                  value={newPet.description}
                  onChange={e => setNewPet({...newPet, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3] h-32" 
                  placeholder="Tell us about this pet..."
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Breeder Name</label>
                  <input 
                    required
                    value={newPet.breeder_name}
                    onChange={e => setNewPet({...newPet, breeder_name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">DOB</label>
                  <input 
                    type="date"
                    required
                    value={newPet.dob}
                    onChange={e => setNewPet({...newPet, dob: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3]" 
                  />
                </div>
              </div>
            </form>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-4">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddPet}
                className="flex-1 py-3 bg-[#2ec2b3] text-white rounded-xl font-bold shadow-lg shadow-[#2ec2b3]/20 hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Save Pet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Order Details {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Customer Name</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    disabled={isUpdatingStatus}
                    className="bg-[#2ec2b3]/10 text-[#2ec2b3] text-[10px] font-black rounded uppercase tracking-widest border-none focus:ring-0 cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Payment Method</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedOrder.payment_method || 'N/A'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tracking Link</p>
                <Link 
                  to={`/track-order/${selectedOrder.id}`} 
                  target="_blank"
                  className="text-xs text-[#2ec2b3] font-bold flex items-center gap-1 hover:underline"
                >
                  View Customer Tracking Page <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Shipping Address</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedOrder.address}<br />
                  {selectedOrder.district}, {selectedOrder.state} - {selectedOrder.pincode}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Ordered Pets</p>
                <div className="space-y-3">
                  {selectedOrderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <img src={item.pet_image} alt={item.pet_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.pet_name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-[#2ec2b3] font-bold">${item.pet_price.toLocaleString()}</p>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-bold uppercase">
                            {item.pet_condition || 'Excellent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Amount</p>
                <p className="text-2xl font-black text-[#f97316]">${selectedOrder.amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active = false, color = "text-slate-600 dark:text-slate-400", onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
    active ? 'bg-[#2ec2b3] text-white shadow-lg shadow-[#2ec2b3]/20' : `hover:bg-slate-100 dark:hover:bg-slate-800 ${color}`
  }`}>
    {icon}
    <span className="text-sm font-bold">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, trend, trendUp }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
    <div className="flex items-center justify-between mb-4">
      <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-black tracking-widest ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {trend}
      </div>
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
  </div>
);
