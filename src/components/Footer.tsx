import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, MapPin, Phone, Clock } from 'lucide-react';
import { useDataContext } from '@/context/DataContext';

export default function Footer() {
  const { configuracoes } = useDataContext();

  const formatInstagramUrl = useCallback((handle: string) => {
    if (!handle) return '#';
    if (handle.startsWith('http')) return handle;
    const cleanHandle = handle.replace('@', '');
    return `https://instagram.com/${cleanHandle}`;
  }, []);

  const formatMapsUrl = useCallback((address: string) => {
    if (!address) return '#';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }, []);

  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Social */}
          <div className="space-y-4">
            <h2 className="font-montserrat text-3xl font-bold">Charpynter <span className="text-primary">Hair</span></h2>
            <p className="text-background/80 max-w-xs leading-relaxed">
              Transformando autoestimas através da arte capilar.
            </p>
            <div className="flex gap-4 pt-2">
              {configuracoes?.instagram && (
                <a href={formatInstagramUrl(configuracoes.instagram)} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background hover:bg-primary hover:text-primary-foreground transition-all">
                  <Instagram size={20} />
                </a>
              )}
              {configuracoes?.whatsapp && (
                <a href={`https://wa.me/${configuracoes.whatsapp}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background hover:bg-primary hover:text-primary-foreground transition-all">
                  <MessageCircle size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-montserrat text-lg font-semibold">Links Rápidos</h3>
            <ul className="space-y-3">
              <li><Link to="/sobre" className="text-background/80 hover:text-background transition-colors">Sobre o José</Link></li>
              <li><Link to="/especialidades" className="text-background/80 hover:text-background transition-colors">Nossas Especialidades</Link></li>
              <li><Link to="/galeria" className="text-background/80 hover:text-background transition-colors">Galeria de Resultados</Link></li>
              <li><Link to="/contato" className="text-background/80 hover:text-background transition-colors">Agende seu Horário</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-montserrat text-lg font-semibold">Contato</h3>
            <ul className="space-y-4">
              {configuracoes?.endereco && (
                <li className="flex items-start gap-3 text-background/80">
                  <MapPin className="text-primary shrink-0 mt-1" size={18} />
                  <a href={formatMapsUrl(configuracoes.endereco)} target="_blank" rel="noreferrer" className="hover:text-background transition-colors">
                    {configuracoes.endereco}
                  </a>
                </li>
              )}
              {configuracoes?.telefone && (
                <li className="flex items-center gap-3 text-background/80">
                  <Phone className="text-primary shrink-0" size={18} />
                  <span>{configuracoes.telefone}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="font-montserrat text-lg font-semibold">Horário de Funcionamento</h3>
            <ul className="space-y-2 text-background/80 text-sm">
              {configuracoes?.horario_segunda && <li className="flex items-center gap-2"><Clock size={14} className="text-primary" /> Seg: {configuracoes.horario_segunda}</li>}
              {configuracoes?.horario_terca && <li className="flex items-center gap-2"><Clock size={14} className="text-primary" /> Ter: {configuracoes.horario_terca}</li>}
              {configuracoes?.horario_quarta && <li className="flex items-center gap-2"><Clock size={14} className="text-primary" /> Qua: {configuracoes.horario_quarta}</li>}
              {configuracoes?.horario_quinta && <li className="flex items-center gap-2"><Clock size={14} className="text-primary" /> Qui: {configuracoes.horario_quinta}</li>}
              {configuracoes?.horario_sexta && <li className="flex items-center gap-2"><Clock size={14} className="text-primary" /> Sex: {configuracoes.horario_sexta}</li>}
              {configuracoes?.horario_sabado && <li className="flex items-center gap-2"><Clock size={14} className="text-primary" /> Sáb: {configuracoes.horario_sabado}</li>}
              {configuracoes?.horario_domingo && <li className="flex items-center gap-2"><Clock size={14} className="text-primary" /> Dom: {configuracoes.horario_domingo}</li>}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
          <p>© 2024 Charpynter Hair. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-background transition-colors">Política de Privacidade</Link>
            <Link to="#" className="hover:text-background transition-colors">Termos de Serviço</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
