import { useEffect, useState } from "react";

export const AQRYO_LANGUAGES = [
  ["tr", "Türkçe"],
  ["en", "English"],
  ["es", "Español"],
  ["pt", "Português"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["it", "Italiano"],
  ["ar", "العربية"],
  ["hi", "हिन्दी"],
  ["id", "Bahasa Indonesia"],
  ["ru", "Русский"],
  ["bn", "বাংলা"],
  ["ur", "اردو"],
  ["vi", "Tiếng Việt"],
  ["fil", "Filipino"],
] as const;

export type AqryoLocale = (typeof AQRYO_LANGUAGES)[number][0];

const STORAGE_KEY = "aqryo-locale";

const TRANSLATIONS: Record<AqryoLocale, Record<string, string>> = {
  tr: {
    studio: "Studio",
    inbox: "Gelen",
    experiences: "Experience",
    earnings: "Kazanç",
    payments: "Ödeme",
    account: "Hesap",
    signOut: "Çıkış",
    newExperience: "Yeni Experience",
    studioEyebrow: "AQRYO Studio",
    studioTitle: "5 saniyede viral içerik üret.",
    studioDescription: "Bir format seç, içeriğini üret ve kitlenle paylaş.",
    questionConfession: "Soru mu İtiraf mı?",
    questionConfessionDesc: "Anonim link oluştur. Takipçin sana yazsın, seçtiklerini X’te cevapla.",
    loveMeter: "Aşk Metre",
    loveMeterDesc: "Kendi cevaplarını tanımla. Takipçin cevaplasın, uyumunuzu görsün.",
    story: "Flood / Hikaye",
    storyDesc: "Metnini ve kendi görsellerini ekle. Hikayeni kart kart anlat.",
    puzzle: "Puzzle",
    puzzleDesc: "Saniyeler içinde dikkat çeken sosyal puzzle üret.",
    create: "Oluştur",
    freeSvg: "SVG ücretsiz",
    ownImage: "Kendi görselini yükle",
    ready: "Hazır",
    puzzleEngine: "Sosyal puzzle motoru",
    backToStudio: "Studio’ya dön",
    questionType: "Soru türü",
    presentation: "Sunum",
    newQuestion: "Yeni soru üret",
    cta: "CTA",
    share: "Paylaş",
    copyText: "Metni kopyala",
    downloadSvg: "SVG indir",
    correctAnswer: "Doğru cevap",
    commonWrong: "Yaygın yanlış cevap",
    shareVisual: "Paylaşılacak görsel",
    math: "İşlem önceliği",
    geometry: "Geometri",
    count: "Kaç tane var?",
    algebra: "Mini cebir",
    area: "Alan / uzunluk",
    clean: "Sadece soru",
    debate: "Kim haklı?",
    language: "Dil",
    viralInFive: "5 saniyede viral içerik üret.",
  },
  en: {
    studio: "Studio", inbox: "Inbox", experiences: "Experiences", earnings: "Earnings", payments: "Payments", account: "Account", signOut: "Sign out", newExperience: "New Experience",
    studioEyebrow: "AQRYO Studio", studioTitle: "Create viral content in 5 seconds.", studioDescription: "Pick a format, generate your content and share it with your audience.",
    questionConfession: "Question or Confession?", questionConfessionDesc: "Create an anonymous link. Let followers write to you and answer selected messages on X.",
    loveMeter: "Love Meter", loveMeterDesc: "Set your answers. Let followers respond and see your compatibility.",
    story: "Flood / Story", storyDesc: "Add your text and images. Tell your story card by card.",
    puzzle: "Puzzle", puzzleDesc: "Generate scroll-stopping social puzzles in seconds.", create: "Create", freeSvg: "Free SVG", ownImage: "Upload your image", ready: "Ready",
    puzzleEngine: "Social puzzle engine", backToStudio: "Back to Studio", questionType: "Question type", presentation: "Presentation", newQuestion: "Generate new question", cta: "CTA",
    share: "Share", copyText: "Copy text", downloadSvg: "Download SVG", correctAnswer: "Correct answer", commonWrong: "Common wrong answer", shareVisual: "Share visual",
    math: "Order of operations", geometry: "Geometry", count: "How many?", algebra: "Mini algebra", area: "Area / length", clean: "Question only", debate: "Who is right?", language: "Language", viralInFive: "Create viral content in 5 seconds.",
  },
  es: {
    studio:"Studio", inbox:"Bandeja", experiences:"Experiencias", earnings:"Ingresos", payments:"Pagos", account:"Cuenta", signOut:"Salir", newExperience:"Nueva experiencia",
    studioEyebrow:"AQRYO Studio", studioTitle:"Crea contenido viral en 5 segundos.", studioDescription:"Elige un formato, genera tu contenido y compártelo con tu audiencia.",
    questionConfession:"¿Pregunta o confesión?", questionConfessionDesc:"Crea un enlace anónimo. Deja que tus seguidores te escriban y responde en X.",
    loveMeter:"Medidor de amor", loveMeterDesc:"Define tus respuestas y descubre la compatibilidad con tus seguidores.", story:"Hilo / Historia", storyDesc:"Añade texto e imágenes y cuenta tu historia tarjeta a tarjeta.",
    puzzle:"Puzzle", puzzleDesc:"Crea puzzles sociales que detienen el scroll en segundos.", create:"Crear", freeSvg:"SVG gratis", ownImage:"Sube tu imagen", ready:"Listo",
    puzzleEngine:"Motor de puzzles sociales", backToStudio:"Volver al Studio", questionType:"Tipo de pregunta", presentation:"Presentación", newQuestion:"Generar nueva pregunta", cta:"CTA",
    share:"Compartir", copyText:"Copiar texto", downloadSvg:"Descargar SVG", correctAnswer:"Respuesta correcta", commonWrong:"Error común", shareVisual:"Visual para compartir",
    math:"Orden de operaciones", geometry:"Geometría", count:"¿Cuántos?", algebra:"Mini álgebra", area:"Área / longitud", clean:"Solo pregunta", debate:"¿Quién tiene razón?", language:"Idioma", viralInFive:"Crea contenido viral en 5 segundos.",
  },
  pt: {
    studio:"Studio", inbox:"Caixa", experiences:"Experiências", earnings:"Ganhos", payments:"Pagamentos", account:"Conta", signOut:"Sair", newExperience:"Nova experiência",
    studioEyebrow:"AQRYO Studio", studioTitle:"Crie conteúdo viral em 5 segundos.", studioDescription:"Escolha um formato, gere seu conteúdo e compartilhe com sua audiência.",
    questionConfession:"Pergunta ou confissão?", questionConfessionDesc:"Crie um link anônimo. Seus seguidores escrevem e você responde no X.",
    loveMeter:"Medidor do amor", loveMeterDesc:"Defina suas respostas e veja a compatibilidade com seus seguidores.", story:"Thread / História", storyDesc:"Adicione texto e imagens e conte sua história em cartões.",
    puzzle:"Puzzle", puzzleDesc:"Crie puzzles sociais chamativos em segundos.", create:"Criar", freeSvg:"SVG grátis", ownImage:"Envie sua imagem", ready:"Pronto",
    puzzleEngine:"Motor de puzzles sociais", backToStudio:"Voltar ao Studio", questionType:"Tipo de pergunta", presentation:"Apresentação", newQuestion:"Gerar nova pergunta", cta:"CTA",
    share:"Compartilhar", copyText:"Copiar texto", downloadSvg:"Baixar SVG", correctAnswer:"Resposta correta", commonWrong:"Erro comum", shareVisual:"Visual para compartilhar",
    math:"Ordem das operações", geometry:"Geometria", count:"Quantos?", algebra:"Mini álgebra", area:"Área / comprimento", clean:"Só pergunta", debate:"Quem está certo?", language:"Idioma", viralInFive:"Crie conteúdo viral em 5 segundos.",
  },
  fr: {
    studio:"Studio", inbox:"Reçus", experiences:"Expériences", earnings:"Gains", payments:"Paiements", account:"Compte", signOut:"Quitter", newExperience:"Nouvelle expérience",
    studioEyebrow:"AQRYO Studio", studioTitle:"Crée du contenu viral en 5 secondes.", studioDescription:"Choisis un format, génère ton contenu et partage-le avec ton audience.",
    questionConfession:"Question ou confession ?", questionConfessionDesc:"Crée un lien anonyme. Tes abonnés écrivent et tu réponds sur X.",
    loveMeter:"Love Meter", loveMeterDesc:"Définis tes réponses et mesure ta compatibilité avec tes abonnés.", story:"Thread / Histoire", storyDesc:"Ajoute du texte et des images, raconte ton histoire carte par carte.",
    puzzle:"Puzzle", puzzleDesc:"Crée des puzzles sociaux qui arrêtent le scroll en quelques secondes.", create:"Créer", freeSvg:"SVG gratuit", ownImage:"Importer ton image", ready:"Prêt",
    puzzleEngine:"Moteur de puzzles sociaux", backToStudio:"Retour au Studio", questionType:"Type de question", presentation:"Présentation", newQuestion:"Nouvelle question", cta:"CTA",
    share:"Partager", copyText:"Copier le texte", downloadSvg:"Télécharger SVG", correctAnswer:"Bonne réponse", commonWrong:"Erreur fréquente", shareVisual:"Visuel à partager",
    math:"Priorité des opérations", geometry:"Géométrie", count:"Combien ?", algebra:"Mini algèbre", area:"Aire / longueur", clean:"Question seule", debate:"Qui a raison ?", language:"Langue", viralInFive:"Crée du contenu viral en 5 secondes.",
  },
  de: {
    studio:"Studio", inbox:"Eingang", experiences:"Experiences", earnings:"Einnahmen", payments:"Zahlungen", account:"Konto", signOut:"Abmelden", newExperience:"Neue Experience",
    studioEyebrow:"AQRYO Studio", studioTitle:"Erstelle virale Inhalte in 5 Sekunden.", studioDescription:"Format wählen, Inhalt erzeugen und mit deiner Community teilen.",
    questionConfession:"Frage oder Geständnis?", questionConfessionDesc:"Erstelle einen anonymen Link. Follower schreiben dir, du antwortest auf X.",
    loveMeter:"Love Meter", loveMeterDesc:"Lege deine Antworten fest und prüfe eure Übereinstimmung.", story:"Thread / Story", storyDesc:"Füge Text und Bilder hinzu und erzähle deine Story Karte für Karte.",
    puzzle:"Puzzle", puzzleDesc:"Erstelle in Sekunden auffällige Social-Puzzles.", create:"Erstellen", freeSvg:"SVG kostenlos", ownImage:"Eigenes Bild hochladen", ready:"Bereit",
    puzzleEngine:"Social-Puzzle-Engine", backToStudio:"Zurück zum Studio", questionType:"Fragetyp", presentation:"Darstellung", newQuestion:"Neue Frage erzeugen", cta:"CTA",
    share:"Teilen", copyText:"Text kopieren", downloadSvg:"SVG laden", correctAnswer:"Richtige Antwort", commonWrong:"Häufige falsche Antwort", shareVisual:"Teilbares Visual",
    math:"Punkt-vor-Strich", geometry:"Geometrie", count:"Wie viele?", algebra:"Mini-Algebra", area:"Fläche / Länge", clean:"Nur Frage", debate:"Wer hat recht?", language:"Sprache", viralInFive:"Erstelle virale Inhalte in 5 Sekunden.",
  },
  it: {
    studio:"Studio", inbox:"Ricevuti", experiences:"Esperienze", earnings:"Guadagni", payments:"Pagamenti", account:"Account", signOut:"Esci", newExperience:"Nuova esperienza",
    studioEyebrow:"AQRYO Studio", studioTitle:"Crea contenuti virali in 5 secondi.", studioDescription:"Scegli un formato, genera il contenuto e condividilo con il tuo pubblico.",
    questionConfession:"Domanda o confessione?", questionConfessionDesc:"Crea un link anonimo. I follower scrivono e tu rispondi su X.",
    loveMeter:"Love Meter", loveMeterDesc:"Imposta le tue risposte e scopri la compatibilità.", story:"Thread / Storia", storyDesc:"Aggiungi testo e immagini e racconta la tua storia carta per carta.",
    puzzle:"Puzzle", puzzleDesc:"Genera puzzle social che fermano lo scroll in pochi secondi.", create:"Crea", freeSvg:"SVG gratis", ownImage:"Carica immagine", ready:"Pronto",
    puzzleEngine:"Motore puzzle social", backToStudio:"Torna allo Studio", questionType:"Tipo di domanda", presentation:"Presentazione", newQuestion:"Genera nuova domanda", cta:"CTA",
    share:"Condividi", copyText:"Copia testo", downloadSvg:"Scarica SVG", correctAnswer:"Risposta corretta", commonWrong:"Errore comune", shareVisual:"Visual da condividere",
    math:"Ordine delle operazioni", geometry:"Geometria", count:"Quanti?", algebra:"Mini algebra", area:"Area / lunghezza", clean:"Solo domanda", debate:"Chi ha ragione?", language:"Lingua", viralInFive:"Crea contenuti virali in 5 secondi.",
  },
  ar: {
    studio:"الاستوديو", inbox:"الوارد", experiences:"التجارب", earnings:"الأرباح", payments:"المدفوعات", account:"الحساب", signOut:"خروج", newExperience:"تجربة جديدة",
    studioEyebrow:"AQRYO Studio", studioTitle:"أنشئ محتوى قابلًا للانتشار خلال 5 ثوانٍ.", studioDescription:"اختر قالبًا، أنشئ المحتوى وشاركه مع جمهورك.",
    questionConfession:"سؤال أم اعتراف؟", questionConfessionDesc:"أنشئ رابطًا مجهولًا. دع متابعيك يكتبون لك وأجب على X.",
    loveMeter:"مقياس الحب", loveMeterDesc:"حدد إجاباتك واكتشف نسبة التوافق.", story:"سرد / قصة", storyDesc:"أضف النصوص والصور واحك قصتك بطاقة بعد بطاقة.",
    puzzle:"لغز", puzzleDesc:"أنشئ ألغازًا اجتماعية جذابة خلال ثوانٍ.", create:"إنشاء", freeSvg:"SVG مجاني", ownImage:"ارفع صورتك", ready:"جاهز",
    puzzleEngine:"محرك الألغاز الاجتماعية", backToStudio:"العودة للاستوديو", questionType:"نوع السؤال", presentation:"العرض", newQuestion:"سؤال جديد", cta:"CTA",
    share:"مشاركة", copyText:"نسخ النص", downloadSvg:"تنزيل SVG", correctAnswer:"الإجابة الصحيحة", commonWrong:"خطأ شائع", shareVisual:"الصورة القابلة للمشاركة",
    math:"ترتيب العمليات", geometry:"هندسة", count:"كم عددها؟", algebra:"جبر مصغر", area:"مساحة / طول", clean:"السؤال فقط", debate:"من الصحيح؟", language:"اللغة", viralInFive:"أنشئ محتوى قابلًا للانتشار خلال 5 ثوانٍ.",
  },
  hi: {
    studio:"स्टूडियो", inbox:"इनबॉक्स", experiences:"एक्सपीरियंस", earnings:"कमाई", payments:"भुगतान", account:"खाता", signOut:"लॉग आउट", newExperience:"नया एक्सपीरियंस",
    studioEyebrow:"AQRYO Studio", studioTitle:"5 सेकंड में वायरल कंटेंट बनाएं।", studioDescription:"फ़ॉर्मेट चुनें, कंटेंट बनाएं और अपनी ऑडियंस के साथ शेयर करें।",
    questionConfession:"सवाल या इकरार?", questionConfessionDesc:"अनाम लिंक बनाएं। फॉलोअर्स लिखें और चुने हुए संदेशों का X पर जवाब दें।",
    loveMeter:"लव मीटर", loveMeterDesc:"अपने जवाब तय करें और कम्पैटिबिलिटी देखें।", story:"थ्रेड / कहानी", storyDesc:"टेक्स्ट और इमेज जोड़ें और कार्ड-दर-कार्ड कहानी सुनाएं।",
    puzzle:"पज़ल", puzzleDesc:"कुछ सेकंड में ध्यान खींचने वाले सोशल पज़ल बनाएं।", create:"बनाएं", freeSvg:"मुफ़्त SVG", ownImage:"अपनी इमेज अपलोड करें", ready:"तैयार",
    puzzleEngine:"सोशल पज़ल इंजन", backToStudio:"स्टूडियो पर लौटें", questionType:"सवाल का प्रकार", presentation:"प्रस्तुति", newQuestion:"नया सवाल बनाएं", cta:"CTA",
    share:"शेयर", copyText:"टेक्स्ट कॉपी", downloadSvg:"SVG डाउनलोड", correctAnswer:"सही जवाब", commonWrong:"आम गलत जवाब", shareVisual:"शेयर करने वाला विजुअल",
    math:"ऑपरेशन क्रम", geometry:"ज्यामिति", count:"कितने?", algebra:"मिनी बीजगणित", area:"क्षेत्रफल / लंबाई", clean:"सिर्फ सवाल", debate:"कौन सही है?", language:"भाषा", viralInFive:"5 सेकंड में वायरल कंटेंट बनाएं।",
  },
  id: {
    studio:"Studio", inbox:"Masuk", experiences:"Experience", earnings:"Pendapatan", payments:"Pembayaran", account:"Akun", signOut:"Keluar", newExperience:"Experience Baru",
    studioEyebrow:"AQRYO Studio", studioTitle:"Buat konten viral dalam 5 detik.", studioDescription:"Pilih format, buat konten, lalu bagikan ke audiensmu.",
    questionConfession:"Pertanyaan atau pengakuan?", questionConfessionDesc:"Buat tautan anonim. Pengikut menulis dan kamu menjawab di X.",
    loveMeter:"Love Meter", loveMeterDesc:"Tentukan jawabanmu dan lihat kecocokan.", story:"Thread / Cerita", storyDesc:"Tambahkan teks dan gambar lalu ceritakan kartu demi kartu.",
    puzzle:"Puzzle", puzzleDesc:"Buat puzzle sosial yang menarik perhatian dalam hitungan detik.", create:"Buat", freeSvg:"SVG gratis", ownImage:"Unggah gambar", ready:"Siap",
    puzzleEngine:"Mesin puzzle sosial", backToStudio:"Kembali ke Studio", questionType:"Jenis pertanyaan", presentation:"Tampilan", newQuestion:"Buat pertanyaan baru", cta:"CTA",
    share:"Bagikan", copyText:"Salin teks", downloadSvg:"Unduh SVG", correctAnswer:"Jawaban benar", commonWrong:"Jawaban salah umum", shareVisual:"Visual untuk dibagikan",
    math:"Urutan operasi", geometry:"Geometri", count:"Berapa banyak?", algebra:"Aljabar mini", area:"Luas / panjang", clean:"Hanya pertanyaan", debate:"Siapa yang benar?", language:"Bahasa", viralInFive:"Buat konten viral dalam 5 detik.",
  },
  ru: {
    studio:"Студия", inbox:"Входящие", experiences:"Experience", earnings:"Доход", payments:"Платежи", account:"Аккаунт", signOut:"Выйти", newExperience:"Новый Experience",
    studioEyebrow:"AQRYO Studio", studioTitle:"Создай вирусный контент за 5 секунд.", studioDescription:"Выбери формат, создай контент и поделись с аудиторией.",
    questionConfession:"Вопрос или признание?", questionConfessionDesc:"Создай анонимную ссылку. Подписчики пишут, ты отвечаешь в X.",
    loveMeter:"Love Meter", loveMeterDesc:"Задай ответы и узнай совместимость.", story:"Тред / История", storyDesc:"Добавляй текст и изображения и рассказывай историю карточками.",
    puzzle:"Головоломка", puzzleDesc:"Создавай цепляющие социальные головоломки за секунды.", create:"Создать", freeSvg:"SVG бесплатно", ownImage:"Загрузить изображение", ready:"Готово",
    puzzleEngine:"Движок социальных головоломок", backToStudio:"Назад в Студию", questionType:"Тип вопроса", presentation:"Подача", newQuestion:"Новый вопрос", cta:"CTA",
    share:"Поделиться", copyText:"Копировать текст", downloadSvg:"Скачать SVG", correctAnswer:"Правильный ответ", commonWrong:"Типичная ошибка", shareVisual:"Визуал для публикации",
    math:"Порядок действий", geometry:"Геометрия", count:"Сколько?", algebra:"Мини-алгебра", area:"Площадь / длина", clean:"Только вопрос", debate:"Кто прав?", language:"Язык", viralInFive:"Создай вирусный контент за 5 секунд.",
  },
  bn: {
    studio:"স্টুডিও", inbox:"ইনবক্স", experiences:"এক্সপেরিয়েন্স", earnings:"আয়", payments:"পেমেন্ট", account:"অ্যাকাউন্ট", signOut:"লগ আউট", newExperience:"নতুন এক্সপেরিয়েন্স",
    studioEyebrow:"AQRYO Studio", studioTitle:"৫ সেকেন্ডে ভাইরাল কনটেন্ট তৈরি করুন।", studioDescription:"ফরম্যাট বেছে নিন, কনটেন্ট বানান এবং অডিয়েন্সের সাথে শেয়ার করুন।",
    questionConfession:"প্রশ্ন না স্বীকারোক্তি?", questionConfessionDesc:"অ্যানোনিমাস লিঙ্ক তৈরি করুন। ফলোয়াররা লিখবে, আপনি X-এ উত্তর দেবেন।",
    loveMeter:"লাভ মিটার", loveMeterDesc:"নিজের উত্তর সেট করুন এবং মিল দেখুন।", story:"থ্রেড / গল্প", storyDesc:"টেক্সট ও ছবি যোগ করে কার্ডে কার্ডে গল্প বলুন।",
    puzzle:"পাজল", puzzleDesc:"কয়েক সেকেন্ডে নজরকাড়া সোশ্যাল পাজল তৈরি করুন।", create:"তৈরি করুন", freeSvg:"ফ্রি SVG", ownImage:"নিজের ছবি আপলোড", ready:"প্রস্তুত",
    puzzleEngine:"সোশ্যাল পাজল ইঞ্জিন", backToStudio:"স্টুডিওতে ফিরুন", questionType:"প্রশ্নের ধরন", presentation:"উপস্থাপন", newQuestion:"নতুন প্রশ্ন", cta:"CTA",
    share:"শেয়ার", copyText:"টেক্সট কপি", downloadSvg:"SVG ডাউনলোড", correctAnswer:"সঠিক উত্তর", commonWrong:"সাধারণ ভুল উত্তর", shareVisual:"শেয়ার ভিজ্যুয়াল",
    math:"অপারেশন অর্ডার", geometry:"জ্যামিতি", count:"কতগুলো?", algebra:"মিনি বীজগণিত", area:"ক্ষেত্রফল / দৈর্ঘ্য", clean:"শুধু প্রশ্ন", debate:"কে ঠিক?", language:"ভাষা", viralInFive:"৫ সেকেন্ডে ভাইরাল কনটেন্ট তৈরি করুন।",
  },
  ur: {
    studio:"اسٹوڈیو", inbox:"ان باکس", experiences:"ایکسپیرینس", earnings:"آمدنی", payments:"ادائیگی", account:"اکاؤنٹ", signOut:"لاگ آؤٹ", newExperience:"نیا ایکسپیرینس",
    studioEyebrow:"AQRYO Studio", studioTitle:"5 سیکنڈ میں وائرل کنٹینٹ بنائیں۔", studioDescription:"فارمیٹ منتخب کریں، کنٹینٹ بنائیں اور اپنی آڈیئنس کے ساتھ شیئر کریں۔",
    questionConfession:"سوال یا اعتراف؟", questionConfessionDesc:"گمنام لنک بنائیں۔ فالوورز لکھیں اور آپ X پر جواب دیں۔",
    loveMeter:"لو میٹر", loveMeterDesc:"اپنے جواب طے کریں اور مطابقت دیکھیں۔", story:"تھریڈ / کہانی", storyDesc:"متن اور تصاویر شامل کریں اور کارڈ بہ کارڈ کہانی سنائیں۔",
    puzzle:"پزل", puzzleDesc:"چند سیکنڈ میں توجہ کھینچنے والے سوشل پزل بنائیں۔", create:"بنائیں", freeSvg:"مفت SVG", ownImage:"اپنی تصویر اپلوڈ کریں", ready:"تیار",
    puzzleEngine:"سوشل پزل انجن", backToStudio:"اسٹوڈیو واپس", questionType:"سوال کی قسم", presentation:"پریزنٹیشن", newQuestion:"نیا سوال", cta:"CTA",
    share:"شیئر", copyText:"متن کاپی", downloadSvg:"SVG ڈاؤنلوڈ", correctAnswer:"درست جواب", commonWrong:"عام غلط جواب", shareVisual:"شیئر ویژول",
    math:"آپریشن کی ترتیب", geometry:"جیومیٹری", count:"کتنے؟", algebra:"منی الجبرا", area:"رقبہ / لمبائی", clean:"صرف سوال", debate:"کون درست؟", language:"زبان", viralInFive:"5 سیکنڈ میں وائرل کنٹینٹ بنائیں۔",
  },
  vi: {
    studio:"Studio", inbox:"Hộp thư", experiences:"Experience", earnings:"Thu nhập", payments:"Thanh toán", account:"Tài khoản", signOut:"Đăng xuất", newExperience:"Experience mới",
    studioEyebrow:"AQRYO Studio", studioTitle:"Tạo nội dung viral trong 5 giây.", studioDescription:"Chọn định dạng, tạo nội dung và chia sẻ với khán giả.",
    questionConfession:"Câu hỏi hay thú nhận?", questionConfessionDesc:"Tạo liên kết ẩn danh. Người theo dõi viết và bạn trả lời trên X.",
    loveMeter:"Love Meter", loveMeterDesc:"Đặt câu trả lời và xem độ hợp nhau.", story:"Thread / Câu chuyện", storyDesc:"Thêm chữ và ảnh, kể câu chuyện từng thẻ.",
    puzzle:"Puzzle", puzzleDesc:"Tạo puzzle mạng xã hội thu hút trong vài giây.", create:"Tạo", freeSvg:"SVG miễn phí", ownImage:"Tải ảnh lên", ready:"Sẵn sàng",
    puzzleEngine:"Công cụ puzzle xã hội", backToStudio:"Về Studio", questionType:"Loại câu hỏi", presentation:"Cách trình bày", newQuestion:"Tạo câu hỏi mới", cta:"CTA",
    share:"Chia sẻ", copyText:"Sao chép", downloadSvg:"Tải SVG", correctAnswer:"Đáp án đúng", commonWrong:"Đáp án sai phổ biến", shareVisual:"Hình để chia sẻ",
    math:"Thứ tự phép tính", geometry:"Hình học", count:"Có bao nhiêu?", algebra:"Đại số mini", area:"Diện tích / độ dài", clean:"Chỉ câu hỏi", debate:"Ai đúng?", language:"Ngôn ngữ", viralInFive:"Tạo nội dung viral trong 5 giây.",
  },
  fil: {
    studio:"Studio", inbox:"Inbox", experiences:"Experiences", earnings:"Kita", payments:"Bayad", account:"Account", signOut:"Mag-sign out", newExperience:"Bagong Experience",
    studioEyebrow:"AQRYO Studio", studioTitle:"Gumawa ng viral content sa loob ng 5 segundo.", studioDescription:"Pumili ng format, gumawa ng content at ibahagi sa audience mo.",
    questionConfession:"Tanong o pag-amin?", questionConfessionDesc:"Gumawa ng anonymous link. Susulat ang followers at sasagot ka sa X.",
    loveMeter:"Love Meter", loveMeterDesc:"Itakda ang sagot mo at tingnan ang compatibility.", story:"Thread / Kuwento", storyDesc:"Magdagdag ng text at images at ikuwento nang card-by-card.",
    puzzle:"Puzzle", puzzleDesc:"Gumawa ng social puzzles na nakakahinto ng scroll sa ilang segundo.", create:"Gumawa", freeSvg:"Libreng SVG", ownImage:"I-upload ang image", ready:"Handa",
    puzzleEngine:"Social puzzle engine", backToStudio:"Bumalik sa Studio", questionType:"Uri ng tanong", presentation:"Presentation", newQuestion:"Bagong tanong", cta:"CTA",
    share:"I-share", copyText:"Kopyahin ang text", downloadSvg:"I-download SVG", correctAnswer:"Tamang sagot", commonWrong:"Karaniwang maling sagot", shareVisual:"Visual para i-share",
    math:"Order of operations", geometry:"Geometry", count:"Ilan?", algebra:"Mini algebra", area:"Area / haba", clean:"Tanong lang", debate:"Sino ang tama?", language:"Wika", viralInFive:"Gumawa ng viral content sa loob ng 5 segundo.",
  },
};

function normalizeLocale(input?: string | null): AqryoLocale {
  const short = (input ?? "").toLowerCase().split("-")[0];
  return AQRYO_LANGUAGES.some(([code]) => code === short)
    ? (short as AqryoLocale)
    : "en";
}

export function detectLocale(): AqryoLocale {
  if (typeof window === "undefined") return "tr";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) return normalizeLocale(stored);
  return normalizeLocale(window.navigator.language || window.navigator.languages?.[0]);
}

export function translate(locale: AqryoLocale, key: string) {
  return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS.en[key] ?? key;
}

export function useAqryoLocale() {
  const [locale, setLocaleState] = useState<AqryoLocale>(() => detectLocale());

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" || locale === "ur" ? "rtl" : "ltr";
    }
  }, [locale]);

  function setLocale(next: AqryoLocale) {
    window.localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
    window.dispatchEvent(new CustomEvent("aqryo:locale", { detail: next }));
  }

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setLocaleState(normalizeLocale(detail));
    };
    window.addEventListener("aqryo:locale", handler);
    return () => window.removeEventListener("aqryo:locale", handler);
  }, []);

  return {
    locale,
    setLocale,
    t: (key: string) => translate(locale, key),
  };
}
