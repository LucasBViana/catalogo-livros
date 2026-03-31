# Catálogo de Livros

![Status](https://img.shields.io/badge/status-concluído-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## Sobre o Projeto

Aplicação web para gerenciamento de um catálogo de livros, desenvolvida como solução para um desafio técnico. Permite ao usuário visualizar, cadastrar, editar, excluir e favoritar livros, com persistência local e interface moderna e responsiva.

---

## Funcionalidades

### Requisitos Obrigatórios Alcançados
- Listagem de livros com capa, título, autor e descrição
- Cadastro de novos livros (URL da capa, título, autor, descrição)
- Edição de livros existentes
- Exclusão de livros
- Marcar/desmarcar livros como favoritos
- Persistência de dados no localStorage

### Funcionalidades Extras Adicionadas
- **Busca em tempo real** - Filtra por título ou autor
- **Ordenação múltipla** - Por data, título ou autor (crescente/decrescente)
- **Filtro por favoritos** - Visualiza apenas os livros favoritados
- **Exportar/Importar dados** - Backup completo em JSON
- **Modal personalizado de exclusão** - Preview do livro antes de excluir
- **Design responsivo** - Adaptado para desktop, tablet e mobile
- **Toast notifications** - Feedback visual para todas as ações
- **Fallback de imagens** - Tratamento de URLs quebradas

---

## Tecnologias Utilizadas

| Tecnologia | Descrição |
|------------|-----------|
| **HTML5** | Estrutura semântica da aplicação |
| **CSS3** | Estilização, Grid, Flexbox, animações e media queries |
| **JavaScript ES6+** | Lógica da aplicação (classes, arrow functions, template literals) |
| **Font Awesome** | Iconografia consistente |
| **localStorage API** | Persistência local dos dados |

---

## Como Executar

### Opção 1: Localmente
1. Abra o terminal/CMD e clone o repositório utilizando o seguinte código:
```bash
git clone https://github.com/LucasBViana/catalogo-livros.git
```
2. Após isso digite, ainda no terminal, o seguinte código para entrar no diretório da aplicação:
```bash
cd catalogo-livros
```

3. Então, para abrir a aplicação digite o seguinte no terminal:
```bash
# No Windows
start index.html

# No Mac
open index.html

# Ou use o Live Server no VS Code
```

### Opção 2: Localmente
1. Baixe os arquivos do projeto
2. Extraia em uma pasta
3. Abra o index.html no navegador

## Estrutura
```
catalogo-livros/
│
├── index.html              # Estrutura principal da aplicação
├── styles.css              # Estilos e responsividade
├── books_catalogy_v2.js    # Lógica da aplicação (JavaScript)
└── README.md               # Documentação do projeto
```