import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Credenciais temporárias
const TEMP_CREDENTIALS = {
  email: 'admin@charpynter.com',
  password: 'admin123'
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Formato de e-mail inválido.');
      return;
    }

    setLoading(true);

    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Verifica credenciais temporárias
      if (formData.email === TEMP_CREDENTIALS.email && formData.password === TEMP_CREDENTIALS.password) {
        // Salva o token e estado de autenticação
        localStorage.setItem('adminToken', 'temp_token_' + Date.now());
        localStorage.setItem('josemegahair_isAuthenticated', 'true');
        
        // Salva a preferência de manter conectado e timestamp
        localStorage.setItem('josemegahair_keepLoggedIn', keepLoggedIn.toString());
        localStorage.setItem('josemegahair_loginTimestamp', Date.now().toString());
        
        toast.success('Login realizado com sucesso!');
        navigate('/admin/dashboard');
      } else {
        setError('Email ou senha incorretos');
        toast.error('Email ou senha incorretos');
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError('Erro ao processar login. Tente novamente.');
      toast.error('Erro ao processar login');
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
            Painel de administração exclusivo para gestão de galeria, catálogo e configurações.
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
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@josemegahair.com"
                value={formData.email}
                onChange={handleChange}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="h-12"
                required
              />
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
          </form>
        </div>
      </div>
    </div>
  );
}