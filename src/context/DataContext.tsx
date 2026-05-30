import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { GaleriaItem, CatalogoItem, Configuracoes, Lead } from '@/types';

const DEFAULT_GALERIA: GaleriaItem[] = [
  { id: '1', titulo: 'Loiro Perolado', descricao: 'Mega Hair 60cm', categoria: 'mega_hair', imagem: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800', data_upload: new Date().toISOString() },
  { id: '2', titulo: 'Morena Iluminada', descricao: 'Técnica de cor sem danos', categoria: 'coloracao', imagem: 'https://images.unsplash.com/photo-1634449278411-b75fd0706240?auto=format&fit=crop&q=80&w=800', data_upload: new Date().toISOString() },
  { id: '3', titulo: 'Corte Visagismo', descricao: 'Renovação completa', categoria: 'corte', imagem: 'https://images.unsplash.com/photo-1595944025373-64a5ecfbf484?auto=format&fit=crop&q=80&w=800', data_upload: new Date().toISOString() },
  { id: '4', titulo: 'Mega Hair Invisível', descricao: 'Fita adesiva premium', categoria: 'mega_hair', imagem: 'https://images.unsplash.com/photo-1677746854194-cacbf72ae71a?auto=format&fit=crop&q=80&w=800', data_upload: new Date().toISOString() },
  { id: '5', titulo: 'Ruivo Acobreado', descricao: 'Coloração vibrante', categoria: 'coloracao', imagem: 'https://images.unsplash.com/photo-1519816034042-37d2a57b79c7?auto=format&fit=crop&q=80&w=800', data_upload: new Date().toISOString() },
  { id: '6', titulo: 'Manutenção Mega', descricao: 'Cliente fiel', categoria: 'mega_hair', imagem: 'https://images.unsplash.com/photo-1650270121456-044e2db2dcdd?auto=format&fit=crop&q=80&w=800', data_upload: new Date().toISOString() },
];

const DEFAULT_CATALOGO: CatalogoItem[] = [
  { id: '1', nome: 'Cabelo Brasileiro do Sul', descricao: 'Fios inteiros e hidratados com pontas cheias', preco: 1500, imagem: 'https://images.unsplash.com/photo-1519816034042-37d2a57b79c7?auto=format&fit=crop&q=80&w=800', tipo: 'Liso', comprimento: '60cm', estoque: 5 },
  { id: '2', nome: 'Cabelo Ondulado Premium', descricao: 'Ondulação natural, sem químicas', preco: 1800, imagem: 'https://images.unsplash.com/photo-1634449278411-b75fd0706240?auto=format&fit=crop&q=80&w=800', tipo: 'Ondulado', comprimento: '70cm', estoque: 3 },
  { id: '3', nome: 'Cabelo Cacheado Orgânico', descricao: 'Cachos definidos e volumosos', preco: 1200, imagem: 'https://images.unsplash.com/photo-1650270121456-044e2db2dcdd?auto=format&fit=crop&q=80&w=800', tipo: 'Cacheado', comprimento: '50cm', estoque: 8 },
];

const DEFAULT_CONFIGURACOES: Configuracoes = {
  telefone: '+55 12 98200-1553',
  whatsapp: '5512982001553',
  email: 'contato@josemegahair.com',
  instagram: '@josemegahair',
  endereco: 'Av. Sete de Setembro, 317, 12606-150 Lorena, SP',
  horario_segunda: '09:00 - 18:00',
  horario_terca: '09:00 - 18:00',
  horario_quarta: '09:00 - 18:00',
  horario_quinta: '09:00 - 18:00',
  horario_sexta: '09:00 - 18:00',
  horario_sabado: '09:00 - 17:00',
  horario_domingo: 'Fechado'
};

interface DataContextValue {
  galeria: GaleriaItem[];
  catalogo: CatalogoItem[];
  configuracoes: Configuracoes;
  leads: Lead[];
  isLoaded: boolean;
  loadGaleria: () => void;
  saveGaleria: (fotos: GaleriaItem[]) => void;
  loadCatalogo: () => void;
  saveCatalogo: (produtos: CatalogoItem[]) => void;
  loadConfiguracoes: () => void;
  saveConfiguracoes: (config: Configuracoes) => void;
  loadLeads: () => void;
  saveLeads: (leads: Lead[]) => void;
  addFoto: (foto: GaleriaItem) => void;
  editFoto: (id: string, dados: Partial<GaleriaItem>) => void;
  deleteFoto: (id: string) => void;
  addProduto: (produto: CatalogoItem) => void;
  editProduto: (id: string, dados: Partial<CatalogoItem>) => void;
  deleteProduto: (id: string) => void;
  updateConfiguracoes: (dados: Partial<Configuracoes>) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, dados: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
}

export const DataContext = createContext<DataContextValue | null>(null);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [galeria, setGaleria] = useState<GaleriaItem[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>(DEFAULT_CONFIGURACOES);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadAllData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'josemegahair_galeria' && e.newValue) {
        setGaleria(JSON.parse(e.newValue));
      }
      if (e.key === 'josemegahair_catalogo' && e.newValue) {
        setCatalogo(JSON.parse(e.newValue));
      }
      if (e.key === 'josemegahair_configuracoes' && e.newValue) {
        setConfiguracoes(JSON.parse(e.newValue));
      }
      if (e.key === 'josemegahair_leads' && e.newValue) {
        setLeads(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadAllData = () => {
    loadGaleria();
    loadCatalogo();
    loadConfiguracoes();
    loadLeads();
    setIsLoaded(true);
  };

  const loadGaleria = () => {
    const stored = localStorage.getItem('josemegahair_galeria');
    if (stored) {
      setGaleria(JSON.parse(stored));
    } else {
      setGaleria(DEFAULT_GALERIA);
      localStorage.setItem('josemegahair_galeria', JSON.stringify(DEFAULT_GALERIA));
    }
  };

  const saveGaleria = (fotos: GaleriaItem[]) => {
    setGaleria(fotos);
    localStorage.setItem('josemegahair_galeria', JSON.stringify(fotos));
  };

  const loadCatalogo = () => {
    const stored = localStorage.getItem('josemegahair_catalogo');
    if (stored) {
      setCatalogo(JSON.parse(stored));
    } else {
      setCatalogo(DEFAULT_CATALOGO);
      localStorage.setItem('josemegahair_catalogo', JSON.stringify(DEFAULT_CATALOGO));
    }
  };

  const saveCatalogo = (produtos: CatalogoItem[]) => {
    setCatalogo(produtos);
    localStorage.setItem('josemegahair_catalogo', JSON.stringify(produtos));
  };

  const loadConfiguracoes = () => {
    const stored = localStorage.getItem('josemegahair_configuracoes');
    if (stored) {
      setConfiguracoes(JSON.parse(stored));
    } else {
      setConfiguracoes(DEFAULT_CONFIGURACOES);
      localStorage.setItem('josemegahair_configuracoes', JSON.stringify(DEFAULT_CONFIGURACOES));
    }
  };

  const saveConfiguracoes = (config: Configuracoes) => {
    setConfiguracoes(config);
    localStorage.setItem('josemegahair_configuracoes', JSON.stringify(config));
  };

  const addFoto = (foto: GaleriaItem) => {
    const updated = [foto, ...galeria];
    saveGaleria(updated);
  };

  const editFoto = (id: string, dados: Partial<GaleriaItem>) => {
    const updated = galeria.map(f => f.id === id ? { ...f, ...dados } : f);
    saveGaleria(updated);
  };

  const deleteFoto = (id: string) => {
    const updated = galeria.filter(f => f.id !== id);
    saveGaleria(updated);
  };

  const addProduto = (produto: CatalogoItem) => {
    const updated = [produto, ...catalogo];
    saveCatalogo(updated);
  };

  const editProduto = (id: string, dados: Partial<CatalogoItem>) => {
    const updated = catalogo.map(p => p.id === id ? { ...p, ...dados } : p);
    saveCatalogo(updated);
  };

  const deleteProduto = (id: string) => {
    const updated = catalogo.filter(p => p.id !== id);
    saveCatalogo(updated);
  };

  const updateConfiguracoes = (dados: Partial<Configuracoes>) => {
    const updated = { ...configuracoes, ...dados };
    saveConfiguracoes(updated);
  };

  const loadLeads = () => {
    const stored = localStorage.getItem('josemegahair_leads');
    if (stored) {
      setLeads(JSON.parse(stored));
    } else {
      // Check for old key and migrate
      const oldStored = localStorage.getItem('charpynter_leads');
      if (oldStored) {
        const oldLeads = JSON.parse(oldStored);
        setLeads(oldLeads);
        localStorage.setItem('josemegahair_leads', JSON.stringify(oldLeads));
        // Keep old key as backup
      } else {
        setLeads([]);
        localStorage.setItem('josemegahair_leads', JSON.stringify([]));
      }
    }
  };

  const saveLeads = (leadsData: Lead[]) => {
    setLeads(leadsData);
    localStorage.setItem('josemegahair_leads', JSON.stringify(leadsData));
  };

  const addLead = (lead: Lead) => {
    const updated = [lead, ...leads];
    saveLeads(updated);
  };

  const updateLead = (id: string, dados: Partial<Lead>) => {
    const updated = leads.map(l => l.id === id ? { ...l, ...dados } : l);
    saveLeads(updated);
  };

  const deleteLead = (id: string) => {
    const updated = leads.filter(l => l.id !== id);
    saveLeads(updated);
  };

  const value: DataContextValue = {
    galeria,
    catalogo,
    configuracoes,
    leads,
    isLoaded,
    loadGaleria,
    saveGaleria,
    loadCatalogo,
    saveCatalogo,
    loadConfiguracoes,
    saveConfiguracoes,
    loadLeads,
    saveLeads,
    addFoto,
    editFoto,
    deleteFoto,
    addProduto,
    editProduto,
    deleteProduto,
    updateConfiguracoes,
    addLead,
    updateLead,
    deleteLead
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
