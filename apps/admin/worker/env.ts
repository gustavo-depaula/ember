import type { Reviewer } from './reviewer'

export type Env = {
  DB: D1Database
  ASSETS: Fetcher
  REVIEWER: DurableObjectNamespace<Reviewer>
  // From `claude setup-token`. Held here and added to the reviewer's calls on their way out.
  CLAUDE_CODE_OAUTH_TOKEN?: string
  ACCESS_TEAM_DOMAIN?: string
  ACCESS_AUD?: string
  // The model reviews run on; Claude Code's default when unset.
  MODERATION_MODEL?: string
}
