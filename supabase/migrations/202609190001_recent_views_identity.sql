delete from public.recent_views newer
using public.recent_views older
where newer.user_id = older.user_id
  and newer.entity_type = older.entity_type
  and newer.entity_identifier = older.entity_identifier
  and newer.viewed_at < older.viewed_at;

create unique index if not exists recent_views_entity_idx
  on public.recent_views(user_id, entity_type, entity_identifier);
