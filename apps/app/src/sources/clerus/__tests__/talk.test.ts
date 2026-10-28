import { describe, expect, it } from 'vitest'

import { paragraphsOf } from '../place'
import { nextPage, talkOnPage } from '../talk'

// Pages as Clerus sets a collection of homilies: headings with anchors of
// their own, the collection's running numbers in the text, a footer.
const first =
  '<BODY>End of the one before.<br><br>' +
  '<a Name=jf><h2><a href=nh.htm#jf>Domingo, 7 de Setembro de 2008</a></h2>' +
  '<a Name=jg><h2><a href=nh.htm#jg>CELEBRAÇÃO EUCARÍSTICA</a></h2>' +
  '<a name=a0z><b>7908</b><br><br> <i>Queridos irmãos e irmãs!</i><br><br> O primeiro parágrafo.' +
  '\n<hr><center><font size=4><b> Homilias 7908</b></font></center><a href=eiu.htm><img title=Nach src=s.gif></a>'
const second =
  '<BODY> O segundo parágrafo, noutra página.<br><br>' +
  '<a Name=jh><h2><a href=nh.htm#jh>Domingo, 14 de Setembro de 2008</a></h2> Outra homilia.' +
  '\n<hr><center><font size=4><b> Homilias 14908</b></font></center>'

describe('talkOnPage', () => {
  it('opens after the heading named and runs off the page when no heading follows', () => {
    const part = talkOnPage(first, 'jg')
    expect(part.ended).toBe(false)
    expect(paragraphsOf(part.markup.replace(/<a name=\w+><b>\d+<\/b>/g, ''))).toEqual([
      'Queridos irmãos e irmãs!',
      'O primeiro parágrafo.',
    ])
  })

  it('takes up at the top of the next page and stops at the next heading', () => {
    const part = talkOnPage(second)
    expect(part.ended).toBe(true)
    expect(paragraphsOf(part.markup)).toEqual(['O segundo parágrafo, noutra página.'])
  })

  it('finds nothing under an anchor the page lacks', () => {
    expect(talkOnPage(first, 'zz')).toEqual({ markup: '', ended: true })
  })

  it('knows a heading set in the middle of the page', () => {
    const page =
      '<BODY><a Name=dst><center><h1><a href=2h.htm#dst>AUDIÊNCIA</a></h1></center> O texto.' +
      '<a Name=dsv><center><h1><a href=2h.htm#dsv>OUTRA</a></h1></center> Outro.'
    expect(paragraphsOf(talkOnPage(page, 'dst').markup)).toEqual(['O texto.'])
  })
})

describe('paragraphsOf', () => {
  it('keeps the numbers of a linked reference', () => {
    expect(
      paragraphsOf('o princípio e o fim" (<i><a href=ap.htm#b>Ap 1,13</a></i>). Vindes hoje 12.'),
    ).toEqual(['o princípio e o fim" (Ap 1,13). Vindes hoje.'])
  })
})

describe('nextPage', () => {
  it('reads the page after from the foot of the page', () => {
    expect(nextPage(first)).toBe('eiu')
    expect(nextPage(second)).toBeUndefined()
  })
})
