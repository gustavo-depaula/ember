// The illuminated frame is a fixed cream-and-gold raster shared by every saint
// card surface (the flip back, the unrevealed front, and the gallery
// silhouettes), so it stays light in both themes. The ink colors are hand-picked
// to read on parchment rather than coming from theme tokens.
export const cardFrame = require('../../../../assets/textures/card_back_frame.webp')

export const cardInk = {
  name: '#6E521F',
  meta: '#8A6A3B',
  prayer: '#43361F',
} as const
