import { localizeContent } from '@/lib/i18n'
import type { CycleData, FlowDefinition, LectioTrackDef, PracticeManifest, Variant } from '../types'
import actConsecrationSacredHeartFlow from './act-consecration-sacred-heart/flow.json'
import actConsecrationSacredHeartManifest from './act-consecration-sacred-heart/manifest.json'
import actContritonFlow from './act-contrition/flow.json'
import actContritonManifest from './act-contrition/manifest.json'
import actContritonPerfect from './act-contrition/variants/perfect.json'
import actContritonShort from './act-contrition/variants/short.json'
import actContritonTraditional from './act-contrition/variants/traditional.json'
import actsFaithHopeCharityFlow from './acts-faith-hope-charity/flow.json'
import actsFaithHopeCharityManifest from './acts-faith-hope-charity/manifest.json'
import angelusFlow from './angelus/flow.json'
import angelusManifest from './angelus/manifest.json'
import animaChristiFlow from './anima-christi/flow.json'
import animaChristiManifest from './anima-christi/manifest.json'
import bibleInYearCCC from './bible-catechism-in-year/data/ccc-reading.json'
import bibleInYearNT from './bible-catechism-in-year/data/nt-reading.json'
import bibleInYearOT from './bible-catechism-in-year/data/ot-reading.json'
import bibleInYearWisdom from './bible-catechism-in-year/data/wisdom-reading.json'
import bibleInYearFlow from './bible-catechism-in-year/flow.json'
import bibleInYearManifest from './bible-catechism-in-year/manifest.json'
import confessionPrepare from './confession/flows/prepare.json'
import confessionThanksgiving from './confession/flows/thanksgiving.json'
import confessionManifest from './confession/manifest.json'
import divineMercyFlow from './divine-mercy/flow.json'
import divineMercyManifest from './divine-mercy/manifest.json'
import cccReadings from './divine-office/data/ccc-readings.json'
import complinePsalms from './divine-office/data/compline-psalms.json'
import ntReadings from './divine-office/data/nt-readings.json'
import officeHymns from './divine-office/data/office-hymns.json'
import otReadings from './divine-office/data/ot-readings.json'
import psalter30Day from './divine-office/data/psalter-30-day.json'
import divineOfficeCompline from './divine-office/flows/compline.json'
import divineOfficeEvening from './divine-office/flows/evening.json'
import divineOfficeMorning from './divine-office/flows/morning.json'
import divineOfficeManifest from './divine-office/manifest.json'
import examinationFlow from './examination-of-conscience/flow.json'
import examinationManifest from './examination-of-conscience/manifest.json'
import examinationBeatitudes from './examination-of-conscience/variants/beatitudes.json'
import examinationIgantianExamen from './examination-of-conscience/variants/ignatian-examen.json'
import examinationTenCommandments from './examination-of-conscience/variants/ten-commandments.json'
import graceMealsAfter from './grace-meals/flows/after.json'
import graceMealsBefore from './grace-meals/flows/before.json'
import graceMealsManifest from './grace-meals/manifest.json'
import guardianAngelFlow from './guardian-angel/flow.json'
import guardianAngelManifest from './guardian-angel/manifest.json'
import lectioDivinaFlow from './lectio-divina/flow.json'
import lectioDivinaManifest from './lectio-divina/manifest.json'
import litanyLorettoFlow from './litany-loreto/flow.json'
import litanyLorettoManifest from './litany-loreto/manifest.json'
import litanySacredHeartFlow from './litany-sacred-heart/flow.json'
import litanySacredHeartManifest from './litany-sacred-heart/manifest.json'
import litanySaintsFlow from './litany-saints/flow.json'
import litanySaintsManifest from './litany-saints/manifest.json'
import littleOfficeCompline from './little-office-bvm/flows/compline.json'
import littleOfficeLauds from './little-office-bvm/flows/lauds.json'
import littleOfficeMatins from './little-office-bvm/flows/matins.json'
import littleOfficeNone from './little-office-bvm/flows/none.json'
import littleOfficePrime from './little-office-bvm/flows/prime.json'
import littleOfficeSext from './little-office-bvm/flows/sext.json'
import littleOfficeTerce from './little-office-bvm/flows/terce.json'
import littleOfficeVespers from './little-office-bvm/flows/vespers.json'
import littleOfficeManifest from './little-office-bvm/manifest.json'
import massExtraordinary from './mass/flows/extraordinary.json'
import massOrdinary from './mass/flows/ordinary.json'
import massManifest from './mass/manifest.json'
import memorareFlow from './memorare/flow.json'
import memorareManifest from './memorare/manifest.json'
import mentalPrayerFlow from './mental-prayer/flow.json'
import mentalPrayerManifest from './mental-prayer/manifest.json'
import mentalPrayerCarmelite from './mental-prayer/variants/carmelite.json'
import mentalPrayerIgantian from './mental-prayer/variants/ignatian.json'
import mentalPrayerSimple from './mental-prayer/variants/simple.json'
import miraculousMedalDays from './miraculous-medal-novena/data/days.json'
import miraculousMedalFlow from './miraculous-medal-novena/flow.json'
import miraculousMedalManifest from './miraculous-medal-novena/manifest.json'
import morningOfferingFlow from './morning-offering/flow.json'
import morningOfferingManifest from './morning-offering/manifest.json'
import nightPrayerFlow from './night-prayer/flow.json'
import nightPrayerManifest from './night-prayer/manifest.json'
import novenaHolySpiritDays from './novena-holy-spirit/data/days.json'
import novenaHolySpiritFlow from './novena-holy-spirit/flow.json'
import novenaHolySpiritManifest from './novena-holy-spirit/manifest.json'
import novenaSacredHeartDays from './novena-sacred-heart/data/days.json'
import novenaSacredHeartFlow from './novena-sacred-heart/flow.json'
import novenaSacredHeartManifest from './novena-sacred-heart/manifest.json'
import prayerStJosephFlow from './prayer-st-joseph/flow.json'
import prayerStJosephManifest from './prayer-st-joseph/manifest.json'
import prayerStJosephBernardine from './prayer-st-joseph/variants/bernardine.json'
import prayerStJosephTraditional from './prayer-st-joseph/variants/traditional.json'
import prayerStMichaelLong from './prayer-st-michael/flows/long.json'
import prayerStMichaelShort from './prayer-st-michael/flows/short.json'
import prayerStMichaelManifest from './prayer-st-michael/manifest.json'
import precesOpusDeiFlow from './preces-opus-dei/flow.json'
import precesOpusDeiManifest from './preces-opus-dei/manifest.json'
import reginaCaeliFlow from './regina-caeli/flow.json'
import reginaCaeliManifest from './regina-caeli/manifest.json'
import rosaryFlow from './rosary/flow.json'
import rosaryManifest from './rosary/manifest.json'
import rosaryMontfort from './rosary/variants/montfort.json'
import rosaryScriptural from './rosary/variants/scriptural.json'
import rosaryTraditional from './rosary/variants/traditional.json'
import sevenSorrowsFlow from './seven-sorrows/flow.json'
import sevenSorrowsManifest from './seven-sorrows/manifest.json'
import sevenSorrowsScriptural from './seven-sorrows/variants/scriptural.json'
import sevenSorrowsTraditional from './seven-sorrows/variants/traditional.json'
import spiritualCommunionFlow from './spiritual-communion/flow.json'
import spiritualCommunionManifest from './spiritual-communion/manifest.json'
import spiritualCommunionAlphonsus from './spiritual-communion/variants/alphonsus.json'
import spiritualCommunionTraditional from './spiritual-communion/variants/traditional.json'
import spiritualReadingFlow from './spiritual-reading/flow.json'
import spiritualReadingManifest from './spiritual-reading/manifest.json'
import stationsCrossFlow from './stations-cross/flow.json'
import stationsCrossManifest from './stations-cross/manifest.json'
import stationsFranciscan from './stations-cross/variants/franciscan.json'
import stationsJpii from './stations-cross/variants/jpii.json'
import stationsScriptural from './stations-cross/variants/scriptural.json'
import stationsTraditional from './stations-cross/variants/traditional.json'
import suscipeFlow from './suscipe/flow.json'
import suscipeManifest from './suscipe/manifest.json'
import thanksgivingMassFlow from './thanksgiving-mass/flow.json'
import thanksgivingMassManifest from './thanksgiving-mass/manifest.json'
import threeOclockFlow from './three-oclock-prayer/flow.json'
import threeOclockManifest from './three-oclock-prayer/manifest.json'
import veniCreatorFlow from './veni-creator/flow.json'
import veniCreatorManifest from './veni-creator/manifest.json'
import visitSacramentHolyHour from './visit-blessed-sacrament/flows/holy-hour.json'
import visitSacramentShortVisit from './visit-blessed-sacrament/flows/short-visit.json'
import visitSacramentManifest from './visit-blessed-sacrament/manifest.json'
import wayOfLightFlow from './way-of-light/flow.json'
import wayOfLightManifest from './way-of-light/manifest.json'
import wayOfLightScriptural from './way-of-light/variants/scriptural.json'
import wayOfLightTraditional from './way-of-light/variants/traditional.json'

