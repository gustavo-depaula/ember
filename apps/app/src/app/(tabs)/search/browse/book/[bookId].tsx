// Search-local copy of the book detail route, so opening a book result from the
// search tab pushes onto the search stack (back/swipe returns to search) rather
// than leaking into the Today tab. Same screen component, different stack.
export { default } from '../../../(today,explore,library,you)/browse/book/[bookId]'
