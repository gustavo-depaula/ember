#!/usr/bin/env node
// Converts 1961 Table of Lessons CSV to 4 LiturgicalDayMap JSON files
// Usage: node scripts/convert-1961-lectionary.mjs

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_PATH = join(__dirname, '1961-time.csv')
const SAINTS_PATH = join(__dirname, '1961-saints.csv')
const OUT_DIR = join(__dirname, '..', 'content', 'libraries', 'breviary', 'practices', 'dwdo', 'data')

// ── Book name → app abbreviation ──

const bookNameMap = {
  'Genesis': 'gen', 'Exodus': 'ex', 'Leviticus': 'lev', 'Numbers': 'num',
  'Deuteronomy': 'deut', 'Joshua': 'josh', 'Judges': 'judg', 'Ruth': 'ruth',
  '1 Samuel': '1sam', '2 Samuel': '2sam', '1 Kings': '1kgs', '2 Kings': '2kgs',
  '1 Chronicles': '1chr', '2 Chronicles': '2chr', 'Ezra': 'ezra', 'Nehemiah': 'neh',
  'Tobit': 'tob', 'Judith': 'jdt', 'Esther': 'esth',
  '1 Maccabees': '1mac', '2 Maccabees': '2mac',
  'Job': 'job', 'Psalms': 'ps', 'Proverbs': 'prov',
  'Ecclesiastes': 'eccl', 'Song of Songs': 'song',
  'Wisdom': 'wis', 'Ecclesiasticus': 'sir',
  'Isaiah': 'isa', 'Jeremiah': 'jer', 'Lamentations': 'lam',
  'Baruch': 'bar', 'Ezekiel': 'ezek', 'Daniel': 'dan',
  'Hosea': 'hos', 'Joel': 'joel', 'Amos': 'amos', 'Obadiah': 'obad',
  'Jonah': 'jonah', 'Micah': 'mic', 'Nahum': 'nah', 'Habakkuk': 'hab',
  'Zephaniah': 'zeph', 'Haggai': 'hag', 'Zechariah': 'zech', 'Malachi': 'mal',
  'Matthew': 'matt', 'Mark': 'mk', 'Luke': 'lk', 'John': 'jn', 'Acts': 'acts',
  'Romans': 'rom', '1 Corinthians': '1cor', '2 Corinthians': '2cor',
  'Galatians': 'gal', 'Ephesians': 'eph', 'Philippians': 'phil',
  'Colossians': 'col', '1 Thessalonians': '1thess', '2 Thessalonians': '2thess',
  '1 Timothy': '1tim', '2 Timothy': '2tim', 'Titus': 'tit', 'Philemon': 'phlm',
  'Hebrews': 'heb', 'James': 'jas',
  '1 Peter': '1pet', '2 Peter': '2pet',
  '1 John': '1jn', '2 John': '2jn', '3 John': '3jn',
  'Jude': 'jude', 'Revelation': 'rev',
  // Alternate names in the CSV
  'Song of the Three Children': null, // skip (deuterocanonical addition)
  '2 Esdras': null, // skip (apocryphal, not in app's Bible)
  'Prayer of Manasses': null,
}

// ── Day label → EF position key mapping ──

const weekdayNum = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }

function parseOrdinal(s) {
  const m = s.match(/^(\d+)/)
  return m ? parseInt(m[1]) : null
}

