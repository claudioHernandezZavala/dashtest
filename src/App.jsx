import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Workflow, 
  Bell, 
  Settings, 
  Package, 
  Truck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft, 
  MessageSquare, 
  X, 
  Send, 
  Search,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  Box,
  Clock,
  CheckCircle2
} from 'lucide-react';

// --- Mock Data ---

const METRICS = {
  operationsLastWeek: { value: 1245, change: "+12%", trend: 'up' },
  operationsYesterday: { value: 182, change: "-5%", trend: 'down' },
  returnsYesterday: { value: 14, change: "+2%", trend: 'up' }, // High alert
};

const SHIPPING_QUEUE = [
  { id: 'ORD-7782', customer: 'Alice Freeman', items: 3, status: 'Ready', deadline: '2 hours' },
  { id: 'ORD-7783', customer: 'Mark Stone', items: 1, status: 'Ready', deadline: '4 hours' },
  { id: 'ORD-7785', customer: 'Sarah Jenkins', items: 5, status: 'Delayed', deadline: 'Overdue' },
];

const STUCK_INVENTORY = [
  { id: 'SKU-9921', name: 'Vintage Denim Jkt', days: 24, location: 'Bin A-12' },
  { id: 'SKU-8822', name: 'Leather Belt (Brn)', days: 21, location: 'Bin B-04' },
  { id: 'SKU-1102', name: 'Canvas Sneakers', days: 21, location: 'Bin D-01' },
];

const RETURNS_DATA = [
  { id: 'RET-001', item: 'Blue Silk Shirt', reason: 'Wrong Size', date: 'Yesterday', status: 'Restocked' },
  { id: 'RET-002', item: 'Ceramic Vase', reason: 'Damaged', date: 'Yesterday', status: 'Written Off' },
  { id: 'RET-003', item: 'Running Shoes', reason: 'Changed Mind', date: 'Yesterday', status: 'Pending' },
  { id: 'RET-004', item: 'Winter Coat', reason: 'Defective Zipper', date: 'Yesterday', status: 'Vendor Return' },
];

const WORKFLOWS = [
  { id: 1, name: 'Daily Opening', progress: 100, status: 'Completed', owner: 'Morning Shift' },
  { id: 2, name: 'Send Report to manager@gmail.com', progress: 100, status: 'Completed', owner: 'AI Agent' },
  { id: 3, name: 'Count Inventory (Morning)', progress: 45, status: 'In Progress', owner: 'AI Vision' },
  { id: 4, name: 'Seasonal Display Setup', progress: 10, status: 'Pending', owner: 'Visual Merch' },
];

const REMINDERS = [
  { id: 1, title: 'Approve Timecards', due: 'Today, 5:00 PM', priority: 'High' },
  { id: 2, title: 'Order Packaging Supplies', due: 'Tomorrow', priority: 'Medium' },
  { id: 3, title: 'Review Q3 Goals', due: 'Friday', priority: 'Low' },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`group flex items-center w-full p-3 mb-2 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={22} strokeWidth={2} />
    <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
      {label}
    </span>
    {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
  </button>
);

const Card = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-slate-600 hover:bg-slate-800 hover:shadow-xl' : ''} ${className}`}
  >
    {children}
  </div>
);

const MetricCapsule = ({ label, value, trend, trendValue, icon: Icon, onClick, highlight }) => (
  <Card onClick={onClick} className={`relative overflow-hidden group ${highlight ? 'ring-1 ring-blue-500/30' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${highlight ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{label}</h3>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
    {onClick && (
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
        <ArrowLeft size={16} className="rotate-180" />
      </div>
    )}
  </Card>
);

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your store operations assistant. I noticed returns were up 2% yesterday. Would you like a breakdown?", sender: 'ai' }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages([...messages, newMsg]);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      let responseText = "I can help with that. Let me pull up the relevant data.";
      if (input.toLowerCase().includes('return')) {
        responseText = "Most returns yesterday were due to sizing issues with the new denim line. I recommend checking the size guide on the product page.";
      } else if (input.toLowerCase().includes('shipping')) {
        responseText = "You have 3 critical orders pending. Order #7785 is currently overdue.";
      } else if (input.toLowerCase().includes('stuck')) {
        responseText = "The Vintage Denim Jackets in Bin A-12 have been there for 24 days. Consider running a flash sale.";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, sender: 'ai' }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-semibold text-white">Store Copilot</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-900/95">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-slate-800 border-t border-slate-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about sales, inventory..."
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-blue-900/20 transition-all duration-300 ${
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105'
        }`}
      >
        <MessageSquare size={24} fill={isOpen ? "none" : "currentColor"} />
      </button>
    </div>
  );
};

