-- AQRYO production hardening: restrict creator/admin RPCs and protect completion data.

drop policy if exists "Public can create experiences" on public.experiences;
create policy "Authenticated creators can create own experiences"
on public.experiences
for insert
to authenticated
with check (creator_id = auth.uid());

drop policy if exists "Public can create completions" on public.completions;
drop policy if exists "Public can read completion statistics" on public.completions;
drop policy if exists "Public can update completions" on public.completions;

create policy "Participants can create completion for published experience"
on public.completions
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.experiences e
    where e.id = completions.experience_id
      and e.status = 'published'
  )
  and participant_key is not null
  and char_length(participant_key) between 16 and 100
);

create policy "Creators can read own experience completions"
on public.completions
for select
to authenticated
using (
  exists (
    select 1
    from public.experiences e
    where e.id = completions.experience_id
      and e.creator_id = auth.uid()
  )
);

revoke execute on function public.admin_create_site_announcement(text, text, timestamptz, timestamptz, text, text, text) from public, anon;
revoke execute on function public.admin_get_dashboard_summary() from public, anon;
revoke execute on function public.admin_get_homepage_featured_slots() from public, anon;
revoke execute on function public.admin_list_creators(integer) from public, anon;
revoke execute on function public.admin_list_experience_reports(text, integer) from public, anon;
revoke execute on function public.admin_list_experiences(integer) from public, anon;
revoke execute on function public.admin_list_orders(integer) from public, anon;
revoke execute on function public.admin_list_payouts(integer) from public, anon;
revoke execute on function public.admin_list_site_announcements() from public, anon;
revoke execute on function public.admin_pause_experience(uuid, text, uuid) from public, anon;
revoke execute on function public.admin_release_experience_moderation(uuid, text) from public, anon;
revoke execute on function public.admin_set_homepage_featured_slot(smallint, uuid) from public, anon;
revoke execute on function public.admin_set_site_announcement_active(uuid, boolean) from public, anon;
revoke execute on function public.admin_update_experience_report(uuid, text, text) from public, anon;
revoke execute on function public.is_aqryo_admin() from public, anon;
revoke execute on function public.claim_my_participant_key(text) from public, anon;
revoke execute on function public.creator_set_experience_publish_state(uuid, text) from public, anon;
revoke execute on function public.follow_creator(uuid) from public, anon;
revoke execute on function public.unfollow_creator(uuid) from public, anon;
revoke execute on function public.get_my_following() from public, anon;
revoke execute on function public.get_my_offer_purchases() from public, anon;
revoke execute on function public.get_my_sent_gifts() from public, anon;
revoke execute on function public.reserve_creator_ai_credits(integer) from public, anon;
revoke execute on function public.is_following_creator(uuid) from public, anon;
revoke execute on function public.get_my_experience_funnel(uuid) from public, anon;

grant execute on function public.admin_create_site_announcement(text, text, timestamptz, timestamptz, text, text, text) to authenticated, service_role;
grant execute on function public.admin_get_dashboard_summary() to authenticated, service_role;
grant execute on function public.admin_get_homepage_featured_slots() to authenticated, service_role;
grant execute on function public.admin_list_creators(integer) to authenticated, service_role;
grant execute on function public.admin_list_experience_reports(text, integer) to authenticated, service_role;
grant execute on function public.admin_list_experiences(integer) to authenticated, service_role;
grant execute on function public.admin_list_orders(integer) to authenticated, service_role;
grant execute on function public.admin_list_payouts(integer) to authenticated, service_role;
grant execute on function public.admin_list_site_announcements() to authenticated, service_role;
grant execute on function public.admin_pause_experience(uuid, text, uuid) to authenticated, service_role;
grant execute on function public.admin_release_experience_moderation(uuid, text) to authenticated, service_role;
grant execute on function public.admin_set_homepage_featured_slot(smallint, uuid) to authenticated, service_role;
grant execute on function public.admin_set_site_announcement_active(uuid, boolean) to authenticated, service_role;
grant execute on function public.admin_update_experience_report(uuid, text, text) to authenticated, service_role;
grant execute on function public.is_aqryo_admin() to authenticated, service_role;
grant execute on function public.claim_my_participant_key(text) to authenticated, service_role;
grant execute on function public.creator_set_experience_publish_state(uuid, text) to authenticated, service_role;
grant execute on function public.follow_creator(uuid) to authenticated, service_role;
grant execute on function public.unfollow_creator(uuid) to authenticated, service_role;
grant execute on function public.get_my_following() to authenticated, service_role;
grant execute on function public.get_my_offer_purchases() to authenticated, service_role;
grant execute on function public.get_my_sent_gifts() to authenticated, service_role;
grant execute on function public.reserve_creator_ai_credits(integer) to authenticated, service_role;
grant execute on function public.is_following_creator(uuid) to authenticated, service_role;
grant execute on function public.get_my_experience_funnel(uuid) to authenticated, service_role;
