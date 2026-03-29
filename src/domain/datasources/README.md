# Datasources

This folder contains low-level connectors (Supabase/broker/http). It must not leak raw DTOs into UI.

Rules:
- Repositories call datasources.
- UI and route components do not call datasources directly.
- Keep API/client initialization here.
