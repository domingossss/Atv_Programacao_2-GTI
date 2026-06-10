import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataContext } from '@/context/DataContext';

const NAV_LINKS = [
  { name: 'Início', path: '/' },
  { name: 'Galeria', path: '/galeria' },
  { name: 'Especialidades', path: '/especialidades' },
  { name: 'Contato', path: '/contato' },
  { name: 'Sobre', path: '/sobre' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scheduleText, setScheduleText] = useState('Verificando...');
  const { configuracoes } = useDataContext();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getTodayHours = useCallback(() => {
    if (!configuracoes) return null;
    const days = [
      'horario_domingo', 'horario_segunda', 'horario_terca',
      'horario_quarta', 'horario_quinta', 'horario_sexta', 'horario_sabado'
    ];
    const today = new Date().getDay();
    return String(configuracoes[days[today] as keyof typeof configuracoes]);
  }, [configuracoes]);

  const todayHours = useMemo(() => getTodayHours(), [getTodayHours]);

  useEffect(() => {
    const checkStatus = () => {
      if (!todayHours) return;

      const hoursStr = String(todayHours);

      if (hoursStr.toLowerCase().includes('fechado') || hoursStr.toLowerCase().includes('folga')) {
        setIsOpen(false);
        setScheduleText('Fechado Hoje');
        return;
      }

      const timeRegex = /\d{1,2}:\d{2}/g;
      const times = hoursStr.match(timeRegex);

      if (times && times.length >= 2) {
        const abreAs = times[0];
        const fechaAs = times[1];
        
        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

        const [openH, openM] = abreAs.split(':').map(Number);
        const [closeH, closeM] = fechaAs.split(':').map(Number);
        
        const openTimeInMinutes = openH * 60 + openM;
        const closeTimeInMinutes = closeH * 60 + closeM;

        if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
          setIsOpen(true);
          setScheduleText(`Aberto • ${abreAs} às ${fechaAs}`);
        } else {
          setIsOpen(false);
          setScheduleText(`Fechado • Abre às ${abreAs}`);
        }
      } else {
        setScheduleText(`Hoje: ${hoursStr}`);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [todayHours]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border py-3' : 'bg-background/80 backdrop-blur-sm border-b border-border/50 py-4'}`}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        
        {/* Logo - Minimalist */}
        <Link to="/" className="relative z-50 flex-shrink-0 transition-transform hover:scale-105">
          <h1 className="font-montserrat text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground whitespace-nowrap">
            Charpynter <span className="text-primary font-medium">Hair</span>
          </h1>
        </Link>

        {/* Centered Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary relative whitespace-nowrap ${
                location.pathname === link.path ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary rounded-full"
                  initial={false}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Side - Status & CTA */}
        <div className="flex items-center gap-4">
          
          {/* Status Indicator */}
          <div className="hidden lg:flex flex-col items-end justify-center leading-tight">
            {todayHours && (
              <>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {isOpen && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? 'bg-accent' : 'bg-red-500'}`}></span>
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isOpen ? 'text-accent' : 'text-red-500'}`}>
                    {isOpen ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                  {scheduleText.includes('•') ? scheduleText.split('•')[1] : scheduleText}
                </span>
              </>
            )}
          </div>

          {/* Prominent CTA Button */}
          <Button asChild className="h-10 md:h-11 px-6 md:px-8 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 flex-shrink-0">
            <Link to="/contato" className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="hidden sm:inline">Agendar Agora</span>
              <span className="sm:hidden">Agendar</span>
            </Link>
          </Button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden relative z-50 p-2 -mr-2 text-foreground hover:text-primary transition-colors flex-shrink-0"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-0 left-0 right-0 bg-background/98 backdrop-blur-md border-b border-border pt-20 pb-6 px-4 shadow-xl flex flex-col gap-2 md:hidden"
          >
            {todayHours && (
              <div className="flex items-center justify-between p-4 mb-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    {isOpen && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isOpen ? 'bg-accent' : 'bg-red-500'}`}></span>
                  </span>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isOpen ? 'text-accent' : 'text-red-500'}`}>
                      {isOpen ? 'Aberto' : 'Fechado'}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {scheduleText.includes('•') ? scheduleText.split('•')[1] : scheduleText}
                    </span>
                  </div>
                </div>
                <Clock size={18} className="text-muted-foreground/50" />
              </div>
            )}

            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-base font-medium p-4 rounded-xl transition-colors ${
                  location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
