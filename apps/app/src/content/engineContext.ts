import type { EngineContext } from '@ember/content-engine'
import actOfCharity from '@/assets/prayers/act-of-charity.json'
import actOfContrition from '@/assets/prayers/act-of-contrition.json'
import actOfFaith from '@/assets/prayers/act-of-faith.json'
import actOfHope from '@/assets/prayers/act-of-hope.json'
import animaChristi from '@/assets/prayers/anima-christi.json'
import apostlesCreed from '@/assets/prayers/apostles-creed.json'
import benedictus from '@/assets/prayers/benedictus.json'
import comeHolySpirit from '@/assets/prayers/come-holy-spirit.json'
import divineMercyResponse from '@/assets/prayers/divine-mercy-response.json'
import eternalFather from '@/assets/prayers/eternal-father.json'
import fatimaPrayer from '@/assets/prayers/fatima-prayer.json'
import gloryBe from '@/assets/prayers/glory-be.json'
import graceAfterMeals from '@/assets/prayers/grace-after-meals.json'
import graceBeforeMeals from '@/assets/prayers/grace-before-meals.json'
import hailHolyQueen from '@/assets/prayers/hail-holy-queen.json'
import hailMary from '@/assets/prayers/hail-mary.json'
import holyGod from '@/assets/prayers/holy-god.json'
import magnificat from '@/assets/prayers/magnificat.json'
import nuncDimittis from '@/assets/prayers/nunc-dimittis.json'
import openingVerse from '@/assets/prayers/opening-verse.json'
import ourFather from '@/assets/prayers/our-father.json'
import signOfCross from '@/assets/prayers/sign-of-cross.json'
import i18n, { localizeContent } from '@/lib/i18n'
import { parseTrackEntry } from '@/lib/lectio'
import { parsePsalmRef } from '@/lib/liturgical'

export function createEngineContext(): EngineContext {
  return {
    language: i18n.language,
    localizeContent,
    t: (k, o) => i18n.t(k, o) as string,
    parsePsalmRef,
    parseTrackEntry,
    prayers: {
      'sign-of-cross': signOfCross,
      'our-father': ourFather,
      'hail-mary': hailMary,
      'glory-be': gloryBe,
      'opening-verse': openingVerse,
      'apostles-creed': apostlesCreed,
      'fatima-prayer': fatimaPrayer,
      'hail-holy-queen': hailHolyQueen,
      'eternal-father': eternalFather,
      'divine-mercy-response': divineMercyResponse,
      'holy-god': holyGod,
      'act-of-contrition': actOfContrition,
      'act-of-faith': actOfFaith,
      'act-of-hope': actOfHope,
      'act-of-charity': actOfCharity,
      'anima-christi': animaChristi,
      'come-holy-spirit': comeHolySpirit,
      'grace-before-meals': graceBeforeMeals,
      'grace-after-meals': graceAfterMeals,
    },
    canticles: {
      benedictus,
      magnificat,
      'nunc-dimittis': nuncDimittis,
    },
  }
}
