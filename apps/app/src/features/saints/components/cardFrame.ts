// The illuminated frame is a fixed cream-and-gold raster for the back of every
// holy card, so it stays light in both themes. The ink colors are hand-picked
// to read on parchment (the back, and the prints veiling unreceived cards)
// rather than coming from theme tokens.
export const cardFrame = require('../../../../assets/textures/card_back_frame.webp')

export const cardInk = {
  name: '#6E521F',
  meta: '#8A6A3B',
  prayer: '#43361F',
} as const
