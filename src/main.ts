import './styles.css';
import { Book } from './task1-types';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from './task4-integration';
import { sortBooks } from './task5-utils';
//TODO 3.0: импортируйте BookCatalog из task6
import { BookCatalog } from './task6-classes';

// TODO 3.1: замените `let catalog: Catalog = {...}` на экземпляр
// `new BookCatalog([...те же книги...], 'main')`.
// Тип `Catalog` после замены больше не нужен — уберите импорт.


let catalog = new BookCatalog (
  'main',
  [{ id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
  { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 }]
);


// восстановление из localStorage

// Сейчас: JSON.parse кладёт в catalog простой объект — этого достаточно,
// потому что все операции идут через свободные функции addBook/removeBook.
// TODO 3.2: после перехода на класс JSON.parse вернёт объект БЕЗ методов.
// Нужно будет воссоздать экземпляр:
//   const parsed = JSON.parse(saved);
//   catalog = new BookCatalog(parsed.books, parsed.id);

const saved = localStorage.getItem('catalog');
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (parsed.books && Array.isArray(parsed.books)) {
      catalog = new BookCatalog(parsed.id || 'main', parsed.books);
    } else {
      catalog = new BookCatalog('main', Object.values(parsed));
    }
  }
  catch (e) {
    console.error('Ошибка парсинга каталога из localStorage')
  }
}


// сохранение В localStorage
function saveCatalog() {
  localStorage.setItem('catalog', JSON.stringify( {
    id: catalog.id,
    books: catalog.getBooks()
  }));
}

// DOM-элементы
const bookList = document.querySelector('#bookList') as HTMLDivElement;
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;

// отрисовка
function renderBooks(books: Book[]) {
  bookList.innerHTML = '';
  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте другие фильтры.';
    return;
  }

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';

    const titleEl = document.createElement('h3');
    titleEl.textContent = `${book.title} — ${book.authors.join(', ')}${book.year ? `, ${book.year}` : ''}`;
    card.append(titleEl);

    if (book.rating !== undefined) {
      const ratingEl = document.createElement('p');
      ratingEl.textContent = `Рейтинг: ${book.rating}`;
      card.append(ratingEl);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {

      // TODO 3.3: замените функциональный removeBook на метод класса.      
      catalog.removeBook(book.id)
      saveCatalog();
      // TODO 3.4: замените вызов Object.values(catalog) на метод каталога.
      // Таких мест, где вызывается Object.values(catalog), в файле несколько — найдите все.
      renderBooks(Object.values(catalog));
    });
    card.append(deleteBtn);

    bookList.append(card);
  });
}

// Первичная отрисовка
renderBooks(catalog.getBooks());

// обработчик формы
form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMessage.textContent = '';
  try {
    const formData = new FormData(form);
    const newBook = createBookFromForm(formData);

    // TODO 3.5: замените функциональный addBook на метод класса.
    catalog.addBook(newBook);

    saveCatalog();
    form.reset();

    renderBooks(Object.values(catalog));
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.textContent = error.message;
    }
  }
});

// фильтры и сортировка
function refreshList() {
  const filters: ((book: Book) => boolean)[] = [];

  if (authorInput.value.trim()) filters.push(filterByAuthor(authorInput.value.trim()));
  if (yearInput.value) filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
  let books = catalog.getBooks();
  if (searchInput.value.trim()) {
    const searchBooks = catalog.searchByTitle(searchInput.value.trim());
    const searchIds = new Set (searchBooks.map(b => b.id));
    filters.push(book => searchIds.has(book.id));
  }

  books = applyFilters(books, filters);
  books = sortBooks(books, sortBySelect.value as 'year' | 'rating');

  renderBooks(books);
}

filterBtn.addEventListener('click', refreshList);
searchInput.addEventListener('input', refreshList);
sortBySelect.addEventListener('change', refreshList);