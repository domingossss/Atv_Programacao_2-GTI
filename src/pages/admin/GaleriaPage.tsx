import { useState, useRef } from 'react';
import Helmet from 'react-helmet';
import { Plus, Trash2, Edit2, X, Upload, Film, Play, Pause, Search, Filter, ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useDataContext } from '@/context/DataContext';
import { GaleriaItem } from '@/types/index';

interface GalleryFormData {
  titulo: string;
  descricao?: string;
  categoria: string;
  imagem?: string;
} 

const isVideo = (mediaStr: string | null | undefined): boolean => {
  if (!mediaStr) return false;
  return mediaStr.startsWith('data:video') || /\.(mp4|webm|ogg)$/i.test(mediaStr);
};

interface AdminMediaCardProps {
  photo: GaleriaItem;
  openModal: (photo: GaleriaItem) => void;
  handleDelete: (id: string) => void;
}

const AdminMediaCard = ({ photo, openModal, handleDelete }: AdminMediaCardProps) => {
  const isMediaVideo = isVideo(photo.imagem || photo.midias?.[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const displayImage = photo.imagem || photo.midias?.[0] || photo.imagem_url || '';

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative">
      <div className="aspect-square overflow-hidden relative bg-black">
        {isMediaVideo ? (
          <>
            <video
              ref={videoRef}
              src={displayImage}
              className={`w-full h-full object-cover transition-transform duration-500 ${!isPlaying ? 'group-hover:scale-105 opacity-80' : 'opacity-100'}`}
              loop
              playsInline
            />
            <div className="absolute top-2 left-2 bg-black/60 p-1.5 rounded-md backdrop-blur-sm z-10 pointer-events-none">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
              onClick={togglePlay}
            >
              {!isPlaying ? (
                <div className="bg-black/60 p-3 rounded-full backdrop-blur-sm text-white shadow-lg transform transition-transform hover:scale-110">
                  <Play fill="currentColor" size={24} className="ml-1" />
                </div>
              ) : (
                <div className="bg-black/60 p-3 rounded-full backdrop-blur-sm text-white shadow-lg opacity-0 hover:opacity-100 transition-opacity">
                  <Pause fill="currentColor" size={24} />
                </div>
              )}
            </div>
          </>
        ) : (
          <img
            src={displayImage}
            alt={photo.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent z-20 pointer-events-none">
          <button 
            onClick={(e) => { e.stopPropagation(); openModal(photo); }}
            className="bg-blue-600/90 hover:bg-blue-600 text-white p-2.5 rounded-full backdrop-blur-sm transition-transform hover:scale-110 pointer-events-auto shadow-md"
            title="Editar mídia"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
            className="bg-red-600/90 hover:bg-red-600 text-white p-2.5 rounded-full backdrop-blur-sm transition-transform hover:scale-110 pointer-events-auto shadow-md"
            title="Excluir mídia"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col z-10 bg-card">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-sans text-foreground line-clamp-1">{photo.titulo}</h3>
          {photo.categoria && photo.categoria !== 'todos' && (
            <span className="text-[10px] uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded-full font-bold whitespace-nowrap">
              {photo.categoria.replace('-', ' ')}
            </span>
          )}
        </div>
        {photo.descricao && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">{photo.descricao}</p>
        )}
      </div>
    </div>
  );
};

export default function GaleriaPage() {
  const { galeria, addFoto, editFoto, deleteFoto } = useDataContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  
  const [formData, setFormData] = useState<GalleryFormData>({
    titulo: '',
    categoria: 'todos'
  });
  
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  const registrarAcao = (mensagem: string) => {
    const dataAtual = new Date();
    const novaAcao = {
      id: Date.now(),
      action: mensagem,
      time: `${dataAtual.toLocaleDateString('pt-BR')} às ${dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    };

    const acoesSalvas = JSON.parse(localStorage.getItem('josemegahair_actions') || '[]');
    const novasAcoes = [novaAcao, ...acoesSalvas].slice(0, 10);

    localStorage.setItem('josemegahair_actions', JSON.stringify(novasAcoes));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('O arquivo excede o limite de 10MB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
        setFileName(selected.name);
      };
      reader.readAsDataURL(selected);
    }
  };

  const openModal = (photo: GaleriaItem | null = null) => {
    if (photo) {
      setEditingId(photo.id);
      setFormData({
        titulo: photo.titulo,
        descricao: photo.descricao,
        categoria: photo.categoria || 'todos',
        imagem: photo.imagem
      });
      setFileBase64(photo.imagem || null);
    } else {
      setEditingId(null);
      setFormData({ titulo: '', categoria: 'todos' });
      setFileBase64(null);
    }
    setFileName('');
    setIsModalOpen(false);
    setTimeout(() => setIsModalOpen(true), 10);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.titulo) return toast.error('O título é obrigatório.');
    if (!editingId && !fileBase64) return toast.error('A mídia (imagem ou vídeo) é obrigatória.');
    if (formData.categoria === 'todos') return toast.error('Selecione uma categoria específica.');

    setIsSubmitting(true);

    try {
      const finalUrl = fileBase64 || formData.imagem;

      const payload = {
        id: editingId || Date.now().toString(),
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        imagem: finalUrl,
        data_upload: new Date().toISOString()
      };

      if (editingId) {
        editFoto(editingId, payload);
        registrarAcao(`Mídia editada na galeria: ${formData.titulo}`);
      } else {
        addFoto(payload);
        registrarAcao(`Nova mídia adicionada à galeria: ${formData.titulo}`);
      }
      
      setIsModalOpen(false);
      setSuccessModalOpen(true);
      toast.success(editingId ? 'Mídia atualizada com sucesso!' : 'Mídia adicionada com sucesso!');
      
    } catch (error) {
      console.error('Erro no salvamento:', error);
      toast.error('Erro ao salvar a mídia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mídia?')) return;
    try {
      deleteFoto(id);
      registrarAcao(`Mídia excluída da galeria.`);
      toast.success('Mídia excluída com sucesso.');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao excluir.');
    }
  };

  const filteredGaleria = galeria.filter((photo) => {
    const matchesSearch = photo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (photo.descricao && photo.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'todos' || photo.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Galeria | Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sans text-foreground">Gestão da Galeria</h1>
          <p className="text-muted-foreground mt-1">Gerencie imagens e vídeos da galeria.</p>
        </div>
        <Button 
          onClick={() => openModal()}
          className="bg-[#D4AF37] text-white hover:bg-[#B5952F] gap-2 shadow-md w-full sm:w-auto"
        >
          <Plus size={18} />
          Adicionar Mídia
        </Button>
      </div>

      {galeria.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center gap-2 sm:w-64 shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="todos">Todas as categorias</option>
              <option value="mega-hair">Mega Hair</option>
              <option value="corte">Corte</option>
              <option value="colorimetria">Colorimetria</option>
              <option value="penteado">Penteado</option>
              <option value="tratamento">Tratamento</option>
            </select>
          </div>
        </div>
      )}

      {galeria.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">Nenhuma mídia na galeria ainda</h3>
          <p className="text-muted-foreground max-w-sm mb-6">Comece adicionando fotos ou vídeos curtos dos seus melhores resultados.</p>
          <Button onClick={() => openModal()} variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
            Fazer primeiro upload
          </Button>
        </div>
      ) : filteredGaleria.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Search className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">Nenhum resultado encontrado</h3>
          <p className="text-muted-foreground">Não encontramos nenhuma mídia que corresponda à sua busca ou filtro.</p>
          <Button 
            onClick={() => { setSearchTerm(''); setFilterCategory('todos'); }} 
            variant="link" 
            className="text-[#D4AF37] mt-2"
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGaleria.map((photo) => (
             <AdminMediaCard 
               key={photo.id} 
               photo={photo} 
               openModal={openModal} 
               handleDelete={handleDelete} 
             />
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-sans text-foreground">
                {editingId ? 'Editar Mídia' : 'Adicionar Nova Mídia'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">Mídia {editingId ? '(Opcional)' : '(Obrigatória)'}</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors relative cursor-pointer">
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*,video/mp4,video/webm" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required={!editingId}
                  />
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground truncate w-full px-2">
                    {fileName || 'Clique para selecionar imagem ou vídeo'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP ou MP4 (Max 50MB)</p>
                </div>
                
                {(fileBase64 || formData.imagem) && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-border h-32 bg-black relative flex items-center justify-center">
                    {isVideo(fileBase64 || formData.imagem) ? (
                      <video 
                        src={fileBase64 || formData.imagem} 
                        className="w-full h-full object-contain"
                        controls
                      />
                    ) : (
                      <img 
                        src={fileBase64 || formData.imagem} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título <span className="text-red-500">*</span></Label>
                <Input 
                  id="titulo" 
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Ex: Loiro Perolado"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria <span className="text-red-500">*</span></Label>
                <select
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="todos" disabled>Selecione uma categoria...</option>
                  <option value="mega-hair">Mega Hair</option>
                  <option value="corte">Corte</option>
                  <option value="colorimetria">Colorimetria</option>
                  <option value="penteado">Penteado</option>
                  <option value="tratamento">Tratamento</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Detalhes sobre a técnica ou cabelo..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#D4AF37] text-white hover:bg-[#B5952F] min-w-[140px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-2xl border border-border text-center transform transition-all">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Sucesso!</h2>
            <p className="text-muted-foreground mb-6">A mídia foi salva na sua galeria com sucesso.</p>
            <Button 
              onClick={() => setSuccessModalOpen(false)}
              className="bg-[#D4AF37] text-white hover:bg-[#B5952F] w-full"
            >
              Concluir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}