const manifests: Record<string, PracticeManifest> = {
  'morning-offering': morningOfferingManifest as PracticeManifest,
  'mental-prayer': mentalPrayerManifest as PracticeManifest,
  angelus: angelusManifest as PracticeManifest,
  'guardian-angel': guardianAngelManifest as PracticeManifest,
  memorare: memorareManifest as PracticeManifest,
  'preces-opus-dei': precesOpusDeiManifest as PracticeManifest,
  rosary: rosaryManifest as PracticeManifest,
  'divine-mercy': divineMercyManifest as PracticeManifest,
  'stations-cross': stationsCrossManifest as PracticeManifest,
  'examination-of-conscience': examinationManifest as PracticeManifest,
  'night-prayer': nightPrayerManifest as PracticeManifest,
  'spiritual-reading': spiritualReadingManifest as PracticeManifest,
  confession: confessionManifest as PracticeManifest,
  'visit-blessed-sacrament': visitSacramentManifest as PracticeManifest,
  'three-oclock-prayer': threeOclockManifest as PracticeManifest,
  'divine-office': divineOfficeManifest as PracticeManifest,
  'little-office-bvm': littleOfficeManifest as PracticeManifest,
  'lectio-divina': lectioDivinaManifest as PracticeManifest,
  mass: massManifest as PracticeManifest,
  'bible-catechism-in-year': bibleInYearManifest as PracticeManifest,
  'novena-sacred-heart': novenaSacredHeartManifest as PracticeManifest,
  'regina-caeli': reginaCaeliManifest as PracticeManifest,
  'litany-loreto': litanyLorettoManifest as PracticeManifest,
  'seven-sorrows': sevenSorrowsManifest as PracticeManifest,
  'litany-sacred-heart': litanySacredHeartManifest as PracticeManifest,
  'act-consecration-sacred-heart': actConsecrationSacredHeartManifest as PracticeManifest,
  'veni-creator': veniCreatorManifest as PracticeManifest,
  'prayer-st-michael': prayerStMichaelManifest as PracticeManifest,
  'litany-saints': litanySaintsManifest as PracticeManifest,
  'prayer-st-joseph': prayerStJosephManifest as PracticeManifest,
  'spiritual-communion': spiritualCommunionManifest as PracticeManifest,
  'thanksgiving-mass': thanksgivingMassManifest as PracticeManifest,
  'grace-meals': graceMealsManifest as PracticeManifest,
  'acts-faith-hope-charity': actsFaithHopeCharityManifest as PracticeManifest,
  suscipe: suscipeManifest as PracticeManifest,
  'act-contrition': actContritonManifest as PracticeManifest,
  'way-of-light': wayOfLightManifest as PracticeManifest,
  'anima-christi': animaChristiManifest as PracticeManifest,
  'miraculous-medal-novena': miraculousMedalManifest as PracticeManifest,
  'novena-holy-spirit': novenaHolySpiritManifest as PracticeManifest,
}