// --- Page Views ---

const DashboardHome = ({ onNavigate }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Operations Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Store #402 • New York, NY</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
          Store Open
        </span>
        <span className="text-slate-500 text-sm">Last updated: Just now</span>
      </div>
    </div>

    {/* Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCapsule 
        label="Total Ops (Last Week)" 
        value={METRICS.operationsLastWeek.value} 
        trend={METRICS.operationsLastWeek.trend} 
        trendValue={METRICS.operationsLastWeek.change}
        icon={Box}
      />
      <MetricCapsule 
        label="Total Ops (Yesterday)" 
        value={METRICS.operationsYesterday.value} 
        trend={METRICS.operationsYesterday.trend} 
        trendValue={METRICS.operationsYesterday.change}
        icon={Clock}
      />
      <MetricCapsule 
        label="Returns (Yesterday)" 
        value={METRICS.returnsYesterday.value} 
        trend={METRICS.returnsYesterday.trend} 
        trendValue={METRICS.returnsYesterday.change}
        icon={ArrowLeft}
        highlight
        onClick={() => onNavigate('returns')}
      />
    </div>

    {/* Action Center Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Shipping Queue */}
      <Card className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Truck size={20} />
            </div>
            <h2 className="text-lg font-semibold text-white">Shipping Queue</h2>
          </div>
          <button className="text-xs font-medium text-blue-400 hover:text-blue-300">View All</button>
        </div>
        <div className="space-y-4 flex-1">
          {SHIPPING_QUEUE.map((order) => (
            <div key={order.id} className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-medium text-xs">
                  {order.id.split('-')[1]}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200">{order.customer}</h4>
                  <p className="text-xs text-slate-500">{order.items} items • {order.id}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                  order.deadline === 'Overdue' 
                    ? 'bg-rose-500/20 text-rose-400' 
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {order.deadline}
                </span>
              </div>
            </div>
          ))}
          <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
             <AlertTriangle size={18} className="text-blue-400 mt-0.5 shrink-0" />
             <p className="text-xs text-blue-300/80 leading-relaxed">
               You have <span className="text-blue-200 font-bold">3 items</span> that need to be shipped immediately. Pickup scheduled for 4:00 PM.
             </p>
          </div>
        </div>
      </Card>

      {/* Stuck Inventory */}
      <Card className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-lg font-semibold text-white">Stagnant Inventory</h2>
          </div>
          <button className="text-xs font-medium text-blue-400 hover:text-blue-300">Manage</button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-3 uppercase tracking-wider font-semibold">
             <span>Item</span>
             <span>Dwell Time</span>
          </div>
          {STUCK_INVENTORY.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
               <div>
                  <h4 className="text-sm font-medium text-slate-200">{item.name}</h4>
                  <p className="text-xs text-slate-500">{item.location} • {item.id}</p>
               </div>
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[80%] rounded-full" />
                  </div>
                  <span className="text-xs font-bold text-rose-400 w-12 text-right">{item.days} days</span>
               </div>
            </div>
          ))}
          <div className="mt-auto pt-2">
            <button className="w-full py-2 rounded-lg bg-slate-800 text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
              Create Markdown Workflow
            </button>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

const ReturnsDetail = ({ onBack }) => (
  <div className="animate-in slide-in-from-right-10 duration-300 space-y-6">
    <div className="flex items-center gap-4 mb-8">
      <button 
        onClick={onBack}
        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-white">Returns Analysis</h1>
        <p className="text-slate-400 text-sm">Detailed breakdown of yesterday's inbound logistics.</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:bg-slate-700">
          <Calendar size={16} />
          <span>Yesterday</span>
        </button>
        <button className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="col-span-1 md:col-span-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">ID</th>
                <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item</th>
                <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {RETURNS_DATA.map((ret) => (
                <tr key={ret.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 pl-4 font-mono text-xs text-slate-400">{ret.id}</td>
                  <td className="py-4 text-sm font-medium text-slate-200">{ret.item}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                      {ret.reason}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`text-xs font-bold ${
                      ret.status === 'Restocked' ? 'text-emerald-400' : 
                      ret.status === 'Written Off' ? 'text-rose-400' : 
                      'text-amber-400'
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-blue-900/20 to-slate-800 border-blue-500/20">
          <h3 className="text-sm font-bold text-blue-100 mb-2">Insight</h3>
          <p className="text-sm text-blue-200/80 leading-relaxed mb-4">
            30% of returns yesterday were due to "Wrong Size" on the new winter collection. 
          </p>
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors">
            Update Size Guide
          </button>
        </Card>
        
        <Card>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Processing Time</h3>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold text-white">4.2</span>
            <span className="text-sm text-slate-500">hours avg</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs text-emerald-400">12% faster than last week</p>
        </Card>
      </div>
    </div>
  </div>
);

const WorkflowsPage = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-white">Store Workflows</h1>
      <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
        + New Workflow
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {WORKFLOWS.map((wf) => (
        <Card key={wf.id} className="hover:border-slate-600 transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${
              wf.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 
              wf.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' : 
              'bg-slate-700/50 text-slate-400'
            }`}>
              <Workflow size={20} />
            </div>
            <MoreHorizontal size={16} className="text-slate-500 group-hover:text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">{wf.name}</h3>
          <p className="text-sm text-slate-500 mb-6">Owner: {wf.owner}</p>
          
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">{wf.progress}% Complete</span>
            <span className={`font-medium ${
               wf.status === 'Completed' ? 'text-emerald-400' : 'text-blue-400'
            }`}>{wf.status}</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                wf.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
              }`} 
              style={{ width: `${wf.progress}%` }} 
            />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const RemindersPage = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <h1 className="text-2xl font-bold text-white">Tasks & Reminders</h1>
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
      {REMINDERS.map((item, idx) => (
        <div 
          key={item.id} 
          className={`p-4 flex items-center gap-4 hover:bg-slate-800 transition-colors ${
            idx !== REMINDERS.length - 1 ? 'border-b border-slate-700/50' : ''
          }`}
        >
          <button className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-slate-600 hover:border-blue-500 hover:bg-blue-500/20 transition-all" />
          <div className="flex-1">
            <h4 className="text-slate-200 font-medium">{item.title}</h4>
            <p className="text-xs text-slate-500">Due: {item.due}</p>
          </div>
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
            item.priority === 'High' ? 'bg-rose-500/10 text-rose-400' :
            item.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
            'bg-slate-700 text-slate-400'
          }`}>
            {item.priority} Priority
          </span>
        </div>
      ))}
      <div className="p-4 bg-slate-800/30 border-t border-slate-700/50">
        <button className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
          + Add new task
        </button>
      </div>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
    <h1 className="text-2xl font-bold text-white">Store Settings</h1>
    
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">General</h3>
        <Card className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-slate-200 font-medium">Store Name</h4>
              <p className="text-xs text-slate-500">Visible on invoices and dashboard</p>
            </div>
            <input type="text" defaultValue="Downtown Flagship #402" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-slate-200 font-medium">Timezone</h4>
              <p className="text-xs text-slate-500">For operations tracking</p>
            </div>
            <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
              <option>Eastern Time (EST)</option>
              <option>Pacific Time (PST)</option>
            </select>
          </div>
        </Card>
      </section>

      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Notifications</h3>
        <Card className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-slate-200 font-medium">Daily Summary Email</h4>
            <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <h4 className="text-slate-200 font-medium">Inventory Alerts</h4>
            <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </Card>
      </section>
    </div>
  </div>
);

// --- Main App Component ---

const App = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Helper to handle navigation including drill-downs
  const handleNavigate = (page) => {
    setActivePage(page);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardHome onNavigate={handleNavigate} />;
      case 'returns':
        return <ReturnsDetail onBack={() => setActivePage('dashboard')} />;
      case 'workflows':
        return <WorkflowsPage />;
      case 'reminders':
        return <RemindersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Sidebar */}
      <div 
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
        className={`bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-6 flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
            <Package className="text-white" size={20} />
          </div>
          <span className={`font-bold text-xl text-white tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            Nexus<span className="text-blue-500">Ops</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activePage === 'dashboard' || activePage === 'returns'} 
            onClick={() => setActivePage('dashboard')} 
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            icon={Workflow} 
            label="Workflows" 
            active={activePage === 'workflows'} 
            onClick={() => setActivePage('workflows')} 
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            icon={CheckCircle2} 
            label="Reminders" 
            active={activePage === 'reminders'} 
            onClick={() => setActivePage('reminders')} 
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activePage === 'settings'} 
            onClick={() => setActivePage('settings')} 
            collapsed={sidebarCollapsed}
          />
        </nav>

        <div className="p-4 mt-auto">
          <div className={`rounded-xl bg-slate-800 p-3 flex items-center gap-3 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0" />
            <div className={`overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              <p className="text-sm font-medium text-white">Jane Manager</p>
              <p className="text-xs text-slate-500">Store #402</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex justify-between items-center md:hidden">
           <span className="font-bold text-lg text-white">NexusOps</span>
           <button className="text-slate-400"><MoreHorizontal /></button>
        </header>
        
        <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24">
          {renderContent()}
        </div>
      </main>

      {/* AI Helper Widget */}
      <AIChatWidget />
    </div>
  );
};

export default App;
