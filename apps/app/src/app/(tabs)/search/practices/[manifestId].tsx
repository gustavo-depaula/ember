// Search-local copy of the practice detail route, so opening a result from the
// search tab pushes onto the search stack (back/swipe returns to search) rather
// than leaking into the Today tab. Same screen component, different stack.
export { default } from '../../(today,explore,library,you)/practices/[manifestId]/index'
