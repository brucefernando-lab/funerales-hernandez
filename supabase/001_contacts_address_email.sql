-- Migración 001: columnas propias `address` y `email` en `contacts`
-- Ejecutar en Supabase > SQL Editor. Es seguro correrla varias veces (idempotente).
-- La app funciona ANTES y DESPUÉS de correrla (usa el formato anterior si no existen las columnas).

-- 1) Crear columnas
alter table public.contacts add column if not exists address text;
alter table public.contacts add column if not exists email text;

-- 2) Migrar datos antiguos: sacar DOM:/EMAIL: del campo notes ("[META:DOM:...||EMAIL:...] nota")
update public.contacts
set
  address = coalesce(address, nullif(trim(substring(notes from 'DOM:([^|\]]*)')), '')),
  email   = coalesce(email,   nullif(trim(substring(notes from 'EMAIL:([^|\]]*)')), '')),
  notes   = nullif(trim(regexp_replace(notes, '^\[META:[^\]]*\]\s*', '')), '')
where notes like '[META:%';

-- 3) Verificación (debe regresar 0 filas con META pendiente)
select count(*) as pendientes_meta from public.contacts where notes like '[META:%';
