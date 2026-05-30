import React, { useState, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Image as ImageIcon, 
  Package, 
  Mail, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
  { name: 'Galeria', path: '/admin/galeria', icon: ImageIcon },
  { name: 'Catálogo', path: '/admin/catalogo', icon: Package },
  { name: 'Leads', path: '/admin/leads', icon: Mail },
  { name: 'Configurações', path: '/admin/configuracoes', icon: Settings },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('josemegahair_isAuthenticated'); 
    localStorage.removeItem('adminToken');
    toast.info('Sessão encerrada com sucesso.'); 
    navigate('/admin/login', { replace: true }); 
  }, [navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--admin-background))] flex">
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[hsl(var(--admin-sidebar))] text-white
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h2 className="font-sans text-2xl font-bold text-primary">CharpynterHair</h2>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-primary/20 text-primary font-medium shadow-inner' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} className={isActive ? 'text-primary' : 'text-white/70'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white/70 hover:bg-destructive/20 hover:text-red-400 transition-colors duration-200"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
          <h2 className="font-sans text-xl font-bold text-foreground">Painel Admin</h2>
          <button onClick={toggleSidebar} className="text-foreground p-2 rounded-md hover:bg-muted">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