function dayLabelToContext(day) {
  // Advent
  let m = day.match(/^(\d+)\w+ Sunday in Advent$/)
  if (m) return { prefix: 'advent', week: parseInt(m[1]), isSunday: true }

  // Epiphany weeks
  m = day.match(/^(\d+)\w+ Sunday after Epiphany$/)
  if (m) return { prefix: 'epiphany', week: parseInt(m[1]), isSunday: true }

  // Lent
  m = day.match(/^(\d+)\w+ Sunday in Lent$/)
  if (m) return { prefix: 'lent', week: parseInt(m[1]), isSunday: true }

  // Easter (1st-5th Sunday after Easter)
  m = day.match(/^(\d+)\w+ Sunday after Easter$/)
  if (m) return { prefix: 'easter', week: parseInt(m[1]) + 1, isSunday: true }

  // Trinity / Post-Pentecost
  m = day.match(/^(\d+)\w+ Sunday after Trinity$/)
  if (m) {
    const n = parseInt(m[1])
    // 1st-23rd after Trinity → post-pentecost/2-24
    if (n <= 23) return { prefix: 'post-pentecost', week: n + 1, isSunday: true }
    // 24th-26th → epiphany-leftover/3-5
    return { prefix: 'epiphany-leftover', week: n - 21, isSunday: true }
  }

  // Named days
  const named = {
    'Septuagesima Sunday': { prefix: 'septuagesima', week: 1, isSunday: true },
    'Sexagesima Sunday': { prefix: 'septuagesima', week: 2, isSunday: true },
    'Quinquagesima Sunday': { prefix: 'septuagesima', week: 3, isSunday: true },
    'Ash Wednesday': { prefix: 'septuagesima', week: 3, fixedDay: 3 },
    'Sunday next before Easter': { prefix: 'holy-week', week: 1, isSunday: true },
    'Good Friday': { temporal: 'holy-week/1/5' },
    'Easter Even': { temporal: 'holy-week/1/6' },
    'Easter Day': { prefix: 'easter', week: 1, isSunday: true },
    'Ascension Day': { prefix: 'easter', week: 6, fixedDay: 4 },
    'Sunday after Ascension Day': { prefix: 'easter', week: 7, isSunday: true },
    'Whitsunday': { prefix: 'easter', week: 8, isSunday: true },
    'Trinity Sunday': { prefix: 'post-pentecost', week: 1, isSunday: true },
    'Sunday next before Advent': { prefix: 'post-pentecost', week: 25, isSunday: true },
    'Epiphany': { temporal: 'fixed/01-06', prefix: 'epiphany', week: 0 },

    // Fixed dates → temporal keys (ef-position returns these)
    'Christmas Eve': { fixedDate: '12-24' },
    'Christmas Day': { temporal: 'christmas/1/0' },
    'St Stephen': { temporal: 'fixed/12-26' },
    'St John Evangelist': { temporal: 'fixed/12-27' },
    'Innocents\' Day': { temporal: 'fixed/12-28' },
    'Sunday after Christmas Day': { skip: true },
    'December 29': { temporal: 'fixed/12-29' },
    'December 30': { temporal: 'fixed/12-30' },
    'December 31': { temporal: 'fixed/12-31' },
    'Circumcision of Christ': { temporal: 'fixed/01-01' },
    '2nd Sunday after Christmas': { skip: true },
    'January 2': { temporal: 'fixed/01-02' },
    'January 3': { temporal: 'fixed/01-03' },
    'January 4': { temporal: 'fixed/01-04' },
    'January 5': { temporal: 'fixed/01-05' },
  }

  return named[day] ?? { skip: true }
}

function getPositionKey(ctx, weekday) {
  if (ctx.skip) return null
  if (ctx.temporal && !weekday) return ctx.temporal
  if (ctx.fixedDate && !weekday) return null // goes to fixedDates, handled separately

  const dayNum = weekday ? weekdayNum[weekday] : 0
  if (ctx.fixedDay !== undefined && !weekday) {
    return `${ctx.prefix}/${ctx.week}/${ctx.fixedDay}`
  }
  // For "Ash Wednesday" with weekday (Thu/Fri/Sat after)
  if (ctx.fixedDay !== undefined && weekday) {
    return `${ctx.prefix}/${ctx.week}/${dayNum}`
  }
  // For "Ascension Day" with weekday (Fri/Sat after)
  if (ctx.prefix && weekday) {
    return `${ctx.prefix}/${ctx.week}/${dayNum}`
  }
  if (ctx.prefix && ctx.isSunday && !weekday) {
    return `${ctx.prefix}/${ctx.week}/0`
  }
  return null
}

// ── Reference conversion ──

const singleChapterBooks = new Set(['obad', 'phlm', 'jude', '2jn', '3jn'])

// Expand a verse range into one or more chapter-scoped entries.
//   "1-20"       → ["${abbr} ${chapter}:1-20"]
//   "10-end"     → ["${abbr} ${chapter}:10-end"]
//   "8-9:7"      → ["${abbr} ${chapter}:8-end", "${abbr} 9:1-7"]
//   "10-12:end"  → ["${abbr} ${chapter}:10-end", "${abbr} 11", "${abbr} 12"]
//   "1-3:end"    → ["${abbr} ${chapter}:1-end", "${abbr} 2", "${abbr} 3"]
function expandVerseRange(abbr, startChapterStr, range) {
  const startChapter = parseInt(startChapterStr)
  const xChapMatch = range.match(/^(\d+)-(\d+):(\d+|end)$/)
  if (xChapMatch) {
    const startVerse = xChapMatch[1]
    const endChapter = parseInt(xChapMatch[2])
    const endVerseRaw = xChapMatch[3]
    const out = [`${abbr} ${startChapter}:${startVerse}-end`]
    for (let c = startChapter + 1; c < endChapter; c++) out.push(`${abbr} ${c}`)
    if (endVerseRaw === 'end') {
      out.push(`${abbr} ${endChapter}`)
    } else {
      out.push(`${abbr} ${endChapter}:1-${endVerseRaw}`)
    }
    return out
  }
  return [`${abbr} ${startChapter}:${range}`]
}

