/**
 * Typed accessor that the host implements so `mass-of` can read its
 * data (Mass propers, OF library blobs, OF data files) without knowing
 * how the host stores or addresses them.
 *
 * The host translates each call into a corpus read by stable kind-prefixed
 * id. Ids match the v2 catalog layout:
 *
 *   - `mass/of/<bucket>/<rest>`        — Mass propers (tempore / sanctorale / common / ritual / votive)
 *   - `of/ordinary/<rest>`             — Order of Mass parts
 *   - `of/preface/<rest>`              — Prefaces
 *   - `of/eucharistic-prayer/<rest>`   — Eucharistic prayers
 *   - `of-data/<subpath>`              — calendar / saints / IGMR / sacerdotale
 *
 * The accessor returns the multilingual JSON body merged across `langs`
 * (those it has available), or `undefined` if the item is unknown.
 */
export type MassOfDataSource = {
  /** Fetch an OF Mass proper by corpus id (e.g. `mass/of/tempore/holy-week/chrism-mass`). */
  fetchMassProper(id: string): Promise<unknown | undefined>
  /** Fetch an OF ordinary blob by corpus id (e.g. `of/ordinary/ordinario`). */
  fetchOrdinary(id: string): Promise<unknown | undefined>
  /** Fetch an OF preface blob by corpus id (e.g. `of/preface/pf016`). */
  fetchPreface(id: string): Promise<unknown | undefined>
  /** Fetch an OF data blob by corpus id (e.g. `of-data/calendar/sanctorale/_index`). */
  fetchOfData(id: string): Promise<unknown | undefined>
}
