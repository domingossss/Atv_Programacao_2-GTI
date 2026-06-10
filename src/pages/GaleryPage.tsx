import { useState, useEffect, useRef } from 'react';
import Helmet from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Play, Maximize } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDataContext } from '@/context/DataContext';
import { GaleriaItem } from '@/types/index';

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'mega-hair', label: 'Mega Hair' },
  { id: 'corte', label: 'Cortes' },
  { id: 'colorimetria', label: 'Colorimetria' },
  { id: 'penteado', label: 'Penteados' },
  { id: 'tratamento', label: 'Tratamentos' }
];

// Helper para detectar se a mídia é um vídeo
const isVideo = (mediaStr: string | undefined) => {
  if (!mediaStr) return false;
  return mediaStr.startsWith('data:video') || /\.(mp4|webm|ogg)$/i.test(mediaStr);
};

// Subcomponente para gerenciar o estado individual de cada foto/vídeo
const PostCard = ({ post, displayCategory, onExpand }: { post: GaleriaItem; displayCategory: string; onExpand: (post: GaleriaItem) => void }) => {
  const mediaUrl = post.imagem || post.midias?.[0] || post.imagem_url || '';
  const isMediaVideo = isVideo(mediaUrl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoClick = () => {
    if (!isMediaVideo || !videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col group rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-xl transition-all duration-300 border border-border/40 h-full"
    >
      <div
        className={`relative aspect-[4/5] w-full overflow-hidden ${isMediaVideo ? 'cursor-pointer' : 'cursor-zoom-in'}`}
        onClick={isMediaVideo ? handleVideoClick : () => onExpand(post)}
      >
        {isMediaVideo ? (
          <>
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loop
              playsInline
            />
            {/* Overlay com botão de Play quando estiver pausado */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
                <div className="bg-black/60 p-4 rounded-full backdrop-blur-sm text-white shadow-lg transform transition-transform group-hover:scale-110">
                  <Play fill="currentColor" size={32} className="ml-1" />
                </div>
              </div>
            )}
            
            {/* Botão de Expandir o Vídeo */}
            <button 
              onClick={(e) => { e.stopPropagation(); onExpand(post); }}
              className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              title="Expandir Vídeo"
            >
              <Maximize size={20} />
            </button>
          </>
        ) : (
          <>
            <img
              src={mediaUrl}
              alt={post.titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay sutil para fotos indicando que é clicável */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
              <div className="bg-black/60 p-3 rounded-full backdrop-blur-sm text-white shadow-lg opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 pointer-events-none">
                <Maximize size={24} />
              </div>
            </div>
          </>
        )}
        
        {post.categoria && post.categoria.toLowerCase() !== 'todos' && (
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-black/50 backdrop-blur-md text-white border-white/20 hover:bg-black/70 shadow-sm font-bold tracking-wider">
              {displayCategory}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-montserrat text-xl font-bold mb-2 break-words">{post.titulo}</h3>
        {post.descricao && (
          /* Aqui também adicionamos o whitespace-pre-wrap para manter a formatação no card (opcional, mas bom) */
          <p className="text-muted-foreground text-sm line-clamp-2 break-words whitespace-pre-wrap">{post.descricao}</p>
        )}
      </div>
    </motion.div>
  );
};

export default function GaleryPage() {
  const { galeria, isLoaded } = useDataContext();
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para controlar qual post está aberto no Modal
  const [selectedPost, setSelectedPost] = useState<GaleriaItem | null>(null);

  // Bloqueia o scroll da página quando o modal estiver aberto
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedPost]);

  const filteredPosts = galeria.filter(post => {
    let matchesCategory = true;
    if (filter !== 'todos') {
      let categoriaPost = post.categoria 
        ? post.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace('_', '-') 
        : '';
        
      if (categoriaPost === 'coloracao') {
        categoriaPost = 'colorimetria';
      }
      matchesCategory = categoriaPost === filter;
    }

    let matchesSearch = true;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const titleMatches = post.titulo ? post.titulo.toLowerCase().includes(term) : false;
      const descMatches = post.descricao ? post.descricao.toLowerCase().includes(term) : false;
      matchesSearch = titleMatches || descMatches;
    }

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <Helmet>
        <title>Galeria | Charpynter Hair</title>
        <meta name="description" content="Veja as incríveis transformações capilares realizadas no Charpynter Hair." />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Galeria <span className="text-primary font-medium">Charpynter Hair</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Explore nosso portfólio de transformações e inspire-se para a sua próxima mudança. Cada foto e vídeo conta uma história de renovação e autoestima.
          </p>
        </div>

        {/* Controles: Pesquisa e Filtros */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-muted/30 p-4 rounded-2xl border border-border/50">
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === cat.id 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-background text-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Galeria Grid */}
        {!isLoaded ? (
          <div className="flex justify-center py-20">
            <span className="text-muted-foreground animate-pulse">Carregando transformações...</span>
          </div>
        ) : filteredPosts.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => {
                let displayCategory = post.categoria ? post.categoria.replace(/[-_]/g, ' ').toUpperCase() : '';
                if (displayCategory === 'COLORACAO' || displayCategory === 'COLORAÇÃO') {
                  displayCategory = 'COLORIMETRIA';
                }

                return (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    displayCategory={displayCategory} 
                    onExpand={setSelectedPost} 
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 bg-muted/30 border border-border/50 rounded-2xl"
          >
            <p className="text-muted-foreground text-lg mb-2">Nenhum resultado encontrado para a sua busca.</p>
            <button 
              onClick={() => { setFilter('todos'); setSearchTerm(''); }}
              className="mt-4 px-6 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors font-medium"
            >
              Limpar filtros
            </button>
          </motion.div>
        )}
      </div>

      {/* MODAL DE EXPANSÃO (Lightbox) */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          >
            {/* Botão Fechar */}
            <button 
              className="absolute top-4 right-4 md:top-8 md:right-8 z-[110] text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors shadow-lg"
              onClick={() => setSelectedPost(null)}
              title="Fechar"
            >
              <X size={28} />
            </button>

            {/* Container do Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl max-h-full bg-card rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              {/* Área da Mídia */}
              <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative min-h-[40vh] md:min-h-0">
                {(() => {
                  const mediaUrl = selectedPost.imagem || selectedPost.midias?.[0] || selectedPost.imagem_url || '';
                  const isVideoMedia = isVideo(mediaUrl);
                  return isVideoMedia ? (
                    <video
                      src={mediaUrl}
                      className="w-full h-full max-h-[50vh] md:max-h-[85vh] object-contain"
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={selectedPost.titulo}
                      className="w-full h-full max-h-[50vh] md:max-h-[85vh] object-contain"
                    />
                  );
                })()}
              </div>

              {/* Área de Texto / Informações com overflow e whitespace-pre-wrap */}
              <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col bg-card overflow-y-auto max-h-[40vh] md:max-h-[85vh]">
                {selectedPost.categoria && selectedPost.categoria.toLowerCase() !== 'todos' && (
                  <Badge className="w-fit mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-none font-bold tracking-wider">
                    {selectedPost.categoria.replace(/[-_]/g, ' ').toUpperCase()}
                  </Badge>
                )}
                
                <h2 className="font-montserrat text-3xl font-bold mb-4 text-foreground leading-tight break-words">
                  {selectedPost.titulo}
                </h2>
                
                {selectedPost.descricao ? (
                  /* A mágica acontece aqui: adicionamos a classe whitespace-pre-wrap */
                  <p className="text-muted-foreground leading-relaxed text-lg break-words whitespace-pre-wrap">
                    {selectedPost.descricao}
                  </p>
                ) : (
                  <p className="text-muted-foreground/60 italic">
                    Sem descrição adicional para esta transformação.
                  </p>
                )}
                
                <div className="mt-auto pt-8">
                   <p className="text-sm text-muted-foreground/50 border-t border-border/50 pt-4">
                     Charpynter Hair &bull; Portfólio
                   </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}