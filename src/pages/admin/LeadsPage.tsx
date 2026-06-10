import { useState, useEffect } from 'react';
import Helmet from 'react-helmet';
import { Search, Eye, MessageSquare, Archive, Trash2, X, Clock, User, Phone, Mail, MailOpen, Scissors, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiLeads } from '@/lib/api';

interface Lead {
  id: string;
  nome_cliente: string;
  telefone_whatsapp: string;
  email: string;
  servico: string;
  data_contato: string;
  status_lead: 'novo' | 'visualizado' | 'respondido' | 'convertido' | 'arquivado';
  mensagem: string;
}

interface Action {
  id: number;
  action: string;
  time: string;
}

const SAMPLE_LEADS: Lead[] = [
  { id: '1', nome_cliente: 'Mariana Costa', telefone_whatsapp: '11999887766', email: '', servico: 'Mega Hair', data_contato: '2026-04-21T09:30:00Z', status_lead: 'novo', mensagem: 'Histórico: Descoloração / Luzes | Detalhes: Gostaria de saber os valores para um Mega Hair de 60cm loiro.' },
  { id: '2', nome_cliente: 'Juliana Silva', telefone_whatsapp: '11988776655', email: 'juliana.s@example.com', servico: 'Colorimetria / Luzes', data_contato: '2026-04-20T14:15:00Z', status_lead: 'respondido', mensagem: 'Histórico: Coloração / Tintura | Detalhes: Preciso corrigir a cor do meu cabelo que manchou em outro salão.' },
  { id: '3', nome_cliente: 'Fernanda Lima', telefone_whatsapp: '11977665544', email: 'fe.lima@example.com', servico: 'Corte Visagista', data_contato: '2026-04-19T10:45:00Z', status_lead: 'arquivado', mensagem: 'Agendamento para corte visagismo na sexta-feira.' },
  { id: '4', nome_cliente: 'Camila Rocha', telefone_whatsapp: '11966554433', email: '', servico: 'Mega Hair', data_contato: '2026-04-18T16:20:00Z', status_lead: 'novo', mensagem: 'Histórico: Cabelo Natural (Virgem) | Detalhes: Fazem manutenção de fita adesiva de outras marcas?' },
  { id: '5', nome_cliente: 'Amanda Souza', telefone_whatsapp: '11955443322', email: '', servico: 'Colorimetria / Luzes', data_contato: '2026-04-15T11:00:00Z', status_lead: 'convertido', mensagem: 'Histórico: Progressiva / Alisamento | Detalhes: Quero ficar morena iluminada.' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const registrarAcao = (mensagem: string) => {
    const dataAtual = new Date();
    const horaFormatada = dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dataFormatada = dataAtual.toLocaleDateString('pt-BR');

    const novaAcao: Action = {
      id: Date.now(),
      action: mensagem,
      time: `${horaFormatada} - ${dataFormatada}`
    };

    const acoesSalvas = JSON.parse(localStorage.getItem('charpynter_actions') || '[]');
    const novasAcoes = [novaAcao, ...acoesSalvas].slice(0, 10);

    localStorage.setItem('charpynter_actions', JSON.stringify(novasAcoes));
  };

  const carregarLeads = async () => {
    setLoading(true);
    try {
      const response = await apiLeads.findAll();
      setLeads(response.data);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      // Fallback para localStorage se a API falhar
      const stored = localStorage.getItem('charpynter_leads');
      if (stored) {
        setLeads(JSON.parse(stored));
      } else {
        localStorage.setItem('charpynter_leads', JSON.stringify(SAMPLE_LEADS));
        setLeads(SAMPLE_LEADS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLeads();
  }, []);

  useEffect(() => {
    if (feedback.msg) {
      const timer = setTimeout(() => setFeedback({ type: '', msg: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const filteredLeads = leads.filter(lead => {
    const nome = lead.nome_cliente || '';
    const telefone = lead.telefone_whatsapp || '';
    
    const matchesSearch = nome.toLowerCase().includes(searchTerm.toLowerCase()) || telefone.includes(searchTerm);
    const matchesTab = activeTab === 'todos' || lead.status_lead === activeTab;
    
    let matchesDate = true;
    if (dateFilter !== 'todos' && lead.data_contato) {
      const leadDate = new Date(lead.data_contato);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - leadDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === '7dias') matchesDate = diffDays <= 7;
      if (dateFilter === '30dias') matchesDate = diffDays <= 30;
    }

    return matchesSearch && matchesTab && matchesDate;
  });

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'Bom dia';
    if (hora >= 12 && hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleWhatsApp = async (phone: string, nome: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const saudacao = getSaudacao();
    
    const text = encodeURIComponent(`${saudacao} ${nome || ''} tudo bem? Vi que você respondeu o formulário de avaliação, fico muito grato pelo contato!`);
    
    try {
      const lead = leads.find(l => l.telefone_whatsapp === phone);
      if (lead) {
        await apiLeads.update(lead.id, { status_lead: 'respondido' });
        const updatedLeads = leads.map(l => l.telefone_whatsapp === phone ? { ...l, status_lead: 'respondido' as const } : l);
        setLeads(updatedLeads);
      }
      
      registrarAcao(`Lead respondido via WhatsApp: ${nome}`);
      window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
    }
  };

  const handleArchive = async (id: string, currentStatus: string) => {
    const newStatus: Lead['status_lead'] = currentStatus === 'arquivado' ? 'respondido' : 'arquivado';
    const leadAlterado = leads.find(l => l.id === id);
    
    try {
      await apiLeads.update(id, { status_lead: newStatus });
      const updatedLeads = leads.map(l => l.id === id ? { ...l, status_lead: newStatus } : l);
      setLeads(updatedLeads);
      
      registrarAcao(`Lead ${leadAlterado?.nome_cliente} foi ${newStatus === 'arquivado' ? 'arquivado' : 'restaurado'}`);
      setFeedback({ type: 'success', msg: `Lead ${newStatus === 'arquivado' ? 'arquivado' : 'restaurado'} com sucesso.` });
      
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, status_lead: newStatus });
      }
    } catch (error) {
      console.error('Erro ao arquivar lead:', error);
      setFeedback({ type: 'error', msg: 'Erro ao arquivar lead.' });
    }
  };

  const handleToggleRead = async (id: string, currentStatus: string) => {
    const newStatus: Lead['status_lead'] = currentStatus === 'novo' ? 'visualizado' : 'novo';
    
    try {
      await apiLeads.update(id, { status_lead: newStatus });
      const updatedLeads = leads.map(l => l.id === id ? { ...l, status_lead: newStatus } : l);
      setLeads(updatedLeads);
      setFeedback({ type: 'success', msg: `Lead marcado como ${newStatus === 'novo' ? 'Não Lido' : 'Lido'}.` });
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este lead?')) return;

    const leadExcluido = leads.find(l => l.id === id);
    
    try {
      await apiLeads.remove(id);
      const updatedLeads = leads.filter(l => l.id !== id);
      setLeads(updatedLeads);
      
      registrarAcao(`Lead excluído: ${leadExcluido?.nome_cliente}`);
      setFeedback({ type: 'success', msg: 'Lead excluído com sucesso.' });
      if (selectedLead && selectedLead.id === id) setSelectedLead(null);
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      setFeedback({ type: 'error', msg: 'Erro ao excluir lead.' });
    }
  };

  const openLeadDetails = async (lead: Lead) => {
    setSelectedLead(lead);
    if (lead.status_lead === 'novo') {
      try {
        await apiLeads.update(lead.id, { status_lead: 'visualizado' });
        const updatedLeads = leads.map(l => l.id === lead.id ? { ...l, status_lead: 'visualizado' as const } : l);
        setLeads(updatedLeads);
      } catch (error) {
        console.error('Erro ao atualizar lead:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      novo: 'bg-blue-100 text-blue-700 border-blue-200',
      visualizado: 'bg-purple-100 text-purple-700 border-purple-200',
      respondido: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      convertido: 'bg-primary/20 text-primary border-primary/30',
      arquivado: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    };
    const labels: Record<string, string> = { novo: 'Novo', visualizado: 'Visualizado', respondido: 'Respondido', convertido: 'Convertido', arquivado: 'Arquivado' };
    const safeStatus = status || 'novo';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[safeStatus] || styles.novo}`}>
        {labels[safeStatus] || safeStatus}
      </span>
    );
  };

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'novo', label: 'Novos' },
    { id: 'respondido', label: 'Respondidos' },
    { id: 'arquivado', label: 'Arquivados' }
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Leads | Admin Charpynter</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold font-sans text-foreground">Gestão de Leads</h1>
        <p className="text-muted-foreground mt-1">Acompanhe e responda contatos e avaliações de clientes.</p>
      </div>

      {feedback.msg && (
        <div className={`px-4 py-3 rounded-lg font-medium border ${feedback.type === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
          {feedback.msg}
        </div>
      )}

      <div className="border-b border-border flex gap-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou telefone..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="flex h-10 w-full md:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="todos">Qualquer Data</option>
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
          </select>
        </div>
      </div>

      {/* Tabela Desktop */}
      <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Nome</th>
              <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Contato</th>
              <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Interesse</th>
              <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Data</th>
              <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-muted-foreground text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  Carregando leads...
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  Nenhum lead encontrado para esta aba.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className={`hover:bg-muted/30 transition-colors ${lead.status_lead === 'novo' ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {lead.nome_cliente}
                      {lead.mensagem?.includes('Histórico:') && <Sparkles className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">{lead.telefone_whatsapp}</div>
                    {lead.email && <div className="text-xs text-muted-foreground">{lead.email}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground bg-secondary/50 px-2 py-1 rounded-md">{lead.servico || '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {lead.data_contato ? new Date(lead.data_contato).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(lead.status_lead)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggleRead(lead.id, lead.status_lead)} className="p-2 text-muted-foreground hover:text-blue-600 transition-colors" title={lead.status_lead === 'novo' ? 'Marcar como Lido' : 'Marcar como Não Lido'}>
                        {lead.status_lead === 'novo' ? <MailOpen size={18} /> : <Mail size={18} />}
                      </button>
                      <button onClick={() => openLeadDetails(lead)} className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Ver Detalhes">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleWhatsApp(lead.telefone_whatsapp, lead.nome_cliente)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="WhatsApp">
                        <MessageSquare size={18} />
                      </button>
                      <button onClick={() => handleArchive(lead.id, lead.status_lead)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title={lead.status_lead === 'arquivado' ? 'Desarquivar' : 'Arquivar'}>
                        <Archive size={18} />
                      </button>
                      <button onClick={() => handleDelete(lead.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Excluir">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            Carregando leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            Nenhum lead encontrado para esta aba.
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead.id} className={`bg-card rounded-xl border border-border p-4 shadow-sm ${lead.status_lead === 'novo' ? 'border-blue-200 bg-blue-50/30' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-sans text-foreground flex items-center gap-1.5">
                    {lead.nome_cliente}
                    {lead.mensagem?.includes('Histórico:') && <Sparkles className="w-3.5 h-3.5 text-primary" />}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{lead.data_contato ? new Date(lead.data_contato).toLocaleDateString('pt-BR') : ''}</p>
                </div>
                {getStatusBadge(lead.status_lead)}
              </div>
              
              <div className="space-y-1.5 mb-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={14} /> <span>{lead.telefone_whatsapp}</span>
                </div>
                {lead.servico && (
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Scissors size={14} /> <span>{lead.servico}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
                <button onClick={() => openLeadDetails(lead)} className="text-sm font-medium text-primary hover:underline">
                  Ver detalhes
                </button>
                <div className="flex gap-1">
                  <button onClick={() => handleToggleRead(lead.id, lead.status_lead)} className="p-2 text-muted-foreground bg-muted rounded-full">
                    {lead.status_lead === 'novo' ? <MailOpen size={16} /> : <Mail size={16} />}
                  </button>
                  <button onClick={() => handleWhatsApp(lead.telefone_whatsapp, lead.nome_cliente)} className="p-2 text-emerald-600 bg-emerald-50 rounded-full">
                    <MessageSquare size={16} />
                  </button>
                  <button onClick={() => handleArchive(lead.id, lead.status_lead)} className="p-2 text-muted-foreground bg-muted rounded-full">
                    <Archive size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h2 className="text-xl font-bold font-sans text-foreground">
                  {selectedLead.mensagem?.includes('Histórico:') ? 'Detalhes da Avaliação' : 'Detalhes do Lead'}
                </h2>
                <div className="mt-1">{getStatusBadge(selectedLead.status_lead)}</div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={16} className="text-muted-foreground" />
                    <span className="text-foreground font-medium">{selectedLead.nome_cliente}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data do Contato</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="text-foreground">{selectedLead.data_contato ? new Date(selectedLead.data_contato).toLocaleString('pt-BR') : '-'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">WhatsApp</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone size={16} className="text-emerald-600" />
                    <span className="text-foreground">{selectedLead.telefone_whatsapp}</span>
                  </div>
                </div>
                {selectedLead.email && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={16} className="text-muted-foreground" />
                      <span className="text-foreground break-all">{selectedLead.email}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Interesse / Serviço</label>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-bold border border-primary/20">
                  <Sparkles size={14} />
                  {selectedLead.servico || 'Não especificado'}
                </div>
              </div>

              {selectedLead.mensagem && selectedLead.mensagem.includes('Histórico:') ? (
                <div className="space-y-4 border-t border-border pt-4 mt-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Histórico de Química do Cabelo</label>
                    <div className="bg-secondary/20 p-3 rounded-lg text-foreground text-sm font-medium border border-secondary/30 flex items-center gap-2">
                      <Scissors size={16} className="text-muted-foreground" />
                      {selectedLead.mensagem.split(' | Detalhes: ')[0].replace('Histórico: ', '')}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Detalhes Adicionais</label>
                    <div className="bg-muted p-4 rounded-lg text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedLead.mensagem.split(' | Detalhes: ')[1]}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Mensagem</label>
                  <div className="bg-muted p-4 rounded-lg text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedLead.mensagem || 'Nenhuma mensagem adicional.'}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex flex-wrap justify-between gap-3">
              <Button 
                variant="destructive" 
                className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                onClick={() => handleDelete(selectedLead.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => handleArchive(selectedLead.id, selectedLead.status_lead)}
                >
                  <Archive className="w-4 h-4 mr-2" /> 
                  {selectedLead.status_lead === 'arquivado' ? 'Desarquivar' : 'Arquivar'}
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleWhatsApp(selectedLead.telefone_whatsapp, selectedLead.nome_cliente)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Responder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}