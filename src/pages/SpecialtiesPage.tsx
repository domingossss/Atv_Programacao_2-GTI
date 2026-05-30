
import { Helmet } from 'react-helmet';
import { 
  Sparkles, Palette, Droplet, Wind, Wand2, Eye, 
  CheckCircle2, MessageCircle, ArrowRight, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDataContext } from '@/context/DataContext';

const TECHNIQUES = [
  {
    id: "mega-hair", icon: Sparkles, title: "Mega Hair",
    desc: "Alongamento capilar com fios premium, focando em naturalidade e preservação da saúde do seu couro cabeludo.",
    benefits: ["Fitas adesivas imperceptíveis", "Microcápsulas de queratina", "Volume e comprimento sob medida", "Manutenção preventiva"]
  },
  {
    id: "coloracao", icon: Palette, title: "Coloração Avançada",
    desc: "Colorimetria e tonalidades personalizadas criadas para harmonizar perfeitamente com o seu tom de pele.",
    benefits: ["Loiros saudáveis e luminosos", "Morena iluminada", "Correção de cor complexa", "Proteção pré e pós-química"]
  },
  {
    id: "tratamentos", icon: Droplet, title: "Tratamentos Capilares",
    desc: "Protocolos luxuosos de hidratação, reconstrução e nutrição para devolver a vitalidade e o brilho intenso.",
    benefits: ["Cronograma capilar premium", "Terapia do couro cabeludo", "Reposição lipídica", "Blindagem dos fios"]
  },
  {
    id: "alisamento", icon: Wind, title: "Alisamento Progressivo",
    desc: "Técnicas menos agressivas que garantem o alinhamento perfeito, movimento natural e zero frizz.",
    benefits: ["Fórmulas sem formol", "Liso com balanço natural", "Selagem térmica", "Alta durabilidade"]
  },
  {
    id: "penteados", icon: Wand2, title: "Penteados Especiais",
    desc: "Criações exclusivas para eventos e ocasiões inesquecíveis, desenhadas para durar a festa inteira.",
    benefits: ["Produções para noivas", "Penteados para madrinhas", "Fixação de longa duração", "Visagismo aplicado ao penteado"]
  },
  {
    id: "consultoria", icon: Eye, title: "Consultoria de Imagem",
    desc: "Análise profunda de tom de pele, formato de rosto e estilo de vida para encontrar o seu visual ideal.",
    benefits: ["Teste de colorimetria pessoal", "Estudo visagista", "Corte ideal para o seu rosto", "Harmonização de imagem"]
  }
];

const STEPS = [
  { number: "01", title: "Agendamento", desc: "Contato inicial com nossa equipe para entender suas necessidades e agendar o melhor horário." },
  { number: "02", title: "Consulta Inicial", desc: "Avaliação minuciosa da saúde do seu fio, teste de mecha e alinhamento de expectativas." },
  { number: "03", title: "Execução do Serviço", desc: "Aplicação das técnicas escolhidas com produtos premium e excelência em cada detalhe." },
  { number: "04", title: "Acompanhamento", desc: "Orientações de cuidados home care e agendamento da manutenção preventiva." }
];

export default function SpecialtiesPage() {
  const { catalogo, configuracoes, isLoaded } = useDataContext();
  const phoneNumber = configuracoes?.whatsapp || "5512982001553";

  const handleWhatsApp = (message) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-background">
      <Helmet>
        <title>Especialidades & Técnicas - Salão de Beleza</title>
        <meta name="description" content="Conheça nossas especialidades: Mega Hair, Coloração Avançada, Tratamentos Capilares, e Consultoria de Imagem." />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <section className="text-center max-w-3xl mx-auto mb-24">
          <Badge className="bg-primary/10 text-primary border-none mb-6 px-4 py-1.5 font-medium tracking-wide uppercase">
            Nossa Expertise
          </Badge>
          <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground text-balance">
            Especialidades & <span className="text-primary font-medium">Técnicas</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Domínio absoluto em cada técnica capilar. Unimos ciência, arte e produtos de luxo para revelar a sua versão mais deslumbrante.
          </p>
        </section>

        {/* TECHNIQUES GRID SECTION */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TECHNIQUES.map((tech) => (
              <div 
                key={tech.id} 
                className="group bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 group-hover:from-primary group-hover:to-primary/90 group-hover:text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/10">
                  <tech.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-montserrat text-2xl font-bold mb-4 text-foreground">{tech.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                  {tech.desc}
                </p>
                <ul className="space-y-3 mt-auto pt-6 border-t border-border/50">
                  {tech.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-foreground/80">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CATALOG SECTION */}
        <section className="mb-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-montserrat text-3xl md:text-4xl font-bold mb-4 text-foreground text-balance">
              Catálogo de <span className="text-primary font-medium">Cabelos Premium</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Trabalhamos com cabelos da melhor qualidade, selecionados pessoalmente para garantir excelência.
            </p>
          </div>

          {!isLoaded ? (
            <div className="text-center text-muted-foreground py-10">Carregando catálogo...</div>
          ) : catalogo.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {catalogo.map((product) => (
                <div key={product.id} className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col group">
                  <div className="aspect-[4/3] overflow-hidden relative bg-muted">
                    <img 
                      src={product.imagem} 
                      alt={product.nome} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.tipo && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-none shadow-sm">
                          {product.tipo}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="font-sans text-xl font-bold text-foreground line-clamp-2">{product.nome}</h3>
                      <span className="font-bold text-primary whitespace-nowrap text-lg">
                        R$ {parseFloat(product.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                      {product.descricao}
                    </p>
                    {product.comprimento && (
                      <div className="mb-6">
                        <span className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1.5 rounded-md">
                          Comprimento: {product.comprimento}
                        </span>
                      </div>
                    )}
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={() => handleWhatsApp(`Olá! Tenho interesse no produto: ${product.nome}`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" /> Consultar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-3xl border border-border/50">
              <p className="text-muted-foreground text-lg">Catálogo sendo atualizado. Volte em breve!</p>
            </div>
          )}
        </section>

        {/* PROCESS/FLOW SECTION */}
        <section className="mb-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-montserrat text-3xl md:text-4xl font-bold mb-4 text-foreground text-balance">
              Como Funciona o <span className="text-primary font-medium">Atendimento</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Um processo estruturado para garantir a sua segurança, satisfação e um resultado impecável do início ao fim.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, idx) => (
              <div key={idx} className="relative group">
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[1px] bg-border border-t border-dashed border-primary/30 z-0"></div>
                )}
                
                <div className="relative z-10 bg-card p-8 rounded-2xl border border-border/50 h-full flex flex-col items-center text-center hover:border-primary/30 transition-colors duration-300">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center font-sans text-2xl font-bold text-primary mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-border/50">
                    {step.number}
                  </div>
                  <h3 className="font-montserrat text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="text-center bg-card rounded-3xl p-12 md:p-20 border border-border/50 shadow-sm">
          <h2 className="font-montserrat text-3xl md:text-4xl font-bold mb-6 text-foreground text-balance">
            Pronta para a sua transformação?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Agende uma avaliação com nossa equipe e descubra as técnicas ideais para o seu cabelo.
          </p>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-16 px-10 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-full"
            onClick={() => handleWhatsApp("Olá! Gostaria de agendar uma consulta/avaliação.")}
          >
            Agendar Consulta
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </section>

      </div>
    </div>
  );
}
