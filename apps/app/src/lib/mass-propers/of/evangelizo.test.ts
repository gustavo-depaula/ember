import { describe, expect, it } from 'vitest'
import { normalizeEvangelizo } from './evangelizo'

// Real API responses captured from feed.evangelizo.org

const weekdayHtml =
  'Monday of Easter week\n<br /><br />\nActs of the Apostles <font dir="ltr">2,14.22-33.</font>\n<br />\nThen Peter stood up with the Eleven,  raised his voice, and proclaimed:  &quot;You who are Jews, indeed all of you staying in Jerusalem.  Let this be known to you, and listen to my words.<br />\nGod raised this Jesus; of this we are all witnesses.<br />\nExalted at the right hand of God, he poured it forth, as you (both) see and hear.\n<br /><br /><br />\nPsalms <font dir="ltr">16(15),1-2a.5.7-8.9-10.11.</font>\n<br />\nKeep me, O God, for in you I take refuge;<br />\nI say to the LORD, &quot;My Lord are you.&quot;<br />\nO LORD, my allotted portion and my cup, <br />\r\nyou it is who hold fast my lot.<br />\n<br />\nI bless the LORD who counsels me; <br />\r\neven in the night my heart exhorts me.<br />\nI set the LORD ever before me; <br />\r\nwith him at my right hand I shall not be disturbed.\n<br /><br /><br />\nHoly Gospel of Jesus Christ according to Saint Matthew <font dir="ltr">28,8-15.</font>\n<br />\nMary Magdalene and the other Mary went away quickly from the tomb.<br />\nThe soldiers took the money and did as they were instructed.\n<br /><br /><br />\n'

const sundayHtml =
  'Second Sunday of Easter (Divine Mercy Sunday)\n<br /><br />\nActs of the Apostles <font dir="ltr">2,42-47.</font>\n<br />\nThey devoted themselves to the teaching of the apostles.<br />\nAll who believed were together.\n<br /><br /><br />\nPsalms <font dir="ltr">118(117),2-4.13-15.22-24.</font>\n<br />\nGive thanks to the LORD, for he is good.<br />\n<br />\nLet the house of Israel say.\n<br /><br /><br />\nFirst Letter of Peter <font dir="ltr">1,3-9.</font>\n<br />\nBlessed be the God and Father of our Lord Jesus Christ.<br />\nIn this you rejoice.\n<br /><br /><br />\nHoly Gospel of Jesus Christ according to Saint John <font dir="ltr">20,19-31.</font>\n<br />\nOn the evening of that first day of the week.\n<br /><br /><br />\n'

describe('normalizeEvangelizo', () => {
  describe('weekday (3 readings)', () => {
    const propers = normalizeEvangelizo(weekdayHtml)

    it('extracts first reading with citation', () => {
      expect(propers['first-reading']).toBeDefined()
      expect(propers['first-reading']?.citation).toBe('Acts of the Apostles 2,14.22-33.')
      expect(propers['first-reading']?.text).toContain('Then Peter stood up')
    })

    it('extracts psalm with citation', () => {
      expect(propers['responsorial-psalm']).toBeDefined()
      expect(propers['responsorial-psalm']?.citation).toBe('Psalms 16(15),1-2a.5.7-8.9-10.11.')
    })

    it('preserves psalm strophe breaks as double newlines', () => {
      const text = propers['responsorial-psalm']?.text
      expect(text).toContain('my lot.\n\nI bless')
    })

    it('keeps verse lines within strophes as single newlines', () => {
      const text = propers['responsorial-psalm']?.text
      expect(text).toContain('take refuge;\nI say to the LORD')
    })

    it('does not double-space continuation lines (\\r\\n handling)', () => {
      const text = propers['responsorial-psalm']?.text
      expect(text).not.toContain('\n\nyou it is')
      expect(text).toContain('cup, \nyou it is')
    })

    it('extracts gospel with citation', () => {
      expect(propers.gospel).toBeDefined()
      expect(propers.gospel?.citation).toContain('Saint Matthew 28,8-15.')
      expect(propers.gospel?.text).toContain('Mary Magdalene')
    })

    it('does not have a second reading on weekdays', () => {
      expect(propers['second-reading']).toBeUndefined()
    })

    it('strips day name from first reading citation', () => {
      expect(propers['first-reading']?.citation).not.toContain('Monday')
    })

    it('decodes HTML entities', () => {
      expect(propers['first-reading']?.text).toContain('"You who are Jews')
    })
  })

  describe('sunday (4 readings)', () => {
    const propers = normalizeEvangelizo(sundayHtml)

    it('extracts all four readings', () => {
      expect(propers['first-reading']).toBeDefined()
      expect(propers['responsorial-psalm']).toBeDefined()
      expect(propers['second-reading']).toBeDefined()
      expect(propers.gospel).toBeDefined()
    })

    it('maps second reading correctly', () => {
      expect(propers['second-reading']?.citation).toBe('First Letter of Peter 1,3-9.')
      expect(propers['second-reading']?.text).toContain('Blessed be the God')
    })
  })
})
