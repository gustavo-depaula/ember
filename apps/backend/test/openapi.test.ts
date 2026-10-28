import { openApiDocument } from '@ember/api'
import { describe, expect, it } from 'vitest'
import app from '../src/app'

// The developer portal publishes this document as the API's reference: a route added to the
// Worker and not described, or described and since removed, fails here.
describe('OpenAPI document', () => {
  it('describes exactly the routes the Worker serves', () => {
    const served = app.routes
      .filter((r) => r.method !== 'ALL')
      .map((r) => `${r.method} ${r.path.replace(/\/$/, '') || '/'}`)
    const described = Object.entries(openApiDocument('https://example.test').paths).flatMap(
      ([path, operations]) =>
        Object.keys(operations).map(
          (method) => `${method.toUpperCase()} ${path.replace(/\{(\w+)\}/g, ':$1')}`,
        ),
    )
    expect(described.sort()).toEqual([...new Set(served)].sort())
  })
})
