import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Helmet from 'react-helmet';
import { Loader2, AlertCircle, X, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiAuth } from '@/lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error('Por favor, insira seu email.', {
        description: 'Precisamos do seu email para enviar as instruções de recuperação.',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      toast.error('Formato de email inválido.', {
        description: 'Por favor, insira um endereço de e-mail válido como: nome@exemplo.com',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    setForgotLoading(true);

    try {
      await apiAuth.forgotPassword({ email: forgotEmail });
      setForgotSuccess(true);
      toast.success('Instruções enviadas para seu email');
    } catch (err) {
      console.error("Erro ao solicitar recuperação:", err);
      toast.error('Erro ao solicitar recuperação de senha.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      await apiAuth.resendVerification({ email: formData.email });
      toast.success('Novo email de verificação enviado!');
    } catch (err) {
      console.error("Erro ao reenviar verificação:", err);
      toast.error('Erro ao reenviar email de verificação.');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      toast.error('Por favor, preencha todos os campos obrigatórios.', {
        description: 'Tanto o email quanto a senha são necessários para fazer login.',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Formato de e-mail inválido.', {
        description: 'Por favor, insira um endereço de e-mail válido como: nome@exemplo.com',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Dados enviados para login:', {
        email: formData.email,
        senha: formData.password
      });
      
      // Chama a API real de login
      const response = await apiAuth.login({
        email: formData.email,
        senha: formData.password,
        keepLoggedIn: keepLoggedIn
      });

      // Salva o token de acesso
      localStorage.setItem('adminToken', response.data.accessToken);
      localStorage.setItem('josemegahair_isAuthenticated', 'true');
      localStorage.setItem('josemegahair_admin_email', formData.email);

      // Salva a preferência de manter conectado e timestamp
      localStorage.setItem('josemegahair_keepLoggedIn', keepLoggedIn.toString());
      localStorage.setItem('josemegahair_loginTimestamp', Date.now().toString());

      toast.success('Login realizado com sucesso!');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error("Erro no login:", err);
      
      let errorMessage = 'Email ou senha incorretos';

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

      // Se o erro for sobre email não verificado, mostrar botão para reenviar
      if (errorMessage.includes('confirme seu email') || errorMessage.includes('email não verificado')) {
        setEmailNotVerified(true);
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setEmailNotVerified(false);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <Helmet>
        <title>Login Admin | Charpynter Hair</title>
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
            Painel administrativo
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="font-sans text-3xl font-bold text-foreground mb-2">Painel Gerencial</h2>
            <p className="text-muted-foreground">Faça login para acessar sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <>
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 shadow-sm">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-900 dark:text-red-100 font-medium">{error}</p>
                  </div>
                </div>
                {emailNotVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    className="w-full border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300"
                  >
                    {resendingVerification ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Reenviar Email de Verificação
                      </>
                    )}
                  </Button>
                )}
              </>
            )}

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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
              />
              <Label 
                htmlFor="keepLoggedIn" 
                className="text-sm cursor-pointer select-none"
              >
                Manter conectado
              </Label>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <Button 
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/register')}
              className="w-full h-12 text-base font-medium transition-all"
            >
              Criar conta
            </Button>
          </form>
        </div>
      </div>

      {/* Modal de Esqueci Minha Senha */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recuperar Senha</h3>
              <button
                onClick={() => {
                  setForgotPasswordOpen(false);
                  setForgotEmail('');
                  setForgotSuccess(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-muted-foreground">
                  Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.
                </p>
                <Button
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setForgotEmail('');
                    setForgotSuccess(false);
                  }}
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail">Email</Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Você receberá um link para redefinir sua senha.
                </p>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Instruções'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}