const flows: Record<string, FlowDefinition> = {
  'morning-offering/default': morningOfferingFlow as FlowDefinition,
  'mental-prayer/default': mentalPrayerFlow as FlowDefinition,
  'angelus/default': angelusFlow as FlowDefinition,
  'guardian-angel/default': guardianAngelFlow as FlowDefinition,
  'memorare/default': memorareFlow as FlowDefinition,
  'preces-opus-dei/default': precesOpusDeiFlow as FlowDefinition,
  'rosary/joyful': rosaryFlow as FlowDefinition,
  'rosary/sorrowful': rosaryFlow as FlowDefinition,
  'rosary/glorious': rosaryFlow as FlowDefinition,
  'rosary/luminous': rosaryFlow as FlowDefinition,
  'divine-mercy/default': divineMercyFlow as FlowDefinition,
  'stations-cross/default': stationsCrossFlow as FlowDefinition,
  'examination-of-conscience/default': examinationFlow as FlowDefinition,
  'night-prayer/default': nightPrayerFlow as FlowDefinition,
  'spiritual-reading/default': spiritualReadingFlow as FlowDefinition,
  'confession/prepare': confessionPrepare as FlowDefinition,
  'confession/thanksgiving': confessionThanksgiving as FlowDefinition,
  'visit-blessed-sacrament/short-visit': visitSacramentShortVisit as FlowDefinition,
  'visit-blessed-sacrament/holy-hour': visitSacramentHolyHour as FlowDefinition,
  'three-oclock-prayer/default': threeOclockFlow as FlowDefinition,
  'divine-office/morning': divineOfficeMorning as FlowDefinition,
  'divine-office/evening': divineOfficeEvening as FlowDefinition,
  'divine-office/compline': divineOfficeCompline as FlowDefinition,
  'little-office-bvm/matins': littleOfficeMatins as FlowDefinition,
  'little-office-bvm/lauds': littleOfficeLauds as FlowDefinition,
  'little-office-bvm/prime': littleOfficePrime as FlowDefinition,
  'little-office-bvm/terce': littleOfficeTerce as FlowDefinition,
  'little-office-bvm/sext': littleOfficeSext as FlowDefinition,
  'little-office-bvm/none': littleOfficeNone as FlowDefinition,
  'little-office-bvm/vespers': littleOfficeVespers as FlowDefinition,
  'little-office-bvm/compline': littleOfficeCompline as FlowDefinition,
  'lectio-divina/default': lectioDivinaFlow as FlowDefinition,
  'mass/ordinary': massOrdinary as FlowDefinition,
  'mass/extraordinary': massExtraordinary as FlowDefinition,
  'bible-catechism-in-year/default': bibleInYearFlow as FlowDefinition,
  'novena-sacred-heart/default': novenaSacredHeartFlow as FlowDefinition,
  'regina-caeli/default': reginaCaeliFlow as FlowDefinition,
  'litany-loreto/default': litanyLorettoFlow as FlowDefinition,
  'seven-sorrows/default': sevenSorrowsFlow as FlowDefinition,
  'litany-sacred-heart/default': litanySacredHeartFlow as FlowDefinition,
  'act-consecration-sacred-heart/default': actConsecrationSacredHeartFlow as FlowDefinition,
  'veni-creator/default': veniCreatorFlow as FlowDefinition,
  'prayer-st-michael/short': prayerStMichaelShort as FlowDefinition,
  'prayer-st-michael/long': prayerStMichaelLong as FlowDefinition,
  'litany-saints/default': litanySaintsFlow as FlowDefinition,
  'prayer-st-joseph/default': prayerStJosephFlow as FlowDefinition,
  'spiritual-communion/default': spiritualCommunionFlow as FlowDefinition,
  'thanksgiving-mass/default': thanksgivingMassFlow as FlowDefinition,
  'grace-meals/before': graceMealsBefore as FlowDefinition,
  'grace-meals/after': graceMealsAfter as FlowDefinition,
  'acts-faith-hope-charity/default': actsFaithHopeCharityFlow as FlowDefinition,
  'suscipe/default': suscipeFlow as FlowDefinition,
  'act-contrition/default': actContritonFlow as FlowDefinition,
  'way-of-light/default': wayOfLightFlow as FlowDefinition,
  'anima-christi/default': animaChristiFlow as FlowDefinition,
  'miraculous-medal-novena/default': miraculousMedalFlow as FlowDefinition,
  'novena-holy-spirit/default': novenaHolySpiritFlow as FlowDefinition,
}

