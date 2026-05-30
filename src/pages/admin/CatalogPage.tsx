import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Trash2, Edit2, X, Upload, Package, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useDataContext } from '@/context/DataContext';
import { CatalogoItem } from '@/types';

export default function CatalogPage() {
  const { catalogo, addProduto, editProduto, deleteProduto } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para a barra de pesquisa e filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('Todos');
  
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    preco: '',
    tipo: 'Liso',
    comprimento: '',
    estoque: ''
  });
  
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  // Função auxiliar para registrar ações no Dashboard
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
    window.dispatchEvent(new Event('storage'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('O arquivo excede o limite de 5MB.');
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

  const openModal = (product: CatalogoItem | null = null) => {
    if (product) {
      setFormData({
        id: product.id,
        nome: product.nome,
        descricao: product.descricao,
        preco: product.preco.toString(),
        tipo: product.tipo || 'Liso',
        comprimento: product.comprimento || '',
        estoque: product.estoque?.toString() || ''
      });
    } else {
      setFormData({ id: '', nome: '', descricao: '', preco: '', tipo: 'Liso', comprimento: '', estoque: '' });
    }
    setFileBase64(null);
    setFileName('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.descricao || !formData.preco) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    if (parseFloat(formData.preco) <= 0) {
      toast.error('O preço deve ser maior que zero.');
      return;
    }
    if (!formData.id && !fileBase64) {
      toast.error('A imagem é obrigatória para novos produtos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CatalogoItem = {
        id: formData.id || Date.now().toString(),
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        tipo: formData.tipo,
        comprimento: formData.comprimento,
        estoque: formData.estoque !== '' ? parseInt(formData.estoque) : 0,
        imagem: fileBase64 || ''
      };

      if (formData.id) {
        editProduto(formData.id, payload);
        registrarAcao(`Produto editado no catálogo: ${formData.nome}`);
        toast.success('Produto atualizado com sucesso!');
      } else {
        addProduto(payload);
        registrarAcao(`Novo produto adicionado ao catálogo: ${formData.nome}`);
        toast.success('Produto adicionado com sucesso!');
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const produtoParaExcluir = catalogo.find(p => p.id === id);
      deleteProduto(id);
      registrarAcao(`Produto excluído do catálogo: ${produtoParaExcluir?.nome || 'Sem nome'}`);
      toast.success('Produto excluído com sucesso.');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir o produto.');
    }
  };

  // Lógica de filtragem do catálogo
  const filteredCatalogo = catalogo.filter((product) => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (product.descricao && product.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTipo = filterTipo === 'Todos' || product.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Catálogo | Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-sans text-3xl font-bold text-foreground">Catálogo - Gestão de Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os cabelos disponíveis</p>
        </div>
        <Button 
          onClick={() => openModal()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-md w-full sm:w-auto"
        >
          <Plus size={18} />
          Adicionar Produto
        </Button>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      {catalogo.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center gap-2 sm:w-64 shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="Todos">Todos os tipos</option>
              <option value="Liso">Liso</option>
              <option value="Ondulado">Ondulado</option>
              <option value="Cacheado">Cacheado</option>
            </select>
          </div>
        </div>
      )}

      {/* Renderização Condicional do Conteúdo */}
      {catalogo.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">Nenhum produto no catálogo</h3>
          <p className="text-muted-foreground max-w-sm mb-6">Adicione cabelos e produtos para exibir aos seus clientes.</p>
          <Button onClick={() => openModal()} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            Adicionar primeiro produto
          </Button>
        </div>
      ) : filteredCatalogo.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Search className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">Não encontramos nenhum produto que corresponda à sua busca ou filtro.</p>
          <Button 
            onClick={() => { setSearchTerm(''); setFilterTipo('Todos'); }} 
            variant="link" 
            className="text-primary mt-2"
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalogo.map((product) => (
            <div key={product.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative bg-muted">
                <img 
                  src={product.imagem} 
                  alt={product.nome} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                    {product.tipo}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="font-sans text-lg text-foreground line-clamp-2">{product.nome}</h3>
                  <span className="font-bold text-primary whitespace-nowrap">
                    R$ {parseFloat(product.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.comprimento && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                      {product.comprimento}
                    </span>
                  )}
                  {product.estoque !== null && product.estoque !== undefined && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                      Estoque: {product.estoque}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-border flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openModal(product)}
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl rounded-xl p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-sans text-foreground">
                {formData.id ? 'Editar Produto' : 'Adicionar Produto'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Produto <span className="text-destructive">*</span></Label>
                    <Input 
                      id="nome" 
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: Cabelo Liso Premium"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) <span className="text-destructive">*</span></Label>
                    <Input 
                      id="preco" 
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({...formData, preco: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <select 
                      id="tipo"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    >
                      <option value="Liso">Liso</option>
                      <option value="Ondulado">Ondulado</option>
                      <option value="Cacheado">Cacheado</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="comprimento">Comprimento</Label>
                      <Input 
                        id="comprimento" 
                        value={formData.comprimento}
                        onChange={(e) => setFormData({...formData, comprimento: e.target.value})}
                        placeholder="Ex: 60cm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estoque">Estoque</Label>
                      <Input 
                        id="estoque" 
                        type="number"
                        value={formData.estoque}
                        onChange={(e) => setFormData({...formData, estoque: e.target.value})}
                        placeholder="Qtd"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-upload">Imagem {formData.id ? '(Opcional)' : '(Obrigatória)'}</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors relative cursor-pointer h-[140px] flex flex-col items-center justify-center">
                      <input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required={!formData.id && !fileBase64}
                      />
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground truncate w-full px-4">
                        {fileName || 'Selecionar imagem'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição <span className="text-destructive">*</span></Label>
                    <Textarea 
                      id="descricao" 
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      placeholder="Detalhes do produto..."
                      rows={5}
                      className="resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
                  className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}