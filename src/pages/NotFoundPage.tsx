import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Helmet>
        <title>Página Não Encontrada | Charpynter Hair</title>
        <meta name="description" content="A página que você procura não foi encontrada." />
      </Helmet>

      <div className="text-center max-w-lg">
        <div className="mb-8">
          <h1 className="font-montserrat text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="font-sans text-2xl font-semibold text-foreground mb-2">
            Página Não Encontrada
          </h2>
          <p className="text-muted-foreground text-lg">
            Desculpe, a página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-base h-14 px-8 rounded-full transition-all"
            asChild
          >
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="text-base h-14 px-8 rounded-full transition-all"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
