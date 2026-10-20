import type {Book} from "./task1-types";
import type {BookCatalog} from "./task6-classes";

export class Wishlist {
    private favoriteIds: string [] = [];

    constructor(initialIds: string [] = []) {
        this.favoriteIds = [...new Set(initialIds)];
    }

    toggle = (id: string): void => {
        if (this.has(id)) {
            this.favoriteIds = this.favoriteIds.filter (favId => favId !== id);
        }
        else {
            this.favoriteIds = [...this.favoriteIds, id]
        }
    };
    has = (id:string): boolean => {
        return this.favoriteIds.includes(id);
    }
    getFavorites = (catalog: BookCatalog): Book [] => {
        const allBooks = catalog.getBooks();

        return allBooks.filter(
            book => this.favoriteIds.includes(book.id)
        );
    };
    get count(): number {
        return this.favoriteIds.length;
    }

    get ids(): string [] {
        return [...this.favoriteIds];
    }
}