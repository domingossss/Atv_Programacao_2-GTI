import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  FileImage as ImageIcon, Package, Mail, Activity, 
  Trash2, MessageCircle, Sparkles, BarChart3, Clock
} from 'lucide-react';
import { useDataContext } from '@/context/DataContext';

export default function Dashboard() {
  const { galeria, catalogo, leads } = useDataContext();
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ label: string; count: number }[]>([]);
  
  // Fallback: check old localStorage key if leads array is empty - use useMemo to prevent infinite loop
  const allLeads = useMemo(() => {
    if (leads.length > 0) {
      console.log('Using leads from DataContext:', leads);
      return leads;
    }
    const oldStored = localStorage.getItem('charpynter_leads');
    if (oldStored) {
      const parsed = JSON.parse(oldStored);
      console.log('Leads from old key:', parsed);
      console.log('Lead structure sample:', parsed[0]);
      return parsed;
    }
    console.log('No leads found');
    return [];
  }, [leads]);

  useEffect(() => {
    const carregarDadosDoDashboard = () => {
      try {
        console.log('Generating chart data with', allLeads.length, 'leads');
        
        // Gera dados para o Gráfico (Últimos 7 dias) usando allLeads (with fallback)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
          const label = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
          
          // Filter leads by date - handle multiple date formats
          const count = allLeads.filter((l: any) => {
            if (!l.data_contato && !l.criadoEm) {
              console.log('Lead without date:', l);
              return false;
            }
            
            const leadDate = l.data_contato || l.criadoEm;
            // Try to parse the date and compare
            try {
              const leadDateObj = new Date(leadDate);
              const leadDateStr = leadDateObj.toISOString().split('T')[0];
              const matches = leadDateStr === dateStr;
              if (matches) console.log('Lead matches date:', l, leadDateStr, dateStr);
              return matches;
            } catch {
              // If parsing fails, try string comparison
              const matches = leadDate.includes(dateStr);
              if (matches) console.log('Lead matches date (string):', l, leadDate, dateStr);
              return matches;
            }
          }).length;
          console.log(`Date ${dateStr} (${label}): ${count} leads`);
          last7Days.push({ label, count });
        }
        console.log('Final chart data:', last7Days);
        setChartData(last7Days);

      } catch (error) {
        console.error("Erro ao carregar dados do Dashboard:", error);
        setChartData([
          { label: 'seg', count: 0 }, { label: 'ter', count: 0 }, { label: 'qua', count: 0 },
          { label: 'qui', count: 0 }, { label: 'sex', count: 0 }, { label: 'sáb', count: 0 }, { label: 'dom', count: 0 }
        ]);
      }

      // Carregar histórico de ações do LocalStorage
      const storedActions = localStorage.getItem('josemegahair_actions');
      if (storedActions) {
        try {
          setRecentActions(JSON.parse(storedActions));
        } catch (e) {
          console.error("Erro ao analisar ações", e);
        }
      } else {
        setRecentActions([
          { id: 1, action: 'Sistema inicializado!', time: 'Recente' }
        ]);
      }
    };

    carregarDadosDoDashboard();
    window.addEventListener('storage', carregarDadosDoDashboard);
    return () => window.removeEventListener('storage', carregarDadosDoDashboard);
  }, [allLeads]);

  const leadsCount = allLeads.length;
  const leadsPendentes = allLeads.filter((l: any) => l.status_lead === 'novo').length;

  const stats = [
    { title: 'Leads Pendentes', value: leadsPendentes.toString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Total de Leads', value: leadsCount.toString(), icon: Mail, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Fotos na Galeria', value: galeria.length.toString(), icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Produtos no Catálogo', value: catalogo.length.toString(), icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  const getActionStyle = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('excluído') || lowerText.includes('deletado')) return { icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10', isBold: false };
    if (lowerText.includes('whatsapp') || lowerText.includes('respondido')) return { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10', isBold: false };
    if (lowerText.includes('avaliação') || lowerText.includes('novo lead')) return { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10', isBold: true };
    return { icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-500/10', isBold: false };
  };

  const maxChartVal = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Dashboard | Admin</title>
      </Helmet>

      <div>
        <h1 className="font-sans text-3xl font-bold text-foreground mb-2">Seja bem-vindo!</h1>
        <p className="text-muted-foreground">Aqui está o resumo estratégico do seu salão hoje.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
              <h3 className="font-sans text-2xl font-bold text-foreground">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-sans font-semibold text-foreground">Leads (Últimos 7 dias)</h2>
          </div>
          <div className="p-6 flex-1 flex items-end justify-between gap-2 h-64">
            {chartData.map((data, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full group">
                <span className="text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{data.count}</span>
                <div 
                  className="w-full bg-primary/20 group-hover:bg-primary/40 rounded-t-sm transition-all relative"
                  style={{ height: `${(data.count / maxChartVal) * 100}%`, minHeight: data.count > 0 ? '12px' : '4px' }}
                >
                  <div className="absolute top-0 w-full h-1 bg-primary rounded-t-sm"></div>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{data.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-sans font-semibold text-foreground">Últimas Ações</h2>
          </div>
          <div className="divide-y divide-border overflow-y-auto flex-1 max-h-[400px]">
            {recentActions.length > 0 ? (
              recentActions.map((action) => {
                const style = getActionStyle(action.action);
                const Icon = style.icon;
                
                return (
                  <div key={action.id} className="p-4 px-6 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                      <Icon className={`w-5 h-5 ${style.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-foreground truncate ${style.isBold ? 'font-bold' : 'font-medium'}`}>
                        {action.action}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md shrink-0 whitespace-nowrap">
                      {action.time}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
                <Activity className="w-10 h-10 mb-3 opacity-20" />
                <p>Nenhuma ação recente registrada ainda.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}