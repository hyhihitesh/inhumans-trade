# Architecture Rules (Sprint 0 Baseline)

## Boundaries
- UI components in `src/components/*` are presentational.
- Route handlers/pages in `src/app/*` coordinate request and rendering.
- Domain contracts live in `src/domain/*`.
- Repositories are the only layer allowed to talk to data sources.
- Data sources (Supabase, broker APIs, webhooks) are isolated behind repository implementations.

## Required Flow
`UI -> Controller/Page -> Repository Interface -> Datasource Implementation`

## UI Philosophy (Scandinavian Trust)
- **Warm Minimalism:** Use breathable layouts with soft contrasts (warm off-white backgrounds, charcoal text).
- **Anxiety-Reducing Clarity:** Complex financial data must be presented simply and calmly. Never use harsh contrasts or terminal-style density.
- **Progressive Disclosure:** Start with simple stats and primary actions. Reveal deeper analytics and complexity only as the user explores further.
- **Intentional Interaction:** Animations must be subtle and purposeful (soft fades, gentle slide-ins) to reinforce understanding, not for decoration.

## Feature Slice Migration Rule
When removing mocks for one slice:
1. Keep domain interfaces stable.
2. Replace only that slice repository implementation.
3. Keep other slices unchanged.
4. Validate with lint + typecheck + build.
