// On every page. The account's code — a database, encryption, the relay — is
// fetched only by a browser that is one of an account's devices, or on the
// page that makes it one: a visitor never downloads it.
import { connected } from './connected'

if (connected.get() || document.querySelector('[data-connect]')) import('./account')
