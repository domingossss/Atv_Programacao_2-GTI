import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Helmet from 'react-helmet';
import { Loader2, AlertCircle, ArrowLeft, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiAuth } from '@/lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    try {
      await apiAuth.resendVerification({ email: formData.email });
      toast.success('Novo email de verificação enviado!');
    } catch (err) {
      console.error("Erro ao reenviar email:", err);
      toast.error('Erro ao reenviar email. Tente novamente.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
      toast.error('Por favor, preencha todos os campos obrigatórios.', {
        description: 'Nome, email, senha e confirmação de senha são necessários.',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem.', {
        description: 'A senha e a confirmação devem ser idênticas.',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    if (formData.senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.', {
        description: 'Por favor, escolha uma senha mais segura com pelo menos 6 caracteres.',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Formato de e-mail inválido.', {
        description: 'Por favor, inclua um "@" no endereço de email. Exemplo: nome@exemplo.com',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    setLoading(true);

    try {
      await apiAuth.register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha
      });

      setRegistrationSuccess(true);
      toast.success('Conta criada! Verifique seu email para ativar a conta.');
    } catch (err) {
      console.error("Erro no registro:", err);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = (err as any).response;
        console.error("Response data:", errorResponse?.data);
        console.error("Detalhes da validação:", errorResponse?.data?.details);
        
        if (errorResponse?.data?.error) {
          errorMessage = errorResponse.data.error;
        } else if (errorResponse?.data?.message) {
          errorMessage = errorResponse.data.message;
        } else if (errorResponse?.data?.details && Array.isArray(errorResponse.data.details)) {
          errorMessage = errorResponse.data.details.join(', ');
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <Helmet>
        <title>Registro Admin | Charpynter Hair</title>
      </Helmet>

      {/* Left Column - Image */}
      <div className="hidden md:flex md:w-1/2 relative bg-zinc-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1595944025373-64a5ecfbf484" 
            alt="Luxury Hair Salon" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
        </div>
        <div className="relative z-10 text-center px-8">
          <h1 className="font-sans text-5xl text-primary font-bold mb-4">Charpynter Hair</h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Crie sua conta de administrador para acessar o painel de gestão.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <Link 
              to="/admin/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para o login
            </Link>
            <h2 className="font-sans text-3xl font-bold text-foreground mb-2">Criar Conta</h2>
            <p className="text-muted-foreground">Preencha os dados para se registrar</p>
          </div>

          {registrationSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="font-sans text-3xl font-bold text-foreground mb-2">Conta Criada!</h2>
                <p className="text-muted-foreground mb-4">
                  Enviamos um email de confirmação para <strong>{formData.email}</strong>.
                </p>
                <p className="text-sm text-muted-foreground">
                  Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/admin/login')}
                  className="w-full"
                >
                  Ir para Login
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="w-full"
                >
                  {resendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Reenviar Email de Confirmação
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 shadow-sm">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-900 dark:text-red-100 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nome@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    name="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.senha}
                    onChange={handleChange}
                    className="h-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className="h-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
