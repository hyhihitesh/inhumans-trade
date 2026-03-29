# Slice Migration Checklist

Use this checklist when replacing mocks with real backend for a single feature slice.

- [ ] Scope is limited to one slice.
- [ ] Domain contracts unchanged or backward-compatible.
- [ ] Repository interface defined for slice.
- [ ] Datasource implementation added (Supabase/API).
- [ ] DTO-to-domain mapper added and tested.
- [ ] Error handling mapped to UI-safe messages.
- [ ] Loading/empty/error/success states verified.
- [ ] No UI component imports mock datasource directly.
- [ ] Lint passed.
- [ ] Typecheck passed.
- [ ] Build passed.
- [ ] Docs updated.
