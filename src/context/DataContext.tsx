import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { GaleriaItem, CatalogoItem, Configuracoes, Lead } from '@/types';
import { apiGaleria, apiCatalogo, apiConfiguracoes, apiLeads } from '@/lib/api';
import { toast } from 'sonner';

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
  }, []);

  // Recarrega dados quando houver mudanças no localStorage (sincronização entre abas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // storageArea é null quando a mudança veio da mesma aba/origem
      // só recarregar se vier de outra aba para evitar loop infinito
      if (e.storageArea && (e.key === 'josemegahair_galeria' || 
          e.key === 'josemegahair_catalogo' || 
          e.key === 'josemegahair_configuracoes')) {
        console.log('Storage event detected, reloading data from backend');
        loadAllData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoaded(false);
      
      // Carrega dados públicos paralelamente do backend
      const [galeriaRes, catalogoRes, configRes] = await Promise.all([
        apiGaleria.findAll(),
        apiCatalogo.findAll(),
        apiConfiguracoes.find(),
      ]);
      
      setGaleria(galeriaRes.data);
      setCatalogo(catalogoRes.data);
      setConfiguracoes(configRes.data);

      // Carrega os leads se o admin estiver logado
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const leadsRes = await apiLeads.findAll();
          setLeads(leadsRes.data);
        } catch (leadsErr) {
          console.warn('Erro ao carregar leads:', leadsErr);
        }
      }
      
      // Sincroniza com localStorage como cache
      localStorage.setItem('josemegahair_galeria', JSON.stringify(galeriaRes.data));
      localStorage.setItem('josemegahair_catalogo', JSON.stringify(catalogoRes.data));
      localStorage.setItem('josemegahair_configuracoes', JSON.stringify(configRes.data));
    } catch (error) {
      console.warn('Erro ao carregar dados do backend, usando localStorage como cache:', error);
      
      // Fallback para LocalStorage
      const storedGaleria = localStorage.getItem('josemegahair_galeria');
      if (storedGaleria) setGaleria(JSON.parse(storedGaleria));
      else setGaleria(DEFAULT_GALERIA);

      const storedCatalogo = localStorage.getItem('josemegahair_catalogo');
      if (storedCatalogo) setCatalogo(JSON.parse(storedCatalogo));
      else setCatalogo(DEFAULT_CATALOGO);

      const storedConfig = localStorage.getItem('josemegahair_configuracoes');
      if (storedConfig) setConfiguracoes(JSON.parse(storedConfig));
      else setConfiguracoes(DEFAULT_CONFIGURACOES);

      const storedLeads = localStorage.getItem('josemegahair_leads');
      if (storedLeads) setLeads(JSON.parse(storedLeads));
    } finally {
      setIsLoaded(true);
    }
  };

  // Funções da Galeria
  const addFoto = async (foto: GaleriaItem) => {
    try {
      // Adiciona ao estado local imediatamente com ID temporário
      const tempId = foto.id || Date.now().toString();
      const fotoComId = { ...foto, id: tempId };
      const updatedLocal = [fotoComId, ...galeria];
      setGaleria(updatedLocal);
      localStorage.setItem('josemegahair_galeria', JSON.stringify(updatedLocal));

      // Envia para API (sem o ID para deixar o banco gerar)
      const { id, ...postData } = fotoComId;
      const res = await apiGaleria.create(postData);

      // Atualiza com o ID real do banco
      const finalUpdated = galeria.map(f => f.id === tempId ? res.data : f);
      setGaleria(finalUpdated);
      localStorage.setItem('josemegahair_galeria', JSON.stringify(finalUpdated));
      
      toast.success('Foto adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar foto:', error);
      toast.error('Erro ao adicionar foto. Verifique o console para detalhes.');
      // Mantém a foto no estado local mesmo com erro
    }
  };

  const editFoto = async (id: string, dados: Partial<GaleriaItem>) => {
    try {
      // Atualiza estado local imediatamente
      const tempUpdated = galeria.map(f => f.id === id ? { ...f, ...dados } : f);
      setGaleria(tempUpdated);
      localStorage.setItem('josemegahair_galeria', JSON.stringify(tempUpdated));

      const res = await apiGaleria.update(id, dados);
      const finalUpdated = galeria.map(f => f.id === id ? res.data : f);
      setGaleria(finalUpdated);
      localStorage.setItem('josemegahair_galeria', JSON.stringify(finalUpdated));
      
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar foto:', error);
      toast.error('Erro ao editar foto. Verifique o console para detalhes.');
      // Mantém a atualização local mesmo com erro
    }
  };

  const deleteFoto = async (id: string) => {
    try {
      // Remove do estado local imediatamente
      const tempUpdated = galeria.filter(f => f.id !== id);
      setGaleria(tempUpdated);
      localStorage.setItem('josemegahair_galeria', JSON.stringify(tempUpdated));

      await apiGaleria.remove(id);
      // Estado já está atualizado, não precisa fazer nada mais
      
      toast.success('Foto excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      toast.error('Erro ao excluir foto. Verifique o console para detalhes.');
      // Mantém a remoção local mesmo com erro
    }
  };

  // Funções do Catálogo
  const addProduto = async (produto: CatalogoItem) => {
    try {
      // Adiciona ao estado local imediatamente com ID temporário
      const tempId = produto.id || Date.now().toString();
      const produtoComId = { ...produto, id: tempId };
      const updatedLocal = [produtoComId, ...catalogo];
      setCatalogo(updatedLocal);
      localStorage.setItem('josemegahair_catalogo', JSON.stringify(updatedLocal));

      // Envia para API (sem o ID para deixar o banco gerar)
      const { id, ...postData } = produtoComId;
      const res = await apiCatalogo.create(postData);

      // Atualiza com o ID real do banco
      const finalUpdated = catalogo.map(p => p.id === tempId ? res.data : p);
      setCatalogo(finalUpdated);
      localStorage.setItem('josemegahair_catalogo', JSON.stringify(finalUpdated));
      
      toast.success('Produto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro ao adicionar produto. Verifique o console para detalhes.');
      // Mantém o produto no estado local mesmo com erro
    }
  };

  const editProduto = async (id: string, dados: Partial<CatalogoItem>) => {
    try {
      // Atualiza estado local imediatamente
      const tempUpdated = catalogo.map(p => p.id === id ? { ...p, ...dados } : p);
      setCatalogo(tempUpdated);
      localStorage.setItem('josemegahair_catalogo', JSON.stringify(tempUpdated));

      const res = await apiCatalogo.update(id, dados);
      const finalUpdated = catalogo.map(p => p.id === id ? res.data : p);
      setCatalogo(finalUpdated);
      localStorage.setItem('josemegahair_catalogo', JSON.stringify(finalUpdated));
      
      toast.success('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao editar produto:', error);
      toast.error('Erro ao editar produto. Verifique o console para detalhes.');
      // Mantém a atualização local mesmo com erro
    }
  };

  const deleteProduto = async (id: string) => {
    try {
      // Remove do estado local imediatamente
      const tempUpdated = catalogo.filter(p => p.id !== id);
      setCatalogo(tempUpdated);
      localStorage.setItem('josemegahair_catalogo', JSON.stringify(tempUpdated));

      await apiCatalogo.remove(id);
      // Estado já está atualizado, não precisa fazer nada mais
      
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      toast.error('Erro ao excluir produto. Verifique o console para detalhes.');
      // Mantém a remoção local mesmo com erro
    }
  };

  // Funções de Configuração
  const updateConfiguracoes = async (dados: Partial<Configuracoes>) => {
    try {
      // Atualiza estado local imediatamente
      const tempUpdated = { ...configuracoes, ...dados };
      setConfiguracoes(tempUpdated);
      localStorage.setItem('josemegahair_configuracoes', JSON.stringify(tempUpdated));

      const res = await apiConfiguracoes.update(dados);
      const finalUpdated = { ...configuracoes, ...res.data };
      setConfiguracoes(finalUpdated);
      localStorage.setItem('josemegahair_configuracoes', JSON.stringify(finalUpdated));
      
      toast.success('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar configuracoes:', error);
      toast.error('Erro ao atualizar configuracoes. Verifique o console para detalhes.');
      // Mantém a atualização local mesmo com erro
    }
  };

  // Funções de Leads
  const addLead = async (lead: Lead) => {
    try {
      // Adiciona ao estado local imediatamente com ID temporário
      const tempId = lead.id || Date.now().toString();
      const leadComId = { ...lead, id: tempId };
      const updatedLocal = [leadComId, ...leads];
      setLeads(updatedLocal);
      localStorage.setItem('josemegahair_leads', JSON.stringify(updatedLocal));

      // Envia para API (sem o ID para deixar o banco gerar)
      const { id, ...postData } = leadComId;
      const res = await apiLeads.create(postData);

      // Atualiza com o ID real do banco
      const finalUpdated = leads.map(l => l.id === tempId ? res.data : l);
      setLeads(finalUpdated);
      localStorage.setItem('josemegahair_leads', JSON.stringify(finalUpdated));
      
      toast.success('Lead adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar lead:', error);
      toast.error('Erro ao adicionar lead. Verifique o console para detalhes.');
      // Mantém o lead no estado local mesmo com erro
    }
  };

  const updateLead = async (id: string, dados: Partial<Lead>) => {
    try {
      // Atualiza estado local imediatamente
      const tempUpdated = leads.map(l => l.id === id ? { ...l, ...dados } : l);
      setLeads(tempUpdated);
      localStorage.setItem('josemegahair_leads', JSON.stringify(tempUpdated));

      const res = await apiLeads.update(id, dados);
      const finalUpdated = leads.map(l => l.id === id ? res.data : l);
      setLeads(finalUpdated);
      localStorage.setItem('josemegahair_leads', JSON.stringify(finalUpdated));
      
      toast.success('Lead atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast.error('Erro ao atualizar lead. Verifique o console para detalhes.');
      // Mantém a atualização local mesmo com erro
    }
  };

  const deleteLead = async (id: string) => {
    try {
      // Remove do estado local imediatamente
      const tempUpdated = leads.filter(l => l.id !== id);
      setLeads(tempUpdated);
      localStorage.setItem('josemegahair_leads', JSON.stringify(tempUpdated));

      await apiLeads.remove(id);
      // Estado já está atualizado, não precisa fazer nada mais
      
      toast.success('Lead excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      toast.error('Erro ao excluir lead. Verifique o console para detalhes.');
      // Mantém a remoção local mesmo com erro
    }
  };

  const value: DataContextValue = {
    galeria,
    catalogo,
    configuracoes,
    leads,
    isLoaded,
    loadGaleria: loadAllData,
    saveGaleria: () => {},
    loadCatalogo: loadAllData,
    saveCatalogo: () => {},
    loadConfiguracoes: loadAllData,
    saveConfiguracoes: () => {},
    loadLeads: loadAllData,
    saveLeads: () => {},
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