function findBookAbbr(name) {
  // Direct match
  if (bookNameMap[name] !== undefined) return bookNameMap[name]
  // Try with "Song of Songs" for "Song of the Three Children" etc.
  for (const [full, abbr] of Object.entries(bookNameMap)) {
    if (name.startsWith(full)) return abbr
  }
  console.warn(`  Unknown book: "${name}"`)
  return null
}

function convertReference(csvRef) {
  if (!csvRef || csvRef.trim() === '') return null

  let ref = csvRef.trim()
  // Strip parentheses but keep content
  ref = ref.replace(/[()]/g, '')
  // Normalize dashes: en-dash/em-dash → hyphen
  ref = ref.replace(/[–—]/g, '-')

  // Split on " & " to handle multi-part references
  const parts = ref.split(/\s+&\s+/)
  const converted = []
  let lastBook = null

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    // Try to match "Book Chapter:Verse-Verse" or "Book Chapter" or just "Chapter:Verse-Verse"
    // Full reference: "Isaiah 1:1-20", "Genesis 6", "2 Kings 4:8-37"
    const fullMatch = trimmed.match(/^(.+?)\s+(\d+)(?::(.+))?$/)
    if (fullMatch) {
      const bookName = fullMatch[1]
      const chapter = fullMatch[2]
      const verseRange = fullMatch[3]

      const abbr = findBookAbbr(bookName)
      if (abbr === null) continue // skip unknown books
      lastBook = abbr

      // Single-chapter books: "Jude 1-16" means ch1 v1-16, not chapter 1 verse range "16"
      if (singleChapterBooks.has(abbr) && !verseRange) {
        converted.push(`${abbr} 1:${chapter}`)
        continue
      }

      if (verseRange) {
        converted.push(...expandVerseRange(abbr, chapter, verseRange))
      } else {
        converted.push(`${abbr} ${chapter}`)
      }
      continue
    }

    // Inheriting last book: "Chapter:Verse-Verse", "17-end", "2", etc.
    if (lastBook) {
      // "10:14-24", "2:10-end", "1:22-2:10"
      const chapterMatch = trimmed.match(/^(\d+):(.+)$/)
      if (chapterMatch) {
        const chapter = chapterMatch[1]
        converted.push(...expandVerseRange(lastBook, chapter, chapterMatch[2]))
        continue
      }

      // Bare number: "17-end", "15-end", "2", "34"
      const verseOnlyMatch = trimmed.match(/^(\d+(?:-[\dend]+)?)$/)
      if (verseOnlyMatch) {
        // For single-chapter books, this is a verse range
        if (singleChapterBooks.has(lastBook)) {
          converted.push(`${lastBook} 1:${verseOnlyMatch[1]}`)
        } else {
          // Otherwise it's a chapter reference (or chapter range like "15-17")
          const chapterRangeMatch = verseOnlyMatch[1].match(/^(\d+)-(\d+)$/)
          if (chapterRangeMatch) {
            const start = parseInt(chapterRangeMatch[1])
            const end = parseInt(chapterRangeMatch[2])
            for (let c = start; c <= end; c++) converted.push(`${lastBook} ${c}`)
          } else {
            converted.push(`${lastBook} ${verseOnlyMatch[1]}`)
          }
        }
        continue
      }
    }

    // Single-chapter book with no verse ref: "Obadiah", "Philemon", "Jude", "2 John", "3 John"
    const bareAbbr = findBookAbbr(trimmed)
    if (bareAbbr !== null) {
      lastBook = bareAbbr
      converted.push(`${bareAbbr} 1`)
      continue
    }

    // Check if this is a known-skip book with extra text (e.g., "Song of the Three Children 29-37")
    const isKnownSkip = Object.entries(bookNameMap).some(([name, abbr]) => abbr === null && trimmed.startsWith(name))
    if (isKnownSkip) continue

    console.warn(`  Could not parse reference part: "${trimmed}"`)
  }

  return converted.length > 0 ? converted.join(';') : null
}

// ── CSV parsing ──

function parseCSVLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { fields.push(current); current = ''; continue }
    current += ch
  }
  fields.push(current)
  return fields
}

// ── Main conversion ──

