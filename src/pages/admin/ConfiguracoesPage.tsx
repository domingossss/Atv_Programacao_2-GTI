import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Save, Phone, MapPin, Clock, Instagram, Mail, MessageCircle, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useDataContext } from '@/context/DataContext';

export default function ConfiguracoesPage() {
  const { configuracoes, updateConfiguracoes } = useDataContext();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    telefone: '',
    email: '',
    instagram: '',
    whatsapp: '',
    endereco: '',
    horario_segunda: '',
    horario_terca: '',
    horario_quarta: '',
    horario_quinta: '',
    horario_sexta: '',
    horario_sabado: '',
    horario_domingo: ''
  });

  const [securityData, setSecurityData] = useState({
    emailAtual: '',
    novoEmail: '',
    confirmarNovoEmail: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarNovaSenha: ''
  });

  useEffect(() => {
    if (configuracoes) {
      setFormData({
        telefone: configuracoes.telefone || '',
        email: configuracoes.email || '',
        instagram: configuracoes.instagram || '',
        whatsapp: configuracoes.whatsapp || '',
        endereco: configuracoes.endereco || '',
        horario_segunda: configuracoes.horario_segunda || '',
        horario_terca: configuracoes.horario_terca || '',
        horario_quarta: configuracoes.horario_quarta || '',
        horario_quinta: configuracoes.horario_quinta || '',
        horario_sexta: configuracoes.horario_sexta || '',
        horario_sabado: configuracoes.horario_sabado || '',
        horario_domingo: configuracoes.horario_domingo || ''
      });
      setIsLoading(false);
    }

    const storedEmail = localStorage.getItem('josemegahair_admin_email') || 'admin@josemegahair.com';
    setSecurityData(prev => ({ ...prev, emailAtual: storedEmail }));
  }, [configuracoes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // === VALIDAÇÃO DE SEGURANÇA ===
    const storedPassword = localStorage.getItem('josemegahair_admin_password') || 'admin123';
    const isChangingSecurity = securityData.novoEmail || securityData.novaSenha;

    if (isChangingSecurity) {
      if (!securityData.senhaAtual) {
        toast.error('A senha atual é obrigatória para alterar credenciais de segurança.');
        return;
      }
      if (securityData.senhaAtual !== storedPassword) {
        toast.error('A senha atual está incorreta.');
        return;
      }
    }

    if (securityData.novoEmail) {
      if (securityData.novoEmail !== securityData.confirmarNovoEmail) {
        toast.error('O novo e-mail e a confirmação não coincidem.');
        return;
      }
    }

    if (securityData.novaSenha) {
      if (securityData.novaSenha !== securityData.confirmarNovaSenha) {
        toast.error('A nova senha e a confirmação não coincidem.');
        return;
      }
      if (securityData.novaSenha.length < 6) {
        toast.error('A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }
    }

    setIsSaving(true);

    try {
      // 1. Salva as configurações do formulário via DataContext
      updateConfiguracoes(formData);

      let textoAcao = 'Configurações do salão atualizadas';

      // 2. Salva as configurações de segurança caso validadas
      if (securityData.novoEmail) {
        localStorage.setItem('josemegahair_admin_email', securityData.novoEmail);
        textoAcao = 'E-mail de login atualizado';
      }
      
      if (securityData.novaSenha) {
        localStorage.setItem('josemegahair_admin_password', securityData.novaSenha);
        textoAcao = securityData.novoEmail ? 'Credenciais de login e senha atualizadas' : 'Senha de sistema atualizada';
      }

      // 3. Feedback visual
      toast.success('Configurações atualizadas com sucesso!');

      // 4. Registra a ação para o Dashboard com data/hora real
      const dataAtual = new Date();
      const novaAcao = { 
        id: Date.now(), 
        action: textoAcao, 
        time: `${dataAtual.toLocaleDateString('pt-BR')} às ${dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` 
      };
      
      const acoesAntigas = JSON.parse(localStorage.getItem('josemegahair_actions') || '[]');
      localStorage.setItem('josemegahair_actions', JSON.stringify([novaAcao, ...acoesAntigas].slice(0, 10)));

      // Atualiza o estado limpando os campos de alteração e atualizando o email de exibição
      setSecurityData(prev => ({
        ...prev,
        emailAtual: securityData.novoEmail || prev.emailAtual,
        novoEmail: '',
        confirmarNovoEmail: '',
        senhaAtual: '',
        novaSenha: '',
        confirmarNovaSenha: ''
      }));
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar as configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Helmet>
        <title>Configurações | Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold font-sans text-foreground">Configurações - Dados do Salão</h1>
        <p className="text-muted-foreground mt-1">Atualize as informações que aparecem no site e a segurança da sua conta.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION: Segurança da Conta */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-sans text-foreground">Segurança da Conta</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-4 h-4" />
              Preencha apenas o que deseja alterar
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* E-mail */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="emailAtual" className="text-muted-foreground">E-mail Atual de Login</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input 
                  id="emailAtual" name="emailAtual" type="email" 
                  value={securityData.emailAtual} disabled
                  className="pl-9 bg-muted/50 text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="novoEmail">Novo E-mail (Opcional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="novoEmail" name="novoEmail" type="email" 
                  value={securityData.novoEmail} onChange={handleSecurityChange}
                  placeholder="contato@novoemail.com" className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarNovoEmail">Confirmar Novo E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="confirmarNovoEmail" name="confirmarNovoEmail" type="email" 
                  value={securityData.confirmarNovoEmail} onChange={handleSecurityChange}
                  placeholder="Repita o novo e-mail" className="pl-9"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 my-2 border-t border-border/50"></div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova Senha (Opcional)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="novaSenha" name="novaSenha" type="password" 
                  value={securityData.novaSenha} onChange={handleSecurityChange}
                  placeholder="Mínimo 6 caracteres" className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarNovaSenha">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="confirmarNovaSenha" name="confirmarNovaSenha" type="password" 
                  value={securityData.confirmarNovaSenha} onChange={handleSecurityChange}
                  placeholder="Repita a nova senha" className="pl-9"
                />
              </div>
            </div>

            {/* Confirmação de Segurança - Exibido de forma destacada */}
            <div className="space-y-2 md:col-span-2 bg-muted/30 p-4 rounded-xl border border-border/50 mt-2">
              <Label htmlFor="senhaAtual" className="text-foreground font-medium">
                Senha Atual <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Obrigatória apenas se você preencheu um novo e-mail ou uma nova senha acima.
              </p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input 
                  id="senhaAtual" name="senhaAtual" type="password" 
                  value={securityData.senhaAtual} onChange={handleSecurityChange}
                  placeholder="Digite sua senha atual para autorizar as mudanças" 
                  className="pl-9 border-primary/20 focus-visible:ring-primary/50"
                />
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 1: Contato */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-sans text-foreground">Contato & Redes Sociais</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone Contato</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="telefone" name="telefone" value={formData.telefone} onChange={handleChange}
                  placeholder="+55 12 99999-9999" className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (Apenas números)</Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                  placeholder="5512999999999" className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram (Username ou URL)</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="instagram" name="instagram" value={formData.instagram} onChange={handleChange}
                  placeholder="@seusalao" className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Endereço */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-sans text-foreground">Endereço</h2>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo</Label>
            <Input 
              id="endereco" name="endereco" value={formData.endereco} onChange={handleChange}
              placeholder="Av. Exemplo, 123, Bairro - Cidade, UF"
            />
          </div>
        </div>

        {/* SECTION 3: Horários */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-sans text-foreground">Horário de Funcionamento</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              { id: 'horario_segunda', label: 'Segunda-feira' },
              { id: 'horario_terca', label: 'Terça-feira' },
              { id: 'horario_quarta', label: 'Quarta-feira' },
              { id: 'horario_quinta', label: 'Quinta-feira' },
              { id: 'horario_sexta', label: 'Sexta-feira' },
              { id: 'horario_sabado', label: 'Sábado' },
              { id: 'horario_domingo', label: 'Domingo' },
            ].map((day) => (
              <div key={day.id} className="flex items-center justify-between gap-4">
                <Label htmlFor={day.id} className="w-32 shrink-0">{day.label}</Label>
                <Input 
                  id={day.id} name={day.id} value={formData[day.id]} onChange={handleChange}
                  placeholder="09:00 - 18:00 ou Fechado"
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px] shadow-lg"
            disabled={isSaving}
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}