const variants: Record<string, Record<string, Variant>> = {
  rosary: {
    traditional: rosaryTraditional as Variant,
    scriptural: rosaryScriptural as Variant,
    montfort: rosaryMontfort as Variant,
  },
  'stations-cross': {
    traditional: stationsTraditional as Variant,
    scriptural: stationsScriptural as Variant,
    jpii: stationsJpii as Variant,
    franciscan: stationsFranciscan as Variant,
  },
  'mental-prayer': {
    ignatian: mentalPrayerIgantian as Variant,
    carmelite: mentalPrayerCarmelite as Variant,
    simple: mentalPrayerSimple as Variant,
  },
  'examination-of-conscience': {
    'ignatian-examen': examinationIgantianExamen as Variant,
    'ten-commandments': examinationTenCommandments as Variant,
    beatitudes: examinationBeatitudes as Variant,
  },
  'seven-sorrows': {
    traditional: sevenSorrowsTraditional as Variant,
    scriptural: sevenSorrowsScriptural as Variant,
  },
  'prayer-st-joseph': {
    traditional: prayerStJosephTraditional as Variant,
    bernardine: prayerStJosephBernardine as Variant,
  },
  'spiritual-communion': {
    traditional: spiritualCommunionTraditional as Variant,
    alphonsus: spiritualCommunionAlphonsus as Variant,
  },
  'act-contrition': {
    traditional: actContritonTraditional as Variant,
    short: actContritonShort as Variant,
    perfect: actContritonPerfect as Variant,
  },
  'way-of-light': {
    traditional: wayOfLightTraditional as Variant,
    scriptural: wayOfLightScriptural as Variant,
  },
}

const practiceData: Record<string, Record<string, CycleData>> = {
  'divine-office': {
    'psalter-30-day': psalter30Day as unknown as CycleData,
    'compline-psalms': complinePsalms as unknown as CycleData,
    'office-hymns': officeHymns as unknown as CycleData,
  },
  'little-office-bvm': {
    'office-hymns': officeHymns as unknown as CycleData,
  },
  'novena-sacred-heart': {
    'novena-days': novenaSacredHeartDays as unknown as CycleData,
  },
  'miraculous-medal-novena': {
    'novena-days': miraculousMedalDays as unknown as CycleData,
  },
  'novena-holy-spirit': {
    'novena-days': novenaHolySpiritDays as unknown as CycleData,
  },
}

export function loadPracticeData(practiceId: string): Record<string, CycleData> | undefined {
  return practiceData[practiceId]
}

const practiceTracks: Record<string, Record<string, LectioTrackDef>> = {
  'divine-office': {
    'ot-readings': otReadings as unknown as LectioTrackDef,
    'nt-readings': ntReadings as unknown as LectioTrackDef,
    'ccc-readings': cccReadings as unknown as LectioTrackDef,
  },
  'bible-catechism-in-year': {
    'ot-reading': bibleInYearOT as unknown as LectioTrackDef,
    'wisdom-reading': bibleInYearWisdom as unknown as LectioTrackDef,
    'nt-reading': bibleInYearNT as unknown as LectioTrackDef,
    'ccc-reading': bibleInYearCCC as unknown as LectioTrackDef,
  },
}

export function loadPracticeTracks(practiceId: string): Record<string, LectioTrackDef> | undefined {
  return practiceTracks[practiceId]
}

export function getManifest(id: string): PracticeManifest | undefined {
  return manifests[id]
}

const allManifests = Object.values(manifests)

export function getAllManifests(): PracticeManifest[] {
  return allManifests
}

export function loadFlowForSlot(practiceId: string, flowId: string): FlowDefinition | undefined {
  const key = `${practiceId}/${flowId}`
  if (flows[key]) return flows[key]
  // Fallback for legacy slots with stale slot_ids (e.g., 'default' before flows migration)
  const prefix = `${practiceId}/`
  const fallbackKey = Object.keys(flows).find((k) => k.startsWith(prefix))
  return fallbackKey ? flows[fallbackKey] : undefined
}

export function loadVariant(manifestId: string, variantId: string): Variant | undefined {
  return variants[manifestId]?.[variantId]
}

export function getDefaultVariant(manifestId: string): Variant | undefined {
  const manifest = manifests[manifestId]
  if (!manifest?.variants?.length) return undefined
  const firstVariantId = manifest.variants[0].id
  return variants[manifestId]?.[firstVariantId]
}

export function getManifestIconKey(manifestId: string): string {
  const map: Record<string, string> = {
    'stations-cross': 'cross',
    'divine-mercy': 'mercy',
    'guardian-angel': 'angel',
    memorare: 'mary',
    'preces-opus-dei': 'prayer',
    'morning-offering': 'sunrise',
    angelus: 'bell',
    rosary: 'rosary',
    'divine-office': 'prayer',
    'little-office-bvm': 'mary',
    mass: 'cross',
    'mental-prayer': 'prayer',
    'examination-of-conscience': 'prayer',
    'night-prayer': 'prayer',
    'three-oclock-prayer': 'mercy',
    'spiritual-reading': 'book',
    confession: 'cross',
    'visit-blessed-sacrament': 'eucharist',
    'lectio-divina': 'book',
    'bible-catechism-in-year': 'book',
    'novena-sacred-heart': 'sacred-heart',
    'regina-caeli': 'mary',
    'litany-loreto': 'mary',
    'seven-sorrows': 'mary',
    'litany-sacred-heart': 'sacred-heart',
    'act-consecration-sacred-heart': 'sacred-heart',
    'veni-creator': 'prayer',
    'prayer-st-michael': 'angel',
    'litany-saints': 'prayer',
    'prayer-st-joseph': 'prayer',
    'spiritual-communion': 'eucharist',
    'thanksgiving-mass': 'eucharist',
    'grace-meals': 'prayer',
    'acts-faith-hope-charity': 'prayer',
    suscipe: 'prayer',
    'act-contrition': 'cross',
    'way-of-light': 'cross',
    'anima-christi': 'eucharist',
    'miraculous-medal-novena': 'mary',
    'novena-holy-spirit': 'prayer',
  }
  return map[manifestId] ?? 'prayer'
}

export function getManifestCategories(): string[] {
  const cats = new Set<string>()
  for (const m of allManifests) {
    for (const c of m.categories) cats.add(c)
  }
  return Array.from(cats).sort()
}

export function searchManifests(query: string): PracticeManifest[] {
  const q = query.toLowerCase()
  return allManifests.filter((m) => {
    if (localizeContent(m.name).toLowerCase().includes(q)) return true
    if (m.tags?.some((t) => t.toLowerCase().includes(q))) return true
    if (m.description && localizeContent(m.description).toLowerCase().includes(q)) return true
    return false
  })
}
