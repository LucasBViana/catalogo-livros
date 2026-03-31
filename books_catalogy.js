// ==================== MODELO DE DADOS ====================

class Book {
    constructor(id, coverUrl, title, author, description, isFavorite = false) {
        this.id = id;
        this.coverUrl = coverUrl;
        this.title = title;
        this.author = author;
        this.description = description;
        this.isFavorite = isFavorite;
    }
}

// ==================== GERENCIAMENTO DE ESTADO ====================

class BookCatalog {
    constructor() {
        this.books = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.editingId = null;
        this.currentSort = 'dateDesc';
        this.pendingDeleteId = null;
        
        if(document.readyState === 'loading'){
            document.addEventListener('DOMContentLoaded', () => this.init())
        } else{
            this.init();
        }
    }

    showConfirmModal(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;
        
        this.pendingDeleteId = bookId;
        const modal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const bookPreview = document.getElementById('bookPreview');
        const previewCover = document.getElementById('previewCover');
        const previewTitle = document.getElementById('previewTitle');
        const previewAuthor = document.getElementById('previewAuthor');
        
        // Mensagem para confirmar exclusão
        confirmMessage.innerHTML = `Tem certeza que deseja excluir <strong>"${this.escapeHtml(book.title)}"</strong>?<br>Esta ação não pode ser desfeita.`;
        
        // Preview do livro
        previewCover.src = book.coverUrl;
        previewCover.onerror = () => {
            previewCover.src = 'https://via.placeholder.com/60x80?text=Capa';
        };
        previewTitle.textContent = book.title;
        previewAuthor.textContent = `por ${book.author}`;
        bookPreview.style.display = 'flex';
        
        if (modal) modal.style.display = 'block';
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeConfirmModal();
            }
        };
    }

    closeConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) modal.style.display = 'none';
        this.pendingDeleteId = null;
    }

    executeDelete() {
        if (this.pendingDeleteId) {
            // Executa a exclusão
            this.books = this.books.filter(book => book.id !== this.pendingDeleteId);
            this.saveToLocalStorage();
            this.showToast('Livro excluído com sucesso!', 'success');
            this.render();
            this.closeConfirmModal();
        }
    }

    // Inicialização
    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.render();
    }

    // Carregar dados do localStorage
    loadFromLocalStorage() {
        const storedBooks = localStorage.getItem('books');
        if (storedBooks) {
            const booksData = JSON.parse(storedBooks);
            this.books = booksData.map(bookData => 
                new Book(bookData.id, bookData.coverUrl, bookData.title, 
                        bookData.author, bookData.description, bookData.isFavorite)
            );
        } else {
            this.books = this.getSampleBooks();
            this.saveToLocalStorage();
        }
    }

    // Salvar no localStorage
    saveToLocalStorage() {
        localStorage.setItem('books', JSON.stringify(this.books));
    }

    // ==================== MÉTODOS DE BACKUP MANUAL (EXPORT/IMPORT) ====================

    // Exportar dados para arquivo JSON
    exportData() {
        try {
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                totalBooks: this.books.length,
                books: this.books
            };
            
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            a.download = `livros-catalogo-${date}.json`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast(`${this.books.length} livros exportados com sucesso!`, 'success');
            
        } catch (error) {
            console.error('Erro ao exportar:', error);
            this.showToast('Erro ao exportar dados!', 'error');
        }
    }

    // Importar dados de arquivo JSON
    importData(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                let booksToImport;
                
                if (importedData.books && Array.isArray(importedData.books)) {
                    booksToImport = importedData.books;
                    this.showToast(`Importando ${booksToImport.length} livros`, 'success');
                } else if (Array.isArray(importedData)) {
                    booksToImport = importedData;
                    this.showToast(`Importando ${booksToImport.length} livros`, 'success');
                } else {
                    throw new Error('Formato de arquivo inválido');
                }
                
                if (confirm(`Isso irá substituir todos os ${this.books.length} livros atuais por ${booksToImport.length} livros importados. Continuar?`)) {
                    this.books = booksToImport.map(bookData => 
                        new Book(
                            bookData.id || Date.now().toString(),
                            bookData.coverUrl,
                            bookData.title,
                            bookData.author,
                            bookData.description,
                            bookData.isFavorite || false
                        )
                    );
                    
                    this.ensureUniqueIds();
                    this.saveToLocalStorage();
                    this.render();
                    this.showToast(`${this.books.length} livros importados com sucesso!`, 'success');
                }
                
            } catch (error) {
                console.error('Erro ao importar:', error);
                this.showToast('Arquivo inválido ou corrompido!', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showToast('Erro ao ler o arquivo!', 'error');
        };
        
        reader.readAsText(file);
    }

    // Garantia de ID's únicos
    ensureUniqueIds() {
        const ids = new Set();
        this.books.forEach(book => {
            if (!book.id || ids.has(book.id)) {
                book.id = Date.now() + Math.random().toString(36);
            }
            ids.add(book.id);
        });
    }

    // ==================== DADOS DE EXEMPLO ====================

    getSampleBooks() {
        return [
            new Book(
                Date.now().toString(),
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHL9cZVgukvBpU3Ar9N57jdjPygW9uUIKD6Q&s',
                'O Alquimista',
                'Paulo Coelho',
                'Um livro sobre a importância de seguir os próprios sonhos e ouvir o coração.',
                false
            ),
            new Book(
                (Date.now() + 1).toString(),
                'https://image.isu.pub/191205122940-56eb54f17cda10479f55169d92c6a2e3/jpg/page_1_thumb_large.jpg',
                'Dom Casmurro',
                'Machado de Assis',
                'Fica a pergunta, "Traiu ou não traiu?" pode não ser a obra prima de Machado, mas é a pergunta mais lembrada do objeto de corte de árvores.',
                true
            ),
            new Book(
                (Date.now() + 2).toString(),
                'https://cdn.awsli.com.br/1304/1304678/produto/85900220/61b06e91a9.jpg',
                '1984',
                'George Orwell',
                'O totalitarismo sendo mostrado pela sua verdadeira face, o controle total da existência privada e a dor de perder sua personalidade.',
                true
            )
        ];
    }

    // ==================== CRUD OPERATIONS ====================

    //Adição de livros novos
    addBook(coverUrl, title, author, description) {
        const newBook = new Book(
            Date.now().toString(),
            coverUrl,
            title,
            author,
            description,
            false
        );
        this.books.push(newBook);
        this.saveToLocalStorage();
        this.showToast('Livro adicionado com sucesso!');
        this.render();
    }

    //Edição de livros
    updateBook(id, coverUrl, title, author, description) {
        const index = this.books.findIndex(book => book.id === id);
        if (index !== -1) {
            this.books[index] = {
                ...this.books[index],
                coverUrl,
                title,
                author,
                description
            };
            this.saveToLocalStorage();
            this.showToast('Livro atualizado com sucesso!');
            this.render();
        }
    }

    //Exclusão de livros
    deleteBook(id) {
        this.showConfirmModal(id);
    }

    //Favoritar livros
    toggleFavorite(id) {
        const book = this.books.find(book => book.id === id);
        if (book) {
            book.isFavorite = !book.isFavorite;
            this.saveToLocalStorage();
            this.showToast(book.isFavorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
            this.render();
        }
    }

    // ==================== FILTROS, BUSCA E ORDENAÇÃO ====================

    //Filtros de busca por autor/título
    getFilteredBooks() {
        let filtered = [...this.books];
        
        if (this.currentFilter === 'favorites') {
            filtered = filtered.filter(book => book.isFavorite);
        }
        
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(book => 
                book.title.toLowerCase().includes(term) || 
                book.author.toLowerCase().includes(term)
            );
        }
        
        filtered = this.sortBooks(filtered);
        return filtered;
    }

    //Filtro de ordenação (alfabética para títulos ou autores e para momento de adição dos livros)
    sortBooks(books) {
        const sorted = [...books];
        
        switch(this.currentSort) {
            case 'dateDesc':
                sorted.sort((a, b) => parseInt(b.id) - parseInt(a.id));
                break;
            case 'dateAsc':
                sorted.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                break;
            case 'titleAsc':
                sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
                break;
            case 'titleDesc':
                sorted.sort((a, b) => b.title.localeCompare(a.title, 'pt-BR'));
                break;
            case 'authorAsc':
                sorted.sort((a, b) => a.author.localeCompare(b.author, 'pt-BR'));
                break;
            case 'authorDesc':
                sorted.sort((a, b) => b.author.localeCompare(a.author, 'pt-BR'));
                break;
            default:
                sorted.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        }
        
        return sorted;
    }

    // ==================== UI RENDERIZAÇÃO ====================

    render() {
        const filteredBooks = this.getFilteredBooks();
        const bookListElement = document.getElementById('bookList');
        
        if (!bookListElement) return;
        
        if (filteredBooks.length === 0) {
            bookListElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>Nenhum livro encontrado</p>
                    <small>${this.searchTerm ? 'Tente uma busca diferente' : 'Clique em "Novo Livro" para adicionar'}</small>
                </div>
            `;
            return;
        }
        
        bookListElement.innerHTML = filteredBooks.map(book => this.createBookCard(book)).join('');
        this.attachCardEventListeners();
    }

    createBookCard(book) {
        return `
            <div class="book-card" data-id="${book.id}">
                <div class="book-cover-container">
                    <img class="book-cover" src="${book.coverUrl}" 
                         alt="${book.title}" 
                         onerror="this.src='https://via.placeholder.com/400x380?text=Capa+não+disponível'">
                </div>
                
                <button class="favorite-btn ${book.isFavorite ? 'favorited' : ''}" data-action="favorite">
                    <i class="fas fa-star"></i>
                </button>
                
                <div class="book-info">
                    <div class="book-header">
                        <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
                        <div class="book-actions-compact">
                            <button class="btn-icon btn-edit" data-action="edit" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-danger" data-action="delete" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="book-author">
                        <i class="fas fa-user"></i>
                        ${this.escapeHtml(book.author)}
                    </div>
                    <div class="book-description">
                        ${this.escapeHtml(book.description)}
                    </div>
                </div>
            </div>
        `;
    }

    attachCardEventListeners() {
        document.querySelectorAll('.book-card').forEach(card => {
            const id = card.dataset.id;
            
            const favoriteBtn = card.querySelector('[data-action="favorite"]');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavorite(id);
                });
            }
            
            const editBtn = card.querySelector('[data-action="edit"]');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openEditModal(id);
                });
            }
            
            const deleteBtn = card.querySelector('[data-action="delete"]');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteBook(id);
                });
            }
        });
    }

    // ==================== MODAL E FORMULÁRIO ====================

    openAddModal() {
        this.editingId = null;
        const modalTitle = document.getElementById('modalTitle');
        const bookForm = document.getElementById('bookForm');
        const modal = document.getElementById('modal');
        
        if (modalTitle) modalTitle.textContent = 'Adicionar Livro';
        if (bookForm) bookForm.reset();
        if (modal) modal.style.display = 'block';
    }

    openEditModal(id) {
        const book = this.books.find(b => b.id === id);
        if (book) {
            this.editingId = id;
            const modalTitle = document.getElementById('modalTitle');
            const coverUrl = document.getElementById('coverUrl');
            const title = document.getElementById('title');
            const author = document.getElementById('author');
            const description = document.getElementById('description');
            const modal = document.getElementById('modal');
            
            if (modalTitle) modalTitle.textContent = 'Editar Livro';
            if (coverUrl) coverUrl.value = book.coverUrl;
            if (title) title.value = book.title;
            if (author) author.value = book.author;
            if (description) description.value = book.description;
            if (modal) modal.style.display = 'block';
        }
    }

    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) modal.style.display = 'none';
        this.editingId = null;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const coverUrl = document.getElementById('coverUrl');
        const title = document.getElementById('title');
        const author = document.getElementById('author');
        const description = document.getElementById('description');
        
        const coverUrlValue = coverUrl ? coverUrl.value.trim() : '';
        const titleValue = title ? title.value.trim() : '';
        const authorValue = author ? author.value.trim() : '';
        const descriptionValue = description ? description.value.trim() : '';
        
        if (!coverUrlValue || !titleValue || !authorValue || !descriptionValue) {
            this.showToast('Por favor, preencha todos os campos!', 'error');
            return;
        }
        
        if (!this.isValidUrl(coverUrlValue)) {
            this.showToast('Por favor, insira uma URL válida para a capa!', 'error');
            return;
        }
        
        if (this.editingId) {
            this.updateBook(this.editingId, coverUrlValue, titleValue, authorValue, descriptionValue);
        } else {
            this.addBook(coverUrlValue, titleValue, authorValue, descriptionValue);
        }
        
        this.closeModal();
    }

    // ==================== EVENT LISTENERS ====================

    setupEventListeners() {
        // Botão adicionar livro
        const btnAddBook = document.getElementById('btnAddBook');
        if (btnAddBook) {
            btnAddBook.addEventListener('click', () => this.openAddModal());
        }

        // Botões de Exportar e Importar
        const btnExport = document.getElementById('btnExport');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportData());
        }
    
        const btnImport = document.getElementById('btnImport');
        const fileImport = document.getElementById('fileImport');
    
        if (btnImport && fileImport) {
            btnImport.addEventListener('click', () => {
                fileImport.click();
            });
        
            fileImport.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.importData(e.target.files[0]);
                    fileImport.value = '';
                }
            });
        }
        
        // Fechar modal
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        // Formulário
        const bookForm = document.getElementById('bookForm');
        if (bookForm) {
            bookForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Event listener para ordenação
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.render();
            });
        }
        
        // Filtros
        const filterAll = document.getElementById('filterAll');
        if (filterAll) {
            filterAll.addEventListener('click', () => {
                this.currentFilter = 'all';
                this.updateFilterButtons('all');
                this.render();
            });
        }
        
        const filterFavorites = document.getElementById('filterFavorites');
        if (filterFavorites) {
            filterFavorites.addEventListener('click', () => {
                this.currentFilter = 'favorites';
                this.updateFilterButtons('favorites');
                this.render();
            });
        }
        
        // Busca
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.render();
            });
        }
        
        // Botão de deletar livros
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.executeDelete();
            });
        }
        
        // Confirmação de exclusão
        const confirmCancelBtn = document.getElementById('confirmCancelBtn');
        if (confirmCancelBtn) {
            confirmCancelBtn.addEventListener('click', () => {
                this.closeConfirmModal();
            });
        }
    }

    updateFilterButtons(activeFilter) {
        const filterAll = document.getElementById('filterAll');
        const filterFavorites = document.getElementById('filterFavorites');
        
        if (filterAll) filterAll.classList.remove('active');
        if (filterFavorites) filterFavorites.classList.remove('active');
        
        if (activeFilter === 'all' && filterAll) {
            filterAll.classList.add('active');
        } else if (filterFavorites) {
            filterFavorites.classList.add('active');
        }
    }

    // ==================== UTILITÁRIOS ====================

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
    new BookCatalog();
});