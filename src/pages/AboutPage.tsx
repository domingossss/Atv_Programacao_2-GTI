import React from 'react';
import { CheckCircle2, Heart, Star, Award } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { icon: Award, title: 'Qualidade Premium', desc: 'Utilizamos apenas os melhores produtos e cabelos do mercado mundial.' },
    { icon: Star, title: 'Inovação', desc: 'Busca constante por novas técnicas menos agressivas e mais eficientes.' },
    { icon: Heart, title: 'Cuidado Genuíno', desc: 'A saúde do seu fio natural é a nossa prioridade número um.' },
    { icon: CheckCircle2, title: 'Exclusividade', desc: 'Atendimento personalizado e focado inteiramente em você.' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Sobre o <span className="text-primary font-medium">José</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Uma jornada dedicada à arte de elevar a beleza natural e devolver a autoconfiança através da excelência capilar.
          </p>
        </div>

        {/* History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-32">
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-2xl transform rotate-3"></div>
            <img 
              src="https://images.unsplash.com/photo-1694345906570-e0958e1cd8a3" 
              alt="José Charpynter" 
              className="relative rounded-2xl shadow-xl w-full object-cover aspect-[3/4]"
            />
          </div>
          
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-foreground mb-6">A História</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-lg font-light">
              <p>
                Desde muito jovem, José entendeu que o cabelo não é apenas uma moldura para o rosto, mas a coroa de cada mulher. Sua carreira começou como assistente nos maiores salões de São Paulo, onde sua atenção aos detalhes rapidamente o destacou.
              </p>
              <p>
                Foram anos de estudos aprofundados em visagismo, colorimetria avançada e tricologia. A insatisfação com os métodos tradicionais de extensão capilar — que muitas vezes danificavam os fios — o levou a buscar especializações internacionais na Europa e nos Estados Unidos.
              </p>
              <p>
                Hoje, o método Charpynter é reconhecido por proporcionar alongamentos imperceptíveis ao toque e à visão, harmonizados perfeitamente com cores vibrantes que preservam a integridade hídrica e lipídica do cabelo natural.
              </p>
            </div>
            
            <div className="pt-8 border-t border-border mt-8">
              <h3 className="font-montserrat text-2xl font-bold text-foreground mb-4">Nossa Missão</h3>
              <p className="text-muted-foreground leading-relaxed italic text-lg border-l-4 border-primary pl-6">
                "Revelar a beleza genuína de cada cliente, proporcionando uma experiência de luxo acolhedora, onde a saúde capilar e a estética impecável caminham lado a lado."
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-muted rounded-3xl p-8 md:p-16 border border-border">
          <div className="text-center mb-12">
            <h2 className="font-montserrat text-3xl md:text-4xl font-bold mb-4">Nossos Valores</h2>
            <p className="text-muted-foreground">Os pilares que sustentam a marca Charpynter Hair.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, i) => (
              <div 
                key={i}
                className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  <val.icon size={32} />
                </div>
                <h3 className="font-montserrat text-xl font-bold mb-3">{val.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}