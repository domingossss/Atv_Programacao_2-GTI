import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Helmet from 'react-helmet';
import { Loader2, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiAuth } from '@/lib/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de reset não fornecido. Por favor, solicite um novo link de recuperação.');
      setTokenValid(false);
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Por favor, preencha todos os campos obrigatórios.', {
        description: 'Nova senha e confirmação são necessários.',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.', {
        description: 'A nova senha e a confirmação devem ser idênticas.',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.', {
        description: 'Por favor, escolha uma senha mais segura com pelo menos 6 caracteres.',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
      return;
    }

    if (!token) {
      setError('Token de reset não fornecido.');
      return;
    }

    setLoading(true);

    try {
      await apiAuth.resetPassword({
        token,
        newPassword: formData.newPassword
      });

      setSuccess(true);
      toast.success('Senha redefinida com sucesso!');

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } catch (err) {
      console.error("Erro ao resetar senha:", err);

      let errorMessage = 'Erro ao redefinir senha. O token pode ter expirado.';

      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = (err as any).response;
        if (errorResponse?.data?.message) {
          errorMessage = errorResponse.data.message;
        } else if (errorResponse?.data?.error) {
          errorMessage = errorResponse.data.error;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Helmet>
          <title>Reset de Senha | Charpynter Hair</title>
        </Helmet>

        <div className="w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <Lock className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="font-sans text-3xl font-bold text-foreground mb-2">Token Inválido</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/admin/login')} className="w-full">
              Voltar para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Helmet>
          <title>Reset de Senha | Charpynter Hair</title>
        </Helmet>

        <div className="w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-sans text-3xl font-bold text-foreground mb-2">Senha Redefinida!</h2>
            <p className="text-muted-foreground mb-6">
              Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <Helmet>
        <title>Redefinir Senha | Charpynter Hair</title>
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
            Redefinição de senha
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="font-sans text-3xl font-bold text-foreground mb-2">Redefinir Senha</h2>
            <p className="text-muted-foreground">Digite sua nova senha abaixo</p>
          </div>

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
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
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
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/login')}
              className="w-full h-12 text-base font-medium transition-all"
            >
              Voltar para Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
