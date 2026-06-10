import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Sparkles, Scissors, Droplets, Play, Layers, Instagram, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Helmet from 'react-helmet';
import { useDataContext } from '@/context/DataContext';
import { GaleriaItem } from '@/types';

// Helper para detectar vídeos
const isVideo = (mediaStr: string) => {
  if (!mediaStr) return false;
  return mediaStr.startsWith('data:video') || /\.(mp4|webm|ogg)$/i.test(mediaStr);
};

// Subcomponente para os cards de Destaque da Galeria (Alinhados perfeitamente)
const FeaturedCard = ({ post, index }: { post: GaleriaItem; index: number }) => {
  const fallbacks = [
    "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1595476108010-b4d1f10d5e42?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80"
  ];

  const medias = post.midias && post.midias.length > 0 ? post.midias : (post.imagem ? [post.imagem] : []);
  const firstMedia = medias[0] || post.imagem || fallbacks[index % 3];
  
  const isMediaVideo = isVideo(firstMedia);
  const hasMultiple = medias.length > 1;

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoClick = (e: React.MouseEvent) => {
    if (!isMediaVideo || !videoRef.current) return;
    e.stopPropagation(); 
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  let displayCategory = post.categoria ? post.categoria.replace(/[-_]/g, ' ').toUpperCase() : '';
  if (displayCategory === 'COLORACAO' || displayCategory === 'COLORAÇÃO') {
    displayCategory = 'COLORIMETRIA';
  }

  // Variantes para animação
  const itemVariant = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
  };

  return (
    <motion.div 
      variants={itemVariant}
      className={`relative group overflow-hidden bg-muted rounded-2xl aspect-[4/5] will-change-[opacity,transform] border border-border/40 shadow-sm hover:shadow-xl transition-all duration-500 ${isMediaVideo ? 'cursor-pointer' : ''}`}
      onClick={handleVideoClick}
    >
      {isMediaVideo ? (
        <>
          <video 
            ref={videoRef}
            src={firstMedia} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loop
            playsInline
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 transition-colors">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-md text-white shadow-lg transform transition-transform group-hover:scale-110">
                <Play fill="currentColor" size={28} className="ml-1" />
              </div>
            </div>
          )}
        </>
      ) : (
        <img 
          loading="lazy"
          decoding="async"
          src={firstMedia} 
          alt={post.titulo} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}

      {hasMultiple && (
        <div className="absolute top-4 right-4 z-20 bg-black/40 px-2 py-1 rounded-md text-xs text-white backdrop-blur-md flex items-center gap-1.5 font-medium shadow-sm">
          <Layers size={14} /> 1/{medias.length}
        </div>
      )}

      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-6 transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          {displayCategory && (
            <Badge className="w-fit mb-3 bg-primary text-primary-foreground border-none tracking-wider font-sans shadow-sm text-[10px]">
              {displayCategory}
            </Badge>
          )}
          <h4 className="text-white font-sans text-xl font-medium drop-shadow-md line-clamp-2">{post.titulo}</h4>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const { galeria, isLoaded } = useDataContext();
  const recentPosts = galeria.slice(0, 3);

  // Configuração de animações
  const containerStagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
  };

  return (
    // Removido o motion.div e opacidade daqui. Agora é uma div padrão sólida.
    <div className="min-h-screen smooth-scroll bg-background">
      <Helmet>
        <title>Charpynter Hair | Especialistas em Mega Hair e Colorimetria</title>
        <meta name="description" content="Transforme seu cabelo no Charpynter Hair. Especialistas em Mega Hair, Colorimetria e Cortes de luxo." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[90dvh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            fetchPriority="high"
            src="https://images.unsplash.com/photo-1595944025373-64a5ecfbf484?auto=format&fit=crop&w=1920&q=80" 
            alt="Interior do Salão Charpynter" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>
        
        <div className="container relative z-20 px-4 sm:px-6 lg:px-8 pt-20">
          <motion.div 
            className="max-w-2xl will-change-[opacity,transform]"
            initial={{ opacity: 0, x: -40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          >
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-6 hover:bg-primary/30 text-sm py-1.5 px-4 backdrop-blur-md">
              Luxo & Exclusividade
            </Badge>
            <h1 className="font-montserrat text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
              Transforme <br/> <span className="text-primary font-medium">Seu Cabelo</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-lg leading-relaxed font-light">
              Descubra a sua melhor versão com técnicas avançadas de Mega Hair e Colorimetria assinadas por José Charpynter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 text-base h-14 px-8 rounded-full transition-all duration-300 shadow-lg shadow-primary/30" asChild>
                <Link to="/contato">Agendar Agora</Link>
              </Button>
              <Button size="lg" className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 text-base h-14 px-8 rounded-full transition-all duration-300 backdrop-blur-md" asChild>
                <Link to="/galeria">Ver Resultados</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quem é o José */}
      <section className="pt-24 pb-12 bg-background relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="relative aspect-[4/5] md:aspect-auto md:h-[600px] overflow-hidden group will-change-[opacity,transform] rounded-lg"
            >
              <div className="absolute inset-0 border border-primary/30 m-6 z-10 transition-transform duration-700 group-hover:scale-[0.96]"></div>
              <img 
                loading="lazy"
                decoding="async"
                src="https://images.unsplash.com/photo-1694345906570-e0958e1cd8a3?auto=format&fit=crop&w=800&q=80" 
                alt="José trabalhando no salão" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </motion.div>
            
            <motion.div 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true, margin: "-100px" }} 
              variants={containerStagger}
              className="will-change-[opacity,transform]"
            >
              <motion.h2 variants={fadeInUp} className="text-primary font-sans tracking-widest uppercase text-sm mb-4">A Assinatura</motion.h2>
              <motion.h3 variants={fadeInUp} className="font-sans text-4xl md:text-5xl font-bold mb-8 text-foreground leading-tight">Quem é o <span className="italic text-primary font-light">José</span></motion.h3>
              <motion.p variants={fadeInUp} className="text-muted-foreground leading-relaxed mb-6 text-lg">
                Com mais de 10 anos de experiência nos salões mais renomados, José Charpynter desenvolveu uma técnica única que une saúde capilar e estética impecável.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-muted-foreground leading-relaxed mb-10 text-lg">
                Sua paixão por transformações reais o levou a se especializar em extensões imperceptíveis e colorações que respeitam a integridade dos fios, criando resultados que não apenas mudam a aparência, mas elevam a autoestima.
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Button variant="link" className="text-primary p-0 h-auto font-medium text-lg hover:text-primary/80 flex items-center gap-2 group transition-colors" asChild>
                  <Link to="/sobre">
                    Conheça a história completa
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Banner Elegante do Instagram */}
      <section className="pb-24 pt-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none rounded-full blur-3xl opacity-50 scale-150"></div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 bg-card/80 backdrop-blur-xl p-8 md:p-10 rounded-2xl border border-primary/20 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-16 h-16 rounded-full border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/20 backdrop-blur-sm">
                <Instagram className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-sans font-bold text-foreground mb-2">Acompanhe meu dia a dia</h3>
                <p className="text-muted-foreground text-lg">Siga <span className="text-primary italic font-medium">@charpynterhair</span> e não perca nenhuma transformação.</p>
              </div>
            </div>
            
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary hover:scale-105 rounded-full px-8 h-14 whitespace-nowrap transition-all duration-300 text-base font-medium shadow-lg shadow-primary/30" asChild>
              <a href="https://www.instagram.com/charpynterhair/" target="_blank" rel="noopener noreferrer">
                Seguir no Instagram <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="py-24 bg-muted/30 border-y border-border/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <h2 className="font-montserrat text-4xl md:text-5xl font-bold mb-6 text-foreground">Nossas <span className="text-primary font-medium">Especialidades</span></h2>
            <p className="text-muted-foreground text-lg">Técnicas exclusivas desenhadas milimetricamente para o seu biotipo capilar.</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { title: "Mega Hair", icon: Sparkles, desc: "Técnicas de extensão invisíveis que proporcionam volume e comprimento com naturalidade absoluta.", img: "https://images.unsplash.com/photo-1677746854194-cacbf72ae71a?auto=format&fit=crop&w=600&q=80" },
              { title: "Colorimetria", icon: Droplets, desc: "Cores vibrantes, mechas iluminadas e correções complexas preservando a integridade e saúde do fio.", img: "https://images.unsplash.com/photo-1519816034042-37d2a57b79c7?auto=format&fit=crop&w=600&q=80" },
              { title: "Cortes Visagistas", icon: Scissors, desc: "Visagismo aplicado para criar cortes de luxo que valorizam seus traços naturais e estilo de vida.", img: "https://images.unsplash.com/photo-1650270121456-044e2db2dcdd?auto=format&fit=crop&w=600&q=80" }
            ].map((spec, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                className="group relative bg-card overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 rounded-2xl flex flex-col h-full will-change-[opacity,transform] border border-border/50"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                  <img 
                    loading="lazy" 
                    decoding="async"
                    src={spec.img} 
                    alt={spec.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                </div>
                <div className="p-8 flex-1 flex flex-col relative z-20 bg-card">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 -mt-14 relative z-30 shadow-md">
                    <spec.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-montserrat text-2xl font-bold mb-4 text-foreground">{spec.title}</h3>
                  <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">{spec.desc}</p>
                  <Button variant="outline" className="w-full border-border hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-full" asChild>
                    <Link to="/especialidades">Saber mais</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      

      {/* Galeria Destaque */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          >
            <div className="max-w-2xl">
              <h2 className="font-montserrat text-4xl md:text-5xl font-bold mb-4">Galeria <span className="text-primary font-medium">Destaque</span></h2>
              <p className="text-muted-foreground text-lg">Resultados reais das nossas transformações mais recentes.</p>
            </div>
            <Button variant="link" className="text-foreground hover:text-primary p-0 flex items-center gap-2 group text-lg" asChild>
              <Link to="/galeria">Ver todas as postagens <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" /></Link>
            </Button>
          </motion.div>

          {!isLoaded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                  <Skeleton className="h-6 w-2/3 rounded" />
                  <Skeleton className="h-4 w-1/3 rounded" />
                </div>
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <motion.div 
              // Grid Simétrico para garantir o alinhamento
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {recentPosts.map((post, i) => (
                <FeaturedCard key={post.id} post={post} index={i} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-24 bg-muted/30 border border-border/50 rounded-2xl">
              <Star className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-30" />
              <p className="text-muted-foreground text-lg">Nenhum resultado recente encontrado.</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted/30 border-t border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-montserrat text-4xl md:text-5xl font-bold mb-6 text-foreground">Perguntas <span className="text-primary font-medium">Frequentes</span></h2>
            <p className="text-muted-foreground text-lg">Tire suas dúvidas sobre nossos serviços e políticas.</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Como posso cancelar ou remarcar meu agendamento?",
                a: "Para cancelar ou remarcar, entre em contato pelo WhatsApp com pelo menos 24 horas de antecedência. Cancelamentos com menos de 24 horas podem estar sujeitos a uma taxa."
              },
              {
                q: "Quanto tempo dura cada procedimento?",
                a: "O tempo varia conforme o serviço. Mega Hair pode levar de 3 a 6 horas, colorimetria de 2 a 4 horas, e cortes de 1 a 2 horas. Durante a avaliação, informaremos o tempo exato."
              },
              {
                q: "Vocês fazem testes de alergia?",
                a: "Sim, realizamos testes de mecha 48h antes de procedimentos de coloração para garantir sua segurança e evitar reações alérgicas."
              },
              {
                q: "Qual a política de pagamento?",
                a: "Aceitamos cartões de crédito, débito, PIX e dinheiro. Para procedimentos de alto valor, oferecemos parcelamento em até 3x no cartão."
              },
              {
                q: "Preciso levar algo para o procedimento?",
                a: "Recomendamos vir com cabelo limpo e sem produtos. Para Mega Hair, evite usar condicionador no dia do procedimento. Trazemos todos os produtos necessários."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm"
              >
                <h3 className="font-montserrat text-lg font-bold mb-3 text-foreground">{faq.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5511999999999"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-accent hover:bg-accent/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        title="Fale conosco no WhatsApp"
      >
        <MessageCircle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
      </a>
      
      {/* CSS extra */}
      <style dangerouslySetInnerHTML={{__html: `
        .smooth-scroll {
          scroll-behavior: smooth;
        }
      `}} />
    </div>
  );
}