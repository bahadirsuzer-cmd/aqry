$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "AQRYO FINAL CHECK" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$requiredFiles = @(
  "src\routes\creator-account.tsx",
  "src\routes\creator-profile.tsx",
  "src\routes\creator-purchases.tsx",
  "src\routes\creator-sent-gifts.tsx",
  "src\routes\creator-following.tsx",
  "src\routes\creator-privacy.tsx",
  "src\routes\creator-security.tsx",
  "src\routes\creator-legal.tsx",
  "src\routes\creator-delete-account.tsx",
  "src\components\experience\ResultSharePanel.tsx",
  "src\services\resultShareCards.ts",
  "src\services\creatorAccountPreferences.ts",
  "public\avatars\avatar-blue.svg",
  "public\avatars\avatar-green.svg",
  "public\avatars\avatar-mint.svg",
  "public\avatars\avatar-navy.svg",
  "public\avatars\avatar-orange.svg",
  "public\avatars\avatar-pink.svg",
  "public\avatars\avatar-sun.svg",
  "public\avatars\avatar-violet.svg"
)

$missing = @()

Write-Host ""
Write-Host "1. Dosya kontrolu" -ForegroundColor Yellow

foreach ($file in $requiredFiles) {
  if (Test-Path $file) {
    Write-Host "OK  $file" -ForegroundColor Green
  }
  else {
    Write-Host "YOK $file" -ForegroundColor Red
    $missing += $file
  }
}

if ($missing.Count -gt 0) {
  Write-Host ""
  Write-Host "Eksik dosya var. Build baslatilmadi." -ForegroundColor Red
  exit 1
}

$routeChecks = @(
  @{
    File = "src\routes\creator-account.tsx"
    Text = '"/creator-account"'
  },
  @{
    File = "src\routes\creator-profile.tsx"
    Text = '"/creator-profile"'
  },
  @{
    File = "src\routes\creator-purchases.tsx"
    Text = '"/creator-purchases"'
  },
  @{
    File = "src\routes\creator-sent-gifts.tsx"
    Text = '"/creator-sent-gifts"'
  },
  @{
    File = "src\routes\creator-following.tsx"
    Text = '"/creator-following"'
  },
  @{
    File = "src\routes\creator-privacy.tsx"
    Text = '"/creator-privacy"'
  },
  @{
    File = "src\routes\creator-security.tsx"
    Text = '"/creator-security"'
  },
  @{
    File = "src\routes\creator-legal.tsx"
    Text = '"/creator-legal"'
  },
  @{
    File = "src\routes\creator-delete-account.tsx"
    Text = '"/creator-delete-account"'
  }
)

$routeProblems = @()

Write-Host ""
Write-Host "2. Route tanim kontrolu" -ForegroundColor Yellow

foreach ($check in $routeChecks) {
  $content = Get-Content $check.File -Raw

  if ($content.Contains($check.Text)) {
    Write-Host "OK  $($check.File)" -ForegroundColor Green
  }
  else {
    Write-Host "HATA $($check.File) -> $($check.Text) bulunamadi" -ForegroundColor Red
    $routeProblems += $check.File
  }
}

if ($routeProblems.Count -gt 0) {
  Write-Host ""
  Write-Host "Route tanim hatasi var. Build baslatilmadi." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "3. Hesap merkezi link kontrolu" -ForegroundColor Yellow

$accountContent = Get-Content "src\routes\creator-account.tsx" -Raw

$accountLinks = @(
  "/creator-profile",
  "/creator-purchases",
  "/creator-sent-gifts",
  "/creator-following",
  "/creator-privacy",
  "/creator-security",
  "/creator-legal",
  "/creator-delete-account"
)

$linkProblems = @()

foreach ($link in $accountLinks) {
  if ($accountContent.Contains($link)) {
    Write-Host "OK  $link" -ForegroundColor Green
  }
  else {
    Write-Host "YOK $link" -ForegroundColor Red
    $linkProblems += $link
  }
}

if ($linkProblems.Count -gt 0) {
  Write-Host ""
  Write-Host "Hesap merkezinde eksik link var. Build baslatilmadi." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "4. Sonuc paylasim altyapisi" -ForegroundColor Yellow

$panelContent = Get-Content "src\components\experience\ResultSharePanel.tsx" -Raw
$serviceContent = Get-Content "src\services\resultShareCards.ts" -Raw

if (
  $panelContent.Contains("shareResultCard") -and
  $serviceContent.Contains("createResultShareAsset")
) {
  Write-Host "OK  Result share component/service" -ForegroundColor Green
}
else {
  Write-Host "HATA Result share component/service baglantisi eksik" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "5. routeTree.gen.ts durumu" -ForegroundColor Yellow

if (Test-Path "src\routeTree.gen.ts") {
  Write-Host "OK  src\routeTree.gen.ts mevcut" -ForegroundColor Green
}
else {
  Write-Host "UYARI src\routeTree.gen.ts su anda yok." -ForegroundColor Yellow
  Write-Host "TanStack build sirasinda yeniden uretebilir; dosyayi elle silme/olusturma." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "6. Production build" -ForegroundColor Yellow
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "BUILD BASARISIZ" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Green
Write-Host "AQRYO FINAL CHECK: TEMIZ" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green