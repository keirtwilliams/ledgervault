import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { 
  LogOut, Shield, Search, Bell, LayoutDashboard, 
  History, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { cn } from '../../utils/cn';

const Layout = () => {
  const { user, role, mockLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    if (mockLogout) mockLogout();
    navigate('/login');
  };

  const navItems = role === 'auditor' 
    ? [
        { name: 'Compliance Portal', path: '/auditor/compliance', icon: ShieldCheck },
        { name: 'Risk Alerts', path: '/auditor/alerts', icon: AlertTriangle },
      ]
    : [
        { name: 'Command Center', path: '/teller/dashboard', icon: LayoutDashboard },
        { name: 'Shift History', path: '/teller/history', icon: History },
      ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shrink-0 shadow-xl z-20">
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <div className="mr-3">
            <img src="/favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">LedgerVault</span>
        </div>
        
        <div className="flex-1 py-6 px-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Navigation</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20" 
                      : "hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium text-white truncate">{user?.email || 'teller@ledgervault.com'}</span>
              <span className="text-xs text-emerald-400 font-medium uppercase tracking-widest">{role || 'teller'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center flex-1 gap-6">
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
