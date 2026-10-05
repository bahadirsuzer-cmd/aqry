-- Original pack assets are only issued as short-lived signed URLs.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('visual-packs','visual-packs',false,10485760,array['image/png','image/webp'])
on conflict(id) do nothing;
