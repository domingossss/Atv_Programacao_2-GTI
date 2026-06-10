import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  MapPin, Phone, Clock, 
  CheckCircle, AlertCircle, ArrowRight, Loader2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useDataContext } from '@/context/DataContext';
import { apiLeads } from '@/lib/api';

export default function ContactPage() {
  const { configuracoes, isLoaded } = useDataContext();

  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone_whatsapp: '',
    interesse: 'Mega Hair',
    quimica: 'Cabelo Natural (Virgem)',
    mensagem: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const registrarAcao = (mensagem: string) => {
    const dataAtual = new Date();
    const horaFormatada = dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dataFormatada = dataAtual.toLocaleDateString('pt-BR');
    
    const novaAcao = {
      id: Date.now(),
      action: mensagem,
      time: `${horaFormatada} - ${dataFormatada}`
    };

    const acoesSalvas = JSON.parse(localStorage.getItem('josemegahair_actions') || '[]');
    const novasAcoes = [novaAcao, ...acoesSalvas].slice(0, 10);

    localStorage.setItem('josemegahair_actions', JSON.stringify(novasAcoes));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome_cliente.trim()) newErrors.nome_cliente = 'Nome é obrigatório';
    if (!formData.telefone_whatsapp.trim()) newErrors.telefone_whatsapp = 'Telefone é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const newLead = {
        nome_cliente: formData.nome_cliente,
        telefone_whatsapp: formData.telefone_whatsapp,
        servico: formData.interesse,
        quimica: formData.quimica,
        mensagem: formData.mensagem,
      };

      // Chama a API para criar o lead
      await apiLeads.create(newLead);
      
      registrarAcao(`Nova avaliação de: ${formData.nome_cliente} (${formData.interesse})`);

      const phone = configuracoes?.whatsapp || "5512982001553"; 
      const textoWhatsApp = `Olá, José! Meu nome é *${formData.nome_cliente}*. 
Estava no site e gostaria de uma avaliação.

✨ *Meu interesse:* ${formData.interesse}
🧪 *Histórico de Química:* ${formData.quimica}
💬 *Detalhes:* ${formData.mensagem || 'Gostaria de agendar um horário.'}`;

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(textoWhatsApp)}`;
      window.open(url, '_blank');

      setSuccess(true);
      setFormData({ 
        nome_cliente: '', 
        telefone_whatsapp: '', 
        interesse: 'Mega Hair', 
        quimica: 'Cabelo Natural (Virgem)', 
        mensagem: '' 
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Erro ao salvar a mensagem. Tente novamente.');
      console.error('Erro ao criar lead:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = (message: string) => {
    const phone = configuracoes?.whatsapp || "5512982001553";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-24 bg-background overflow-x-hidden">
      <Helmet>
        <title>Contato - Salão de Beleza</title>
        <meta name="description" content="Entre em contato conosco para agendar sua avaliação ou tirar dúvidas sobre nossos serviços." />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <section className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <h1 className="font-montserrat text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-foreground text-balance">
            Agende sua <span className="text-primary font-medium">Avaliação</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed px-2">
            Para garantir o melhor resultado, precisamos entender o seu desejo e o histórico do seu cabelo. Preencha os dados abaixo!
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20 sm:mb-32">
          
          <div className="space-y-4 sm:space-y-6">
            <h2 className="font-montserrat text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-8">Informações de Contato</h2>

            {!isLoaded ? (
              <div className="text-center text-muted-foreground py-10">Carregando informações...</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {configuracoes?.endereco && (
                  <div className="bg-card/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors duration-300 flex gap-4 shadow-sm hover:shadow-md">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-sans text-foreground text-sm sm:text-base mb-1">Endereço</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">{configuracoes.endereco}</p>
                    </div>
                  </div>
                )}

                {configuracoes?.telefone && (
                  <div className="bg-card/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors duration-300 flex gap-4 cursor-pointer group shadow-sm hover:shadow-md" onClick={() => handleWhatsApp("Olá!")}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 group-hover:from-primary group-hover:to-primary/90 group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="font-sans text-foreground text-sm sm:text-base mb-1">Telefone / WhatsApp</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm hover:text-primary transition-colors">{configuracoes.telefone}</p>
                    </div>
                  </div>
                )}

                <div className="bg-card/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors duration-300 flex gap-4 shadow-sm hover:shadow-md">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans text-foreground text-sm sm:text-base mb-1">Horário de Funcionamento</h3>
                    <div className="text-muted-foreground text-xs sm:text-sm space-y-1">
                      {configuracoes?.horario_segunda && <p>Seg: {configuracoes.horario_segunda}</p>}
                      {configuracoes?.horario_terca && <p>Ter: {configuracoes.horario_terca}</p>}
                      {configuracoes?.horario_quarta && <p>Qua: {configuracoes.horario_quarta}</p>}
                      {configuracoes?.horario_quinta && <p>Qui: {configuracoes.horario_quinta}</p>}
                      {configuracoes?.horario_sexta && <p>Sex: {configuracoes.horario_sexta}</p>}
                      {configuracoes?.horario_sabado && <p>Sáb: {configuracoes.horario_sabado}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card/80 backdrop-blur-sm p-5 sm:p-8 rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300 mt-4 lg:mt-0">
            <h2 className="font-montserrat text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 text-center sm:text-left">Formulário de Avaliação</h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_cliente" className="text-foreground text-sm font-medium">Nome Completo</Label>
                  <Input
                    id="nome_cliente" name="nome_cliente" value={formData.nome_cliente} onChange={handleChange}
                    placeholder="Seu nome"
                    className="bg-background border-border/50 text-foreground focus:border-primary focus:ring-primary text-sm h-10"
                  />
                  {errors.nome_cliente && <p className="text-[11px] sm:text-sm text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />{errors.nome_cliente}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone_whatsapp" className="text-foreground text-sm font-medium">WhatsApp</Label>
                  <Input
                    id="telefone_whatsapp" name="telefone_whatsapp" type="tel" value={formData.telefone_whatsapp} onChange={handleChange}
                    placeholder="(XX) XXXXX-XXXX"
                    className="bg-background border-border/50 text-foreground focus:border-primary focus:ring-primary text-sm h-10"
                  />
                  {errors.telefone_whatsapp && <p className="text-[11px] sm:text-sm text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />{errors.telefone_whatsapp}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interesse" className="text-foreground text-sm font-medium">Qual seu desejo hoje?</Label>
                  <select 
                    id="interesse" name="interesse"
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                    value={formData.interesse}
                    onChange={handleChange}
                  >
                    <option>Mega Hair</option>
                    <option>Colorimetria / Luzes</option>
                    <option>Corte</option>
                    <option>Tratamento</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quimica" className="text-foreground text-sm font-medium">Histórico do Cabelo</Label>
                  <select 
                    id="quimica" name="quimica"
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                    value={formData.quimica}
                    onChange={handleChange}
                  >
                    <option>Cabelo Natural (Virgem)</option>
                    <option>Coloração / Tintura</option>
                    <option>Descoloração / Luzes</option>
                    <option>Progressiva / Alisamento</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagem" className="text-foreground text-sm font-medium">Detalhes Adicionais (Opcional)</Label>
                <Textarea
                  id="mensagem" name="mensagem" value={formData.mensagem} onChange={handleChange}
                  placeholder="Ex: Quero um loiro mais perolado..." rows={3}
                  className="bg-background border-border/50 text-foreground focus:border-primary focus:ring-primary resize-none text-sm"
                />
              </div>

              <Button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary h-11 sm:h-12 text-sm sm:text-base font-medium transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...</> : <><Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Enviar para Avaliação via WhatsApp</>}
              </Button>
            </form>

            {success && (
              <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-900">Avaliação enviada com sucesso!</p>
                  <p className="text-[11px] sm:text-sm text-green-700">Verifique a nova aba do WhatsApp.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-red-900">Erro ao enviar avaliação</p>
                  <p className="text-[11px] sm:text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="text-center bg-card/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 md:p-20 border border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300 mx-auto max-w-5xl">
          <h2 className="font-montserrat text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground text-balance">
            Pronto para agendar?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto px-4">
            Clique no botão abaixo para abrir o WhatsApp e falar diretamente com nossa equipe agora mesmo.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary h-14 sm:h-16 px-6 sm:px-10 text-base sm:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-full w-full sm:w-auto"
            onClick={() => handleWhatsApp("Olá! Gostaria de agendar um atendimento.")}
          >
            <span className="truncate">Agendar Agora via WhatsApp</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 shrink-0" />
          </Button>
        </section>

      </div>
    </div>
  );
}