import assert from 'node:assert/strict';
import { createServer } from 'vite';
// No real credentials or account writes are needed for public SSR checks.
process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'ssr-test-key';
const locales = ['tr','en','es','pt','fr','de','it','ar','hi','id','ru','bn','ur','vi','fil'];
const paths = ['/','/creator-auth','/creator-reset-password','/pricing','/how-it-works','/about','/contact','/privacy','/terms','/delivery-refund','/distance-sales','/payment-terms','/cookies','/creator-terms'];
const vite = await createServer({ server: { host: '127.0.0.1', port: 5187, strictPort: true } });
try {
 await vite.listen();let count=0;
 for(const lang of locales) {
  for(const path of paths) {
   const response=await fetch(`http://127.0.0.1:5187${path}?lang=${lang}`);
   const html=await response.text();
   assert.equal(response.status,200,`${lang} ${path}: HTTP error`);
   assert.match(html,new RegExp(`<html[^>]*lang="${lang}"`),`${lang} ${path}: wrong SSR language`);
   assert.match(html,new RegExp(`<html[^>]*dir="${['ar','ur'].includes(lang)?'rtl':'ltr'}"`),`${lang} ${path}: wrong direction`);
   assert.ok(!html.includes('Bu sayfa yüklenemedi'),`${lang} ${path}: error boundary`);
   if(lang!=='tr' && path==='/creator-auth') assert.ok(!html.includes('Tekrar hoş geldin'),`${lang}: Turkish login`);
   if(path==='/') { assert.ok(html.includes('id="how-it-works"'),`${lang}: missing navigation target`); assert.ok(html.includes(`href="/?lang=${lang}#how-it-works"`),`${lang}: anchor loses language`); }
   if(path==='/pricing') assert.ok(!html.includes('10 Single'),`${lang}: English pack labels`);
   count++;
  }
 }
 const sitemapResponse=await fetch('http://127.0.0.1:5187/sitemap.xml');
 assert.equal(sitemapResponse.status,200);
 const sitemap=await sitemapResponse.text();
 const sitemapUrls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
 assert.ok(sitemapUrls.length>=16, 'Static sitemap must not shadow the route');
 for(const url of sitemapUrls) assert.equal(new URL(url).origin,'https://www.aqryo.com');
 for(const lang of locales) assert.ok(sitemapUrls.includes('https://www.aqryo.com/?lang='+lang), 'Missing sitemap locale '+lang);
 console.log('PASS: production sitemap URLs and all 15 language entries.');
 console.log(`PASS: ${count} public SSR responses across all 15 languages, including auth, password recovery, metadata direction and navigation.`);
} finally { await vite.close(); }
