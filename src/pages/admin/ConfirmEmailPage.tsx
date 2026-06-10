import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Helmet from 'react-helmet';
import { Loader2, CheckCircle, XCircle, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiAuth } from '@/lib/api';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setError('Token de verificação não fornecido.');
        setLoading(false);
        return;
      }

      try {
        await apiAuth.verifyEmail(token);
        setSuccess(true);
        toast.success('Email verificado com sucesso!');

        // Redireciona para login após 3 segundos
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      } catch (err) {
        console.error("Erro ao verificar email:", err);

        let errorMessage = 'Erro ao verificar email. O token pode ter expirado.';

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

    verifyEmailToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Helmet>
        <title>Verificação de Email | Charpynter Hair</title>
      </Helmet>

      <div className="w-full max-w-md space-y-8 p-8">
        {loading ? (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="font-sans text-2xl font-bold text-foreground mb-2">Verificando Email...</h2>
            <p className="text-muted-foreground">Por favor, aguarde enquanto verificamos seu email.</p>
          </div>
        ) : success ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-sans text-3xl font-bold text-foreground mb-2">Email Verificado!</h2>
            <p className="text-muted-foreground mb-6">
              Seu email foi verificado com sucesso. Você será redirecionado para o login em instantes...
            </p>
            <Button onClick={() => navigate('/admin/login')} className="w-full">
              Ir para Login
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="font-sans text-3xl font-bold text-foreground mb-2">Erro na Verificação</h2>
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 rounded-xl mb-6 shadow-sm">
              <p className="text-sm text-red-900 dark:text-red-100 font-medium">{error}</p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => navigate('/admin/login')} className="w-full">
                Ir para Login
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/register')}
                className="w-full"
              >
                Criar Nova Conta
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
