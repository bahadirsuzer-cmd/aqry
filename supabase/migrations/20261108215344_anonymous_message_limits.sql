-- Enforce limits on future anonymous messages without scanning or modifying old rows.
create or replace function public.validate_anonymous_message_length()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  message_text text;
  message_mode text;
  configured_mode text;
  message_limit integer;
begin
  if new.metadata->>'kind' is distinct from 'anonymous_message' then return new; end if;
  if tg_op = 'UPDATE' then
    if new.metadata->>'message' is not distinct from old.metadata->>'message'
       and new.metadata->>'mode' is not distinct from old.metadata->>'mode'
       and new.experience_id is not distinct from old.experience_id
       and old.metadata->>'kind' = 'anonymous_message' then return new; end if;
  end if;
  message_mode := new.metadata->>'mode';
  if message_mode is null or message_mode not in ('question', 'confession') then
    raise exception using errcode = '23514', message = 'Invalid anonymous message mode';
  end if;
  if jsonb_typeof(new.metadata->'message') is distinct from 'string' then
    raise exception using errcode = '23514', message = 'Invalid anonymous message';
  end if;
  select content->'questionConfession'->>'mode' into configured_mode
    from public.experiences where id = new.experience_id and type = 'question_confession';
  if not found or (configured_mode in ('question','confession') and configured_mode <> message_mode) then
    raise exception using errcode = '23514', message = 'Invalid anonymous message destination';
  end if;
  message_text := new.metadata->>'message';
  message_limit := case when message_mode = 'confession' then 750 else 160 end;
  if char_length(btrim(message_text)) = 0 or char_length(message_text) > message_limit then
    raise exception using errcode = '23514', message = 'Anonymous message character limit exceeded';
  end if;
  return new;
end;
$$;
revoke all on function public.validate_anonymous_message_length() from public;
create trigger enforce_anonymous_message_length
before insert or update on public.experience_events
for each row execute function public.validate_anonymous_message_length();
