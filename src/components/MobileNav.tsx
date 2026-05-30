import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Image, Scissors, MessageSquare, User } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Início', path: '/', icon: Home },
  { name: 'Galeria', path: '/galeria', icon: Image },
  { name: 'Serviços', path: '/especialidades', icon: Scissors },
  { name: 'Contato', path: '/contato', icon: MessageSquare },
  { name: 'Sobre', path: '/sobre', icon: User },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
