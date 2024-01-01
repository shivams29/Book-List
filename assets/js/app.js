(function () {
    const bodyElement = document.querySelector('body');
    const bookList = bodyElement.querySelector('#bookList');
    const alertBox = bodyElement.querySelector('#alert');
    const alertIcon = alertBox.querySelector('i');
    const alertText = alertBox.querySelector('#alertText');
    const bookForm = bodyElement.querySelector('#bookForm');
    const editModal = new bootstrap.Modal('#editModal');
    const editBookForm = editModal._element.querySelector('#editBookForm');
    const editModalSuccess =
        editModal._element.querySelector('#modalSuccessState');

    const alertSeverityToIconMap = {
        success: 'fa-circle-check',
        warning: 'fa-circle-exclamation',
        danger: 'fa-triangle-exclamation',
    };

    //Book class: Represents a book
    class Book {
        constructor(title, author, isbn, description) {
            this.title = title;
            this.author = author;
            this.isbn = isbn;
            this.description = description;
        }
    }

    //Store Class: Handles Storage
    class Store {
        /**
         * Static method to get books from local storage
         * @returns {Array<object>} Array of books
         */
        static getBooks() {
            const books =
                localStorage.getItem('books') === null
                    ? []
                    : JSON.parse(localStorage.getItem('books'));
            return books;
        }

        /**
         * Add new book to local storage
         * @param {object} newBook Object of new book
         * @returns {number} Length of books array
         */
        static addBook(newBook) {
            const books = Store.getBooks();
            if (books.filter((book) => book.isbn === newBook.isbn).length) {
                throw new Error('Book with same ISBN already exists!');
            }
            books.push(newBook);
            localStorage.setItem('books', JSON.stringify(books));
            return books.length;
        }

        /**
         * Remove book from local storage
         * @param {string} isbn Unique isbn code
         */
        static removeBook(isbn) {
            let books = Store.getBooks();
            books = books.filter((book) => book.isbn !== isbn);
            localStorage.setItem('books', JSON.stringify(books));
        }

        /**
         * Static method to retrieve book details from store using isbn
         * @param {string} isbn Book isbn
         * @returns {object} Book details object
         */
        static getBookDetails(isbn) {
            const books = this.getBooks();
            return books.filter((book) => book.isbn === isbn)[0];
        }

        /**
         * Add new book to local storage
         * @param {object} book Object of new book
         * @returns {number} Length of books array
         */
        static editBookDetails(updatedBook) {
            const books = Store.getBooks();
            for (let i = 0; i < books.length; i++) {
                if (books[i].isbn === updatedBook.isbn) {
                    books[i] = updatedBook;
                    break;
                }
            }
            localStorage.setItem('books', JSON.stringify(books));
        }
    }

    //UI Class: Handle UI Tasks
    class UI {
        /**
         * Static method to display books
         */
        static displayBooks() {
            const books = Store.getBooks();
            books.forEach((book, index) => UI.addBookToList(book, index + 1));
        }

        /**
         * Static method to refresh book list
         */
        static refreshBookList() {
            bookList
                .querySelectorAll('#bookRow')
                .forEach((book) => book.remove());
            UI.displayBooks();
        }

        /**
         * Static method to show/hide null state
         */
        static handleNullState() {
            let bookNullState = bookList.querySelector('#bookNullState');
            if (bookList.querySelector('#bookRow') === null) {
                bookNullState.classList.remove('d-none');
            } else {
                bookNullState.classList.add('d-none');
            }
        }

        /**
         * Static method for rendering dom objects from book objects array
         * @param {object} book new book object to be rendered
         * @param {number} index Serial No. of new book
         */
        static addBookToList(book, index) {
            const row = document.createElement('tr');
            row.setAttribute('id', 'bookRow');
            row.setAttribute('data-isbn', book.isbn);
            row.innerHTML = `
                <td>${index}.</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn}</td>
                <td>
                    <button id="delete" data-isbn="${book.isbn}" class="btn btn-danger fa fa-close icon-btn"></button>
                    <button id="edit" data-isbn="${book.isbn}" class="btn btn-success far fa-pen-to-square icon-btn ms-2"></button>
                </td>
            `;
            bookList.appendChild(row);
            this.handleNullState();
        }

        /**
         * Static method to show alert in case of form update.
         * @param {string} message Error/Warning/Success message to be shown
         * @param {string} className Type of alert - error, info, warning, success
         */
        static showAlert(message, className) {
            if (alertBox.classList.contains(`alert-${className}`)) return;
            alertBox.classList.remove('d-none');
            alertBox.classList.add(`alert-${className}`, 'd-flex');
            alertText.innerHTML = message;
            alertIcon.classList.add(alertSeverityToIconMap[className]);
            // Hide alert after 2 seconds
            setTimeout(() => {
                alertBox.classList.remove('d-flex', `alert-${className}`);
                alertBox.classList.add('d-none');
                alertIcon.classList.remove(alertSeverityToIconMap[className]);
            }, 2000);
        }

        /**
         * Static method to clear form fields
         */
        static clearFields() {
            bookForm.reset();
        }

        /**
         * Static method to delete books
         * @param {HTMLElement} el HTML button object
         */
        static deleteBook(el) {
            if (el.getAttribute('id') === 'delete') {
                // Get isbn of current book
                let isbn = el.getAttribute('data-isbn');
                bookList.querySelector(`tr[data-isbn="${isbn}"]`).remove();
                this.handleNullState();

                //Remove book from store
                Store.removeBook(isbn);

                // Show success alert
                UI.showAlert('Book removed Successfully', 'success');
            }
        }

        /**
         * Static method for preparing edit form and opening modal
         * @param {HTMLElement} el
         */
        static editBook(el) {
            if (el.getAttribute('id') === 'edit') {
                let isbn = el.getAttribute('data-isbn');
                let bookDetails = Store.getBookDetails(isbn);
                if (!bookDetails) {
                    UI.showAlert(
                        'Book details not available! Please try again later.',
                        'error',
                    );
                } else {
                    let editBookForm =
                        editModal._element.querySelector('#editBookForm');
                    for (let [key, value] of Object.entries(bookDetails)) {
                        let inputElement = editBookForm.querySelector(
                            `[name="${key}"]`,
                        );
                        inputElement.value = value;
                    }
                    editModal.show();
                }
            }
        }

        static toggleModalSuccessState() {
            editBookForm.classList.toggle('d-none');
            editModalSuccess.classList.toggle('d-none');
        }
    }

    //Events: Display Books
    document.addEventListener('DOMContentLoaded', UI.displayBooks);

    //Event: Add a book
    bookForm.addEventListener('submit', (e) => {
        //Prevent actual submit
        e.preventDefault();

        if (!bookForm.checkValidity()) {
            bookForm.classList.add('was-validated');
            return;
        }

        bookForm.classList.remove('was-validated');
        bookForm.querySelector('[name="isbn"]').classList.remove('is-invalid');
        let formData = Object.fromEntries(new FormData(bookForm));
        let newBookIndex = 0;

        //Instantiate Book
        const book = new Book(
            formData.title,
            formData.author,
            formData.isbn,
            formData.description,
        );

        //Add book to store
        try {
            newBookIndex = Store.addBook(book);
        } catch (e) {
            bookForm.querySelector('[name="isbn"]').classList.add('is-invalid');
            return;
        }

        //Add book to UI
        UI.addBookToList(book, newBookIndex);

        //Show Success
        UI.showAlert('Book Added Successfully', 'success');

        //Clear Fields
        UI.clearFields();
    });

    //Event: Edit a book
    editBookForm.addEventListener('submit', (e) => {
        //Prevent actual submit
        e.preventDefault();

        if (!editBookForm.checkValidity()) {
            editBookForm.classList.add('was-validated');
            return;
        }

        editBookForm.classList.remove('was-validated');
        let formData = Object.fromEntries(new FormData(editBookForm));

        //Instantiate Book
        const book = new Book(
            formData.title,
            formData.author,
            formData.isbn,
            formData.description,
        );

        Store.editBookDetails(book);

        UI.refreshBookList();

        UI.toggleModalSuccessState();
    });

    /**
     * Event lister for deleting books
     */
    bookList.addEventListener('click', (e) => {
        //Remove book from UI
        UI.deleteBook(e.target);

        // Edit book details
        UI.editBook(e.target);
    });

    /**
     * Event handler for changing theme
     */
    bodyElement.querySelector('#changeTheme').addEventListener('click', (e) => {
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

    editModal._element.addEventListener('hidden.bs.modal', () => {
        editBookForm.classList.remove('d-none');
        editModalSuccess.classList.add('d-none');
    });
})();
