# AQRYO trafik paneli devreye alma

1. `../supabase/migrations/20260926185540_traffic_dashboard.sql` migration dosyasını **AQRYO** Supabase projesine uygula. Bebemobil veritabanına uygulama.
2. Kullanıcının doğrulanmış e-posta hesabını Supabase Auth'ta oluştur veya mevcut hesabını kullan. Yönetici şifresi tarayıcı kodunda ya da SQL dosyasında tutulmaz.
3. Yalnızca belirtilen hesabı kaydet (e-posta değerini kullanıcıdan teyit ederek değiştir):

   ```sql
   insert into aqryo_traffic_private.traffic_owner (singleton, user_id)
   select true, id from auth.users where lower(email) = lower('OWNER_EMAIL_HERE')
   on conflict (singleton) do update set user_id = excluded.user_id;
   ```

   `INSERT 0 0` sonucu hesap bulunamadığını gösterir; `select user_id from aqryo_traffic_private.traffic_owner` ile kaydı doğrula.

4. `select count(*) from public.site_page_views` ve yetkisiz çağrı için `get_traffic_dashboard` reddini doğrula. Sonra frontend'i yayımla.
5. `/traffic-login` girişinden yalnız yetkilendirilmiş hesapla paneli aç. Başka bir hesapla sorgunun 42501 hatası verdiğini test et.

Panel veri toplama açıldığı andan itibaren sayar; geçmiş Vercel trafik verilerini geriye dönük olarak içermez. Ziyaretçi sayısı tarayıcı kimliğiyle yaklaşık ölçülür. Tam URL, IP adresi ve kullanıcı aracısı saklanmaz.