function convertTemporalCSV() {
  const csv = readFileSync(CSV_PATH, 'utf8')
  const lines = csv.trim().split('\n')

  const maps = {
    mpOt: { temporal: {}, fixedDates: {}, feasts: {}, novenas: {}, reserves: [] },
    mpNt: { temporal: {}, fixedDates: {}, feasts: {}, novenas: {}, reserves: [] },
    epOt: { temporal: {}, fixedDates: {}, feasts: {}, novenas: {}, reserves: [] },
    epNt: { temporal: {}, fixedDates: {}, feasts: {}, novenas: {}, reserves: [] },
  }

  let stats = { mapped: 0, skipped: 0, empty: 0 }

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i])
    const day = fields[0]?.trim()
    const weekday = fields[1]?.trim() || null

    if (!day || day === 'Day') continue

    const ctx = dayLabelToContext(day)
    if (ctx.skip) {
      stats.skipped++
      continue
    }

    const key = getPositionKey(ctx, weekday)

    // Year 1 columns: indices 2 (MP OT), 4 (MP NT), 6 (EP OT), 8 (EP NT)
    const mpOtRef = convertReference(fields[2])
    const mpNtRef = convertReference(fields[4])
    const epOtRef = convertReference(fields[6])
    const epNtRef = convertReference(fields[8])

    if (!mpOtRef && !mpNtRef && !epOtRef && !epNtRef) {
      stats.empty++
      continue
    }

    // Determine where to put the entry
    const isFixedDate = ctx.fixedDate
    const section = isFixedDate ? 'fixedDates' : 'temporal'
    const entryKey = isFixedDate ? ctx.fixedDate : key

    if (!entryKey) {
      stats.skipped++
      continue
    }

    if (mpOtRef) maps.mpOt[section][entryKey] = { primary: mpOtRef }
    if (mpNtRef) maps.mpNt[section][entryKey] = { primary: mpNtRef }
    if (epOtRef) maps.epOt[section][entryKey] = { primary: epOtRef }
    if (epNtRef) maps.epNt[section][entryKey] = { primary: epNtRef }
    stats.mapped++
  }

  console.log(`Temporal: ${stats.mapped} mapped, ${stats.skipped} skipped, ${stats.empty} empty`)
  return maps
}

function convertSaintsCSV(maps) {
  const csv = readFileSync(SAINTS_PATH, 'utf8')
  const lines = csv.trim().split('\n')
  let count = 0

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i])
    const holyDay = fields[0]?.trim()
    const dateKey = fields[1]?.trim() // MM-DD format

    if (!holyDay || !dateKey) continue

    // Saints CSV: columns 4 (Mattins OT), 5 (Mattins NT), 6 (2nd Evensong OT), 7 (2nd Evensong NT)
    // Use Mattins for MP, 2nd Evensong for EP
    const mpOtRef = convertReference(fields[4])
    const mpNtRef = convertReference(fields[5])
    const epOtRef = convertReference(fields[6])
    const epNtRef = convertReference(fields[7])

    if (mpOtRef) maps.mpOt.feasts[dateKey] = { primary: mpOtRef }
    if (mpNtRef) maps.mpNt.feasts[dateKey] = { primary: mpNtRef }
    if (epOtRef) maps.epOt.feasts[dateKey] = { primary: epOtRef }
    if (epNtRef) maps.epNt.feasts[dateKey] = { primary: epNtRef }
    count++
  }

  console.log(`Saints: ${count} feast days mapped`)
}

function addReserves(maps) {
  // Reserve pool: Genesis chapters for calendar holes
  const reserves = Array.from({ length: 50 }, (_, i) => `gen ${i + 1}`)
  maps.mpOt.reserves = reserves
  maps.mpNt.reserves = ['matt 1', 'matt 2', 'matt 3', 'matt 4', 'matt 5']
  maps.epOt.reserves = reserves
  maps.epNt.reserves = ['rom 1', 'rom 2', 'rom 3', 'rom 4', 'rom 5']
}

// ── Run ──

const maps = convertTemporalCSV()
convertSaintsCSV(maps)
addReserves(maps)

const fileNames = {
  mpOt: 'mp-first-lesson-map.json',
  mpNt: 'mp-second-lesson-map.json',
  epOt: 'ep-first-lesson-map.json',
  epNt: 'ep-second-lesson-map.json',
}

for (const [key, filename] of Object.entries(fileNames)) {
  const path = join(OUT_DIR, filename)
  writeFileSync(path, JSON.stringify(maps[key], null, 2) + '\n')
  const tCount = Object.keys(maps[key].temporal).length
  const fCount = Object.keys(maps[key].fixedDates).length
  const sCount = Object.keys(maps[key].feasts).length
  console.log(`  ${filename}: ${tCount} temporal, ${fCount} fixed, ${sCount} feasts`)
}

console.log('Done!')
