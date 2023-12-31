(function () {
    let bodyElement = document.querySelector('body');

    //Book class: Represents a book
    class Book {
        constructor(title, author, isbn) {
            this.title = title;
            this.author = author;
            this.isbn = isbn;
        }
    }

    //UI Class: Handle UI Tasks
    class UI {
        static displayBooks() {
            const books = Store.getBooks();

            books.forEach((book) => UI.addBookToList(book));
        }

        static addBookToList(book) {
            const list = document.querySelector('#book-list');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${1}.</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn}</td>
                <td>
                    <button class="btn btn-danger delete fa fa-close icon-btn"></button>
                    <button id="#edit" class="btn btn-success far fa-pen-to-square icon-btn ms-2"></button>
                </td>
            `;
            list.appendChild(row);
        }

        static showAlert(message, className) {
            const div = document.createElement('div');
            div.className = `alert alert-${className}`;
            div.appendChild(document.createTextNode(message));
            const container = document.querySelector('.container');
            const form = document.querySelector('#book-form');
            container.insertBefore(div, form);

            //vanish in 3 seconds
            setTimeout(() => document.querySelector('.alert').remove(), 2000);
        }

        static ClearFields() {
            document.querySelector('#title').value = '';
            document.querySelector('#author').value = '';
            document.querySelector('#isbn').value = '';
        }

        static deleteBook(el) {
            if (el.classList.contains('delete')) {
                el.parentElement.parentElement.remove();
            }
        }
    }

    //Store Class: Handles Storage
    class Store {
        static getBooks() {
            let books;
            if (localStorage.getItem('books') === null) {
                books = [];
            } else {
                books = JSON.parse(localStorage.getItem('books'));
            }
            return books;
        }

        static addBook(book) {
            const books = Store.getBooks();
            books.push(book);

            localStorage.setItem('books', JSON.stringify(books));
        }

        static removeBook(isbn) {
            const books = Store.getBooks();
            books.forEach((book, index) => {
                if (book.isbn === isbn) {
                    books.splice(index, 1);
                }
            });

            localStorage.setItem('books', JSON.stringify(books));
        }
    }

    //Events: Display Books
    document.addEventListener('DOMContentLoaded', UI.displayBooks);

    //Event: Add a book
    document.querySelector('#book-form').addEventListener('submit', (e) => {
        //Prevent actual submit
        e.preventDefault();

        //GET form values
        const title = document.querySelector('#title').value;
        const author = document.querySelector('#author').value;
        const isbn = document.querySelector('#isbn').value;

        //validate
        if (title === '' || author === '' || isbn === '') {
            UI.showAlert('Please fill all the fields', 'danger');
        } else {
            //Instantiate Book
            const book = new Book(title, author, isbn);

            //Add book to store
            Store.addBook(book);

            //Add book to UI
            UI.addBookToList(book);

            //Show Success
            UI.showAlert('Book Added Successfully', 'success');

            //Clear Fields
            UI.ClearFields();
        }
    });

    //Event: Remove a book
    document.querySelector('#book-list').addEventListener('click', (e) => {
        //Remove book from UI
        UI.deleteBook(e.target);

        //Remove book from store
        Store.removeBook(
            e.target.parentElement.previousElementSibling.textContent,
        );

        UI.showAlert('Book removed Successfully', 'success');
    });

    /**
     * Event handler for changing theme
     */
    document.querySelector('#changeTheme').addEventListener('click', (e) => {
        let currentTheme = bodyElement.getAttribute('data-bs-theme');
        if (currentTheme === 'dark') {
            bodyElement.setAttribute('data-bs-theme', 'light');
            e.target.classList.add('fa-sun', 'btn-light');
            e.target.classList.remove('fa-moon', 'btn-primary');
        } else {
            bodyElement.setAttribute('data-bs-theme', 'dark');
            e.target.classList.add('fa-moon', 'btn-primary');
            e.target.classList.remove('fa-sun', 'btn-light');
        }
    });
})();
