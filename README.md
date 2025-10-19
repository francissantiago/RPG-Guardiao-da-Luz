# RPG Guardião da Luz — Documentação Completa

> Sistema completo para gerenciamento de mapas, personagens, inventário, inimigos e rolagem de dados para RPG de mesa.

---

## Visão Geral

- Frontend: React + TypeScript
- Backend: Node.js (server.js, SQLite)
- Funcionalidades: Geração de mapas, personagens, inventário, inimigos, rolagem de dados, interface visual e responsiva.

---

## Estrutura de Pastas

```
├── backend/
│   ├── server.js
│   ├── rpg.db
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SquareMapGenerator.tsx
│   │   │   ├── CharacterList.tsx
│   │   │   ├── CharacterDetails.tsx
│   │   │   ├── CharacterForm.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── DiceRoller.tsx
│   │   │   ├── EnemyList.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── assets/
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── ...
│   └── ...
└── README.md
```

---

## Módulos do Frontend

### 1. SquareMapGenerator.tsx
- **Função:** Geração procedural e visualização de mapas quadrados, com zoom, pan, seleção, ícones SVG de terreno e legenda visual.
- **Principais props e estados:** `mapSize`, `currentSeed`, `selectedCell`, `zoom`, `pan`.
- **Destaques:** Ícones SVG para cada tipo de terreno, seleção animada, controles de visualização, legenda visual.
- **Exemplo de uso:**
  ```tsx
  <SquareMapGenerator size={10} />
  ```

### 2. CharacterList.tsx
- **Função:** Lista todos os personagens cadastrados, permite selecionar para editar ou visualizar detalhes.
- **Principais props:** Lista de personagens, função para selecionar personagem.
- **Destaques:** Exibição resumida, integração com `CharacterDetails`.

### 3. CharacterDetails.tsx
- **Função:** Exibe e permite editar todos os detalhes do personagem selecionado.
- **Principais props:** `editedCharacter`, `setEditedCharacter`, `handleUpdateCharacter`.
- **Destaques:**
  - Edição inline de nome e atributos
  - Cálculo de pontos de combate, vida e energia
  - Exibição de inventário equipado, itens e moedas
  - Botão de salvar alterações

### 4. CharacterForm.tsx
- **Função:** Formulário para criar ou editar personagens.
- **Principais props:** Dados do personagem, handlers de submit/cancelar.
- **Destaques:** Validação de campos, integração com a lista de personagens.

### 5. Inventory.tsx
- **Função:** Gerencia e exibe o inventário do personagem.
- **Principais props:** Inventário, funções para equipar, remover e adicionar itens.
- **Destaques:** Separação entre equipados, itens e moedas.

### 6. DiceRoller.tsx
- **Função:** Ferramenta de rolagem de dados customizável.
- **Principais props:** Tipos de dados, quantidade, resultado.
- **Destaques:** Interface intuitiva, histórico de rolagens.

### 7. EnemyList.tsx
- **Função:** Gerencia e exibe inimigos presentes na sessão.
- **Principais props:** Lista de inimigos, funções para adicionar/remover.
- **Destaques:** Exibição rápida, integração futura com combate.

### 8. Sidebar.tsx
- **Função:** Navegação lateral entre módulos do sistema.
- **Principais props:** Seção ativa, handlers de navegação.
- **Destaques:** Acesso rápido a personagens, mapa, inventário, inimigos e dados.

### 9. App.tsx
- **Função:** Componente principal, orquestra a navegação e renderização dos módulos.
- **Destaques:** Pode ser expandido para múltiplas páginas ou rotas.

### 10. types.ts
- **Função:** Define todos os tipos TypeScript compartilhados (Character, Item, Enemy, etc).
- **Destaques:** Facilita tipagem forte e integração entre módulos.

---

## Módulos do Backend

### 1. server.js
- **Função:** Servidor Node.js para persistência de dados, autenticação e lógica de backend.
- **Principais rotas:** CRUD de personagens, inventário, inimigos, mapas.
- **Destaques:**
  - Uso de banco SQLite (`rpg.db`)
  - Endpoints RESTful
  - Pronto para expansão com autenticação e multiplayer

### 2. rpg.db
- **Função:** Banco de dados SQLite para persistência local.
- **Destaques:** Estrutura para tabelas de personagens, inventário, mapas, inimigos.

---

## Outras Pastas/Arquivos

- **assets/**: Imagens e SVGs utilizados no frontend.
- **public/**: Arquivos estáticos.
- **index.html**: HTML principal do frontend.
- **main.tsx**: Bootstrap da aplicação React.
- **package.json**: Dependências e scripts de build/run.

---

## Como Usar

1. Instale as dependências no diretório `frontend`:
   ```bash
   npm install
   ```
2. Rode o sistema:
   ```bash
   npm run dev
   ```
3. (Opcional) Rode o backend:
   ```bash
   cd ../backend
   node server.js
   ```
4. Acesse no navegador o endereço indicado (geralmente http://localhost:5173 ou similar).

---

## Possíveis Expansões Futuras

- Edição de terreno (clicar para alterar tipo)
- Múltipla seleção e ferramentas de área
- Exportação/importação de mapas
- Integração com backend para salvar mapas e sessões
- Suporte a tokens, personagens e regras de jogo
- Sincronização em tempo real (multiplayer)
- Sistema de combate e turnos
- Painel do mestre e painel do jogador

---

## Licença

MIT

---

Este projeto foi desenvolvido para facilitar a criação e visualização de mapas de RPG de forma rápida, visual e interativa. Sinta-se à vontade para contribuir ou sugerir melhorias!
