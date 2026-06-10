# CharpynterHair - Salão de Beleza & Sistema de Gestão

Projeto acadêmico desenvolvido para a disciplina de Linguagem de Programação, ministrada pelo professor Leandro Guarino.

## Sobre o Projeto

O **CharpynterHair** é uma aplicação web voltada para um salão de beleza. O projeto além de um site de portfólio, integra uma **Área Pública** para os clientes conhecerem os serviços e entrarem em contato, e uma **Área Administrativa (Dashboard)** para controle interno, gestão de leads, catálogo, galeria e configurações.

O objetivo do desenvolvimento foi aplicar conceitos de programação web, componentização, estilização responsiva e organização de projetos utilizando tecnologias modernas do ecossistema React.

## Funcionalidades

### Área Pública (Portfólio & Atendimento)
- **Página Inicial (Home):** Banner principal e apresentação do salão.
- **Quem Somos (About):** Informações detalhadas sobre a trajetória e os profissionais.
- **Especialidades & Serviços:** Listagem detalhada de tratamentos e cuidados oferecidos.
- **Galeria de Trabalhos:** Portfólio visual com fotos dos resultados reais.
- **Contato:** Canais de atendimento e integração de mensagens.
- **Botão Flutuante do WhatsApp:** Atalho rápido para agendamentos diretos.
- **Navegação Inteligente:** Cabeçalho adaptável, menu mobile dinâmico (`MobileNav`) e botão de retorno ao topo (`ScrollToTop`).
- **Página de Erro (404):** Tratamento amigável para rotas inexistentes.

### Área Administrativa (Dashboard de Gestão)
- **Tela de Login:** Autenticação e validação de acessos.
- **Rotas Protegidas (`ProtectedRoute`):** Segurança que impede acessos não autorizados ao painel de administração.
- **Dashboard Central:** Visão geral com métricas e indicadores de desempenho do salão.
- **Gerenciador de Leads:** Controle e visualização de clientes em potencial e contatos recebidos.
- **Catálogo Administrativo:** Gerenciamento dos serviços e especialidades oferecidos.
- **Gestão da Galeria:** Painel para adicionar ou remover fotos do portfólio público.
- **Configurações do Sistema:** Ajustes internos da plataforma administrativa.

## Tecnologias Utilizadas

- **React** (Biblioteca SPA para construção de interfaces)
- **TypeScript** (Tipagem estática para maior segurança e produtividade)
- **Vite** (Build tool e servidor de desenvolvimento ultra-rápido)
- **Tailwind CSS** (Framework CSS utility-first para estilização responsiva)
- **React Router DOM** (Gerenciamento e controle de rotas dinâmicas e protegidas)
- **Context API** (Gerenciamento de estado global da aplicação)
- **HTML5 & CSS3**

## Estrutura do Projeto

A arquitetura do projeto segue um padrão modular baseado em responsabilidades claras:

```text
src/
├── components/           # Componentes reutilizáveis do sistema
│   ├── admin/            # Componentes estruturais da área administrativa (Layout, Rotas Protegidas)
│   │   ├── DashboardLayout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── ui/               # Componentes atômicos e primitivos de interface (Estilo modular/reutilizável)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── skeleton.tsx
│   │   └── textarea.tsx
│   ├── Footer.tsx        # Rodapé geral da página
│   ├── Header.tsx        # Menu superior principal
│   ├── MobileNav.tsx     # Menu de navegação responsivo para dispositivos móveis
│   ├── ScrollToTop.tsx   # Botão flutuante para voltar ao topo da tela
│   └── WhatsAppButton.tsx# Botão de contato rápido integrado ao WhatsApp
├── context/              # Contextos globais da aplicação (Compartilhamento de dados)
│   └── DataContext.tsx
├── hooks/                # Hooks customizados para lógica compartilhada
│   ├── use-mobile.ts     # Detector dinâmico de tamanho de tela/dispositivos móveis
│   └── use-toast.js      # Sistema de notificações flutuantes (Toasts)
├── lib/                  # Utilitários, funções auxiliares e configurações de bibliotecas
│   ├── imageUtils.ts     # Funções utilitárias para manipulação/tratamento de imagens
│   └── utils.ts          # Funções auxiliares gerais (Ex: concatenação de classes Tailwind)
├── pages/                # Páginas e telas da aplicação
│   ├── admin/            # Telas internas da área administrativa
│   │   ├── CatalogPage.tsx
│   │   ├── ConfiguracoesPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── GaleriaPage.tsx
│   │   ├── LeadsPage.tsx
│   │   └── LoginPage.tsx
│   ├── AboutPage.tsx     # Tela "Sobre" o salão
│   ├── ContactPage.tsx   # Tela de Contato
│   ├── GaleryPage.tsx    # Tela de Galeria pública
│   ├── HomePage.tsx      # Tela Inicial
│   ├── NotFoundPage.tsx  # Tela de erro 404 (Rota não encontrada)
│   └── SpecialtiesPage.tsx # Tela de Especialidades/Serviços
├── types/                # Definições de tipos e interfaces do TypeScript
│   └── index.ts
├── App.tsx               # Componente raiz que estrutura os provedores e o roteamento
├── index.css             # Estilos globais e diretivas do Tailwind CSS
├── main.tsx              # Ponto de entrada da aplicação (Renderização do React no DOM)
├── routes.tsx            # Configuração de todas as rotas públicas e privadas
└── vite-env.d.ts         # Declarações de tipos de ambiente do Vite
```

## Como Executar o Projeto

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
```

2. Acesse a pasta do projeto:

```bash
cd CharpynterHair-front
```

3. Instale as dependências:

```bash
npm install
```

4. Execute o projeto:

```bash
npm run dev
```

5. Acesse:

```text
http://localhost:5173
```

## Autor

Victor Hugo Domingos Bastos

Projeto desenvolvido para fins acadêmicos.
