const HOME_URL = "https://www.aqryo.com/";
const COVER_URL = "https://www.aqryo.com/aqryo-social-cover-v2.jpg";
const TITLE = "AQRYO — Create your content in 5 seconds";
const DESCRIPTION = "Create puzzles, anonymous questions and interactive stories. Share with your audience. Try AQRYO free.";

// Social crawlers do not need the React application or its streamed SSR response.
// Keep this snapshot public, anonymous and restricted to the homepage.
const HOME_CARD_HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}">
<link rel="canonical" href="${HOME_URL}">
<meta property="og:site_name" content="AQRYO">
<meta property="og:type" content="website">
<meta property="og:url" content="${HOME_URL}">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESCRIPTION}">
<meta property="og:image" content="${COVER_URL}">
<meta property="og:image:secure_url" content="${COVER_URL}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="600">
<meta property="og:image:alt" content="${TITLE}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${TITLE}">
<meta name="twitter:description" content="${DESCRIPTION}">
<meta name="twitter:image" content="${COVER_URL}">
<meta name="twitter:image:alt" content="${TITLE}">
</head><body>
<h1>Create your content in 5 seconds</h1>
<img src="${COVER_URL}" width="1200" height="600" alt="${TITLE}">
<p>${DESCRIPTION}</p>
<nav>
<a href="/question-confession-builder">Question or Confession?</a>
<a href="/puzzle-builder">Puzzle</a>
<a href="/compatibility-builder">Match Meter</a>
<a href="/story-builder">Flow</a>
</nav>
</body></html>`;

export function homepageSocialPreview(request: Request): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  if (new URL(request.url).pathname !== "/") return null;
  if (!/\bTwitterbot\b/i.test(request.headers.get("user-agent") ?? "")) return null;

  return new Response(request.method === "HEAD" ? null : HOME_CARD_HTML, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      "vary": "User-Agent",
      "x-aqryo-social-preview": "static-home-v1",
    },
  });
}
