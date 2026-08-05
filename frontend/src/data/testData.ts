import type { Answer, Creator, Question, Test } from "@/types";

const aqryOriginals: Creator = {
  id: "creator_aqry_originals",
  name: "AQRY Originals",
  username: "aqryoriginals",
  avatar: "https://api.dicebear.com/9.x/initials/svg?seed=AQ&backgroundColor=7c3aed",
  verified: true,
};

type ShortScores = [number, number, number, number];

function makeQuestion(
  id: string,
  order: number,
  text: string,
  keys: [string, string, string, string],
  answers: Array<{ id: string; text: string; scores: ShortScores }>,
): Question {
  const mapped: Answer[] = answers.map((answer) => ({
    id: answer.id,
    text: answer.text,
    scores: {
      [keys[0]]: answer.scores[0],
      [keys[1]]: answer.scores[1],
      [keys[2]]: answer.scores[2],
      [keys[3]]: answer.scores[3],
    },
  }));
  return { id, order, text, answers: mapped };
}

const dhKeys: [string, string, string, string] = ["bree", "gabrielle", "lynette", "susan"];

const desperateHousewives: Test = {
  category: "QUIZ",
  id: "test_desperate_housewives",
  slug: "desperate-housewives",
  title: "10 Soruda Ne Kadar Desperate Housewives'sın?",
  subtitle: "Wisteria Lane'de yaşasaydın hangi karakter olurdun?",
  description:
    "Mükemmeliyetçi Bree, göz kamaştıran Gabrielle, her şeyi sırtlanan Lynette ve kaosun kalbindeki Susan. On soruda Wisteria Lane'deki gerçek yerini bul.",
  creator: aqryOriginals,
  estimatedDuration: "2 dakika",
  totalParticipants: 48213,
  price: 9.9,
  currency: "TL",
  status: "active",
  questions: [
    makeQuestion("dh_q1", 1, "Sabah 07.00. Uyandın. İlk hareketin ne olur?", dhKeys, [
      { id: "dh_q1_a1", text: "Yatağı hastane köşesiyle toplarım, kahve çoktan hazırdır.", scores: [3, 0, 1, 0] },
      { id: "dh_q1_a2", text: "Önce aynaya bakarım, gün ancak ondan sonra başlayabilir.", scores: [0, 3, 0, 1] },
      { id: "dh_q1_a3", text: "Üç kişiye aynı anda bağırarak günü açarım.", scores: [0, 0, 3, 1] },
      { id: "dh_q1_a4", text: "Alarmı üç kez erteleyip sonra panikle fırlarım.", scores: [0, 1, 0, 3] },
    ]),
    makeQuestion("dh_q2", 2, "Komşun kapına beklenmedik bir anda geldi. Tepkin?", dhKeys, [
      { id: "dh_q2_a1", text: "Kapıda karşılarım ama içeride hiçbir şey dağınık kalmaz.", scores: [3, 1, 0, 0] },
      { id: "dh_q2_a2", text: "Kıyafetimi değiştirmeden kapıyı açmam.", scores: [1, 3, 0, 0] },
      { id: "dh_q2_a3", text: "Elimde çamaşır sepetiyle açarım, idare etsin.", scores: [0, 0, 3, 1] },
      { id: "dh_q2_a4", text: "Bir şeye takılıp düşerek kapıyı açarım.", scores: [0, 0, 1, 3] },
    ]),
    makeQuestion("dh_q3", 3, "Mahallede yeni bir dedikodu dolaşıyor. Sen ne yaparsın?", dhKeys, [
      { id: "dh_q3_a1", text: "Dinlerim ama yorum yapmam. Bilgi güçtür.", scores: [3, 1, 0, 0] },
      { id: "dh_q3_a2", text: "Dedikodunun merkezinde zaten ben varımdır.", scores: [0, 3, 0, 1] },
      { id: "dh_q3_a3", text: "Vaktim yok, ama can kulağıyla dinlerim.", scores: [1, 0, 3, 0] },
      { id: "dh_q3_a4", text: "Araştırmaya başlarım, işin aslını öğrenmeliyim.", scores: [0, 0, 1, 3] },
    ]),
    makeQuestion("dh_q4", 4, "Bir davet veriyorsun. En çok neye önem verirsin?", dhKeys, [
      { id: "dh_q4_a1", text: "Menü, masa düzeni ve mükemmel zamanlama.", scores: [3, 1, 0, 0] },
      { id: "dh_q4_a2", text: "Gelenlerin kim olduğu ve benim nasıl göründüğüm.", scores: [0, 3, 0, 0] },
      { id: "dh_q4_a3", text: "Kimsenin bir şeyi kırmaması ve saat 23.00'te bitmesi.", scores: [1, 0, 3, 0] },
      { id: "dh_q4_a4", text: "Herkesin eğlenmesi, gerisi kendiliğinden olur.", scores: [0, 1, 0, 3] },
    ]),
    makeQuestion("dh_q5", 5, "Biri seni kırdı. Nasıl tepki verirsin?", dhKeys, [
      { id: "dh_q5_a1", text: "Gülümserim. İntikam soğuk servis edilir.", scores: [3, 1, 0, 0] },
      { id: "dh_q5_a2", text: "Aynı anda hem kırar hem daha iyi görünürüm.", scores: [0, 3, 1, 0] },
      { id: "dh_q5_a3", text: "Yüzüne söylerim, dolambaçlı yolu sevmem.", scores: [1, 0, 3, 0] },
      { id: "dh_q5_a4", text: "Önce ağlarım, sonra barışmak için ararım.", scores: [0, 0, 0, 3] },
    ]),
    makeQuestion("dh_q6", 6, "Kriz anında masadaki rolün ne olur?", dhKeys, [
      { id: "dh_q6_a1", text: "Sakin kalır, herkese ne yapacağını söylerim.", scores: [3, 0, 2, 0] },
      { id: "dh_q6_a2", text: "Doğru kişiyi arar, işi hallettiririm.", scores: [0, 3, 1, 0] },
      { id: "dh_q6_a3", text: "Planı ben kurarım, uygulamayı da ben denetlerim.", scores: [1, 0, 3, 0] },
      { id: "dh_q6_a4", text: "Panik yaparım ama sonunda bir şekilde çözülür.", scores: [0, 0, 0, 3] },
    ]),
    makeQuestion("dh_q7", 7, "Gardırobunu bir kelimeyle anlatsan?", dhKeys, [
      { id: "dh_q7_a1", text: "Kusursuz. Renkler bile sıraya dizili.", scores: [3, 1, 0, 0] },
      { id: "dh_q7_a2", text: "Pahalı. Ve her parçanın bir hikâyesi var.", scores: [0, 3, 0, 0] },
      { id: "dh_q7_a3", text: "Pratik. Sabah düşünmek istemiyorum.", scores: [0, 0, 3, 1] },
      { id: "dh_q7_a4", text: "Karışık. Ama her şeyin bir anısı var.", scores: [0, 0, 1, 3] },
    ]),
    makeQuestion("dh_q8", 8, "Sırrın açığa çıkmak üzere. İlk hamlen?", dhKeys, [
      { id: "dh_q8_a1", text: "Kanıtları temizlerim. Kimse fark etmez.", scores: [3, 1, 0, 0] },
      { id: "dh_q8_a2", text: "Konuyu değiştiririm, dikkat dağıtmak sanattır.", scores: [0, 3, 0, 1] },
      { id: "dh_q8_a3", text: "İtiraf eder, hemen çözüm planı sunarım.", scores: [1, 0, 3, 0] },
      { id: "dh_q8_a4", text: "En yakın arkadaşıma anlatırım, o da anlatır.", scores: [0, 0, 0, 3] },
    ]),
    makeQuestion("dh_q9", 9, "Sence en büyük gücün ne?", dhKeys, [
      { id: "dh_q9_a1", text: "Disiplin. Kaosun içinde bile düzen kurarım.", scores: [3, 0, 1, 0] },
      { id: "dh_q9_a2", text: "Çekicilik. İstediğimi almanın yolunu bulurum.", scores: [0, 3, 0, 1] },
      { id: "dh_q9_a3", text: "Dayanıklılık. Ben pes etmem, yorulurum sadece.", scores: [0, 0, 3, 0] },
      { id: "dh_q9_a4", text: "Kalp. İnsanlar bana kolay bağlanır.", scores: [0, 1, 0, 3] },
    ]),
    makeQuestion("dh_q10", 10, "Wisteria Lane'de bir gece yarısı. Neredesin?", dhKeys, [
      { id: "dh_q10_a1", text: "Mutfakta, yarın için turta yapıyorum.", scores: [3, 0, 1, 0] },
      { id: "dh_q10_a2", text: "Dışarıda, kimsenin bilmediği bir buluşmada.", scores: [0, 3, 0, 1] },
      { id: "dh_q10_a3", text: "Çocuk odasında, üçüncü kez uyandım.", scores: [0, 0, 3, 0] },
      { id: "dh_q10_a4", text: "Perdenin arkasında, komşuyu izliyorum.", scores: [1, 0, 0, 3] },
    ]),
  ],
  resultProfiles: [
    {
      id: "dh_profile_bree",
      key: "bree",
      name: "Bree Van de Kamp",
      shortDescription:
        "Sen kontrolün kendisisin. Kaosun ortasında bile masa örtüsü düz, ses tonun sakin kalır. İnsanlar sana güvenir çünkü senin dünyanda hiçbir şey tesadüf değildir.",
      fullDescription:
        "Sen kontrolün kendisisin. Kaosun ortasında bile masa örtüsü düz, ses tonun sakin kalır. İnsanlar sana güvenir çünkü senin dünyanda hiçbir şey tesadüf değildir. Mükemmeliyetçiliğin bir gösteriş değil, bir savunma mekanizması: her şey yerli yerindeyse duygular da yerli yerinde kalır. Zor anlarda çözülmek yerine planlarsın, ağlamak yerine organize edersin. Bu seni son derece güvenilir yapar ama aynı zamanda yalnız bırakabilir. Çünkü kimse senin de bazen dağılmaya ihtiyacın olduğunu tahmin etmez. Gerçek gücün kusursuzluğunda değil, kusurlarını kabul ettiğin anda ortaya çıkıyor.",
      strengths: ["Olağanüstü disiplin", "Kriz anında soğukkanlılık", "Yüksek standartlar", "Sözünün eri olmak"],
      weaknesses: ["Duygularını bastırma", "Aşırı kontrol ihtiyacı", "Eleştiriye kapalılık", "Yardım istemekte zorlanma"],
      relationshipStyle:
        "İlişkilerde sadık ve tutarlısın ama duygusal olarak yavaş açılırsın. Sevgiyi sözlerle değil, yaptığın işlerle gösterirsin; karşındaki bunu okumayı öğrendiğinde ilişki derinleşir.",
      roleDescription:
        "Wisteria Lane'de sen mahallenin görünmez otoritesisin. Bir kriz çıktığında herkes önce senin kapını çalar, sonra arkandan konuşur. Ve ikisini de hak edersin.",
      shareText: "Wisteria Lane testinde Bree Van de Kamp çıktım. Kontrol bende.",
    },
    {
      id: "dh_profile_gabrielle",
      key: "gabrielle",
      name: "Gabrielle Solis",
      shortDescription:
        "Bir odaya girdiğinde havanın değiştiğini hissedersin. Ne istediğini bilirsin ve istediğini almanın bir yolunu mutlaka bulursun. Sıradanlık senin için gerçek bir tehdittir.",
      fullDescription:
        "Bir odaya girdiğinde havanın değiştiğini hissedersin. Ne istediğini bilirsin ve istediğini almanın bir yolunu mutlaka bulursun. Sıradanlık senin için gerçek bir tehdittir. Dışarıdan bakanlar seni yüzeysel sanabilir ama bu bir kamuflaj: parlak yüzeyin altında keskin bir sezgi ve şaşırtıcı bir dayanıklılık var. Zor zamanlarda kırılmazsın, strateji değiştirirsin. Sadakatin seçicidir; sevdiğin çok az kişi vardır ama onlar için savaşırsın. En büyük mücadelen, sevilmek için etkileyici olmak zorunda olmadığını kendine kanıtlamak.",
      strengths: ["Güçlü sezgi", "Karizma ve ikna gücü", "Hızlı karar alma", "Yeniden ayağa kalkma becerisi"],
      weaknesses: ["Görünüşe aşırı yatırım", "Sabırsızlık", "Kırılganlığı saklamak", "İhtiyaç anında bile yardım istememek"],
      relationshipStyle:
        "İlişkilerde tutkulu ve kışkırtıcısın. Sıkıcılığı affetmezsin ama gerçekten bağlandığında beklenmedik ölçüde koruyucu ve fedakâr olursun.",
      roleDescription:
        "Wisteria Lane'de sen sokağın gösterisisin. Herkes seni izler, kimse tam olarak çözemez. Skandalın merkezinde olmak seni yıpratmaz, besler.",
      shareText: "Wisteria Lane testinde Gabrielle Solis çıktım. Sahne benim.",
    },
    {
      id: "dh_profile_lynette",
      key: "lynette",
      name: "Lynette Scavo",
      shortDescription:
        "Sen her şeyi bir arada tutan kişisin. Kimse bunu istemedi, sen yaptın; çünkü sen yapmazsan kimsenin yapmayacağını biliyorsun.",
      fullDescription:
        "Sen her şeyi bir arada tutan kişisin. Kimse bunu istemedi, sen yaptın; çünkü sen yapmazsan kimsenin yapmayacağını biliyorsun. Zekisin, pratiksin ve gerçeği süslemeden söylersin. Bu bazı insanları rahatsız eder, doğru insanları ise rahatlatır. Yükün büyük olduğunda şikâyet etmek yerine daha çok çalışırsın, ta ki tükenene kadar. Mizahın hayatta kalma araçlarından biri: en zor anda en iyi esprin çıkar. Öğrenmen gereken tek şey, sorumluluğu paylaşmanın zayıflık değil olgunluk olduğu.",
      strengths: ["Stratejik zekâ", "Dürüstlük", "Olağanüstü dayanıklılık", "Kara mizah"],
      weaknesses: ["Kendini tüketme eğilimi", "Delege etmekte zorlanma", "Fazla sert görünebilme", "Dinlenmeyi ertelemek"],
      relationshipStyle:
        "İlişkilerde ortaklık ararsın, kurtarıcı değil. Karşındakinin sorumluluğu gerçekten paylaştığını gördüğünde en yumuşak halin ortaya çıkar.",
      roleDescription:
        "Wisteria Lane'de sen görünmeyen yönetim kurulusun. Sokak senin planların sayesinde ayakta, ama teşekkürü genelde başkası alır.",
      shareText: "Wisteria Lane testinde Lynette Scavo çıktım. Her şeyi ben taşıyorum.",
    },
    {
      id: "dh_profile_susan",
      key: "susan",
      name: "Susan Mayer",
      shortDescription:
        "Kalbin her zaman aklından bir adım önde. Sakarlıkların, aşırı meraklarınla birleşince başını sürekli belaya sokuyor ama kimse sana uzun süre kızamıyor.",
      fullDescription:
        "Kalbin her zaman aklından bir adım önde. Sakarlıkların, aşırı meraklarınla birleşince başını sürekli belaya sokuyor ama kimse sana uzun süre kızamıyor. İnsanlara iyi niyetle yaklaşırsın ve bu kimi zaman saflık gibi görünse de aslında bir cesaret biçimi: kırılma riskini göze alarak sevmeyi seçiyorsun. Duyguların yüksek sesle yaşanır, sırların uzun süre saklanamaz. En büyük gücün, herkesin maske taktığı bir yerde gerçek kalabilmen. Öğrenmen gereken şey ise, her hikâyeyi kurtarmak zorunda olmadığın.",
      strengths: ["Yüksek empati", "İçtenlik", "Cesaret", "İnsanları birbirine bağlama"],
      weaknesses: ["Dürtüsellik", "Sınır koymakta zorlanma", "Aşırı duygusallık", "Merakın getirdiği kaos"],
      relationshipStyle:
        "İlişkilerde tamamen içindesindir, yarım sevmeyi bilmezsin. Romantiksin, affedicisin; ama kendini kaybetmemek için zaman zaman geri adım atmayı öğrenmelisin.",
      roleDescription:
        "Wisteria Lane'de sen hikâyenin kalbisin. Olaylar senin etrafında dönmez, senin yüzünden döner. Ve sokak sensiz çok sıkıcı olurdu.",
      shareText: "Wisteria Lane testinde Susan Mayer çıktım. Kaos benimle geliyor.",
    },
  ],
};

const friendKeys: [string, string, string, string] = ["organizator", "gecKalan", "terapist", "karistiran"];

const friendGroupTest: Test = {
  category: "KİŞİLİK TESTİ",
  id: "test_hangi_arkadas_turusun",
  slug: "hangi-arkadas-turusun",
  title: "Arkadaş Grubunda Sen Hangisisin?",
  subtitle: "Grubun görünmeyen düzenini aslında sen belirliyor olabilirsin.",
  description:
    "Her grubun bir planlayıcısı, bir geç kalanı, bir terapisti ve bir de kıvılcım çakanı vardır. Sekiz soruda gruptaki gerçek rolünü öğren.",
  creator: aqryOriginals,
  estimatedDuration: "2 dakika",
  totalParticipants: 21740,
  price: 9.9,
  currency: "TL",
  status: "active",
  questions: [
    makeQuestion("fg_q1", 1, "Grup sohbetine 'buluşalım mı' mesajı düştü. Sen?", friendKeys, [
      { id: "fg_q1_a1", text: "Hemen tarih, mekân ve saat önerisi atarım.", scores: [3, 0, 1, 0] },
      { id: "fg_q1_a2", text: "İki gün sonra 'ben yeni gördüm' derim.", scores: [0, 3, 0, 1] },
      { id: "fg_q1_a3", text: "Herkese uygun olanı bulmaya çalışırım.", scores: [1, 0, 3, 0] },
      { id: "fg_q1_a4", text: "'Falanca da gelsin mi' diye ortalığı karıştırırım.", scores: [0, 0, 0, 3] },
    ]),
    makeQuestion("fg_q2", 2, "Buluşma saati 20.00. Sen kaçta oradasın?", friendKeys, [
      { id: "fg_q2_a1", text: "19.50. Masayı zaten ben ayırttım.", scores: [3, 0, 1, 0] },
      { id: "fg_q2_a2", text: "20.45. Trafik vardı, gerçekten.", scores: [0, 3, 0, 1] },
      { id: "fg_q2_a3", text: "20.05. Geç kalanı da ben ararım.", scores: [1, 0, 3, 0] },
      { id: "fg_q2_a4", text: "20.15. Ama en iyi hikâyeyle gelirim.", scores: [0, 1, 0, 3] },
    ]),
    makeQuestion("fg_q3", 3, "İki arkadaşın tartıştı. Rolün?", friendKeys, [
      { id: "fg_q3_a1", text: "Konuyu kapatıp programa dönerim.", scores: [3, 0, 0, 1] },
      { id: "fg_q3_a2", text: "Fark etmem bile, geç kaldım zaten.", scores: [0, 3, 0, 0] },
      { id: "fg_q3_a3", text: "İkisini de ayrı ayrı dinler, araları bulurum.", scores: [0, 0, 3, 0] },
      { id: "fg_q3_a4", text: "Detayları öğrenip herkese ayrı ayrı anlatırım.", scores: [0, 1, 0, 3] },
    ]),
    makeQuestion("fg_q4", 4, "Tatil planı yapılıyor. Senin işin ne?", friendKeys, [
      { id: "fg_q4_a1", text: "Excel tablosu, bütçe ve rezervasyon bende.", scores: [3, 0, 1, 0] },
      { id: "fg_q4_a2", text: "'Ben varım' derim, sonra kaybolurum.", scores: [0, 3, 0, 1] },
      { id: "fg_q4_a3", text: "Herkesin isteğini dengelemeye çalışırım.", scores: [1, 0, 3, 0] },
      { id: "fg_q4_a4", text: "Alternatif bir plan atıp kafaları karıştırırım.", scores: [0, 0, 0, 3] },
    ]),
    makeQuestion("fg_q5", 5, "Gece 02.00'de biri seni arıyor. Ne düşünürsün?", friendKeys, [
      { id: "fg_q5_a1", text: "Bir sorun var, çözüm lazım. Açarım.", scores: [3, 0, 2, 0] },
      { id: "fg_q5_a2", text: "Zaten uyanığım, açarım tabii.", scores: [0, 3, 1, 0] },
      { id: "fg_q5_a3", text: "Kötü bir gün geçirmiş, dinlemem gerek.", scores: [0, 0, 3, 0] },
      { id: "fg_q5_a4", text: "Bir olay olmuş. Bilmeliyim.", scores: [0, 1, 0, 3] },
    ]),
    makeQuestion("fg_q6", 6, "Grup fotoğrafında seni nerede buluruz?", friendKeys, [
      { id: "fg_q6_a1", text: "Fotoğrafı çeken benim, kadraja ben karar veririm.", scores: [3, 0, 0, 1] },
      { id: "fg_q6_a2", text: "Fotoğrafta yokum, henüz gelmemişim.", scores: [0, 3, 0, 0] },
      { id: "fg_q6_a3", text: "Ortada, herkesi omuzlamış hâlde.", scores: [0, 0, 3, 1] },
      { id: "fg_q6_a4", text: "Kenarda, kameraya bakmayan tek kişi.", scores: [0, 1, 0, 3] },
    ]),
    makeQuestion("fg_q7", 7, "Grup planı son anda iptal oldu. Tepkin?", friendKeys, [
      { id: "fg_q7_a1", text: "Sinirlenirim, iki saat uğraşmıştım.", scores: [3, 0, 0, 1] },
      { id: "fg_q7_a2", text: "Oh be. Zaten hazırlanmamıştım.", scores: [0, 3, 0, 0] },
      { id: "fg_q7_a3", text: "İptal edeni arar, iyi mi diye sorarım.", scores: [0, 0, 3, 0] },
      { id: "fg_q7_a4", text: "'Acaba neden' diye küçük bir araştırma başlatırım.", scores: [0, 0, 1, 3] },
    ]),
    makeQuestion("fg_q8", 8, "Grubun sensiz hâlini bir cümleyle anlat.", friendKeys, [
      { id: "fg_q8_a1", text: "Hiç buluşamazlardı.", scores: [3, 0, 1, 0] },
      { id: "fg_q8_a2", text: "Daha dakik olurlardı, itiraf ediyorum.", scores: [0, 3, 0, 0] },
      { id: "fg_q8_a3", text: "Kimse kimseyle konuşmazdı.", scores: [0, 0, 3, 0] },
      { id: "fg_q8_a4", text: "Çok daha sakin ama çok daha sıkıcı olurdu.", scores: [0, 1, 0, 3] },
    ]),
  ],
  resultProfiles: [
    {
      id: "fg_profile_organizator",
      key: "organizator",
      name: "Organizasyonu Yapan",
      shortDescription:
        "Grup senin takviminde yaşıyor. Sen yazmazsan buluşma olmaz, sen hatırlatmazsan kimse gelmez.",
      fullDescription:
        "Grup senin takviminde yaşıyor. Sen yazmazsan buluşma olmaz, sen hatırlatmazsan kimse gelmez. Sorumluluk almak sana doğal geliyor çünkü belirsizlik seni geriyor: bir planın olduğunda dünyayla aran iyi. Bu yüzden çoğu zaman gönüllü olmadığın bir görevi üstleniyorsun ve sonra bunun karşılığını alamadığını hissediyorsun. Grubun sana minneti gerçek ama dile getirilmiyor. Öğrenmen gereken şey, arada bir planı bırakıp sadece katılımcı olmayı denemek. Grup sandığından daha dayanıklı, sen de sandığından daha yorgunsun.",
      strengths: ["Güçlü planlama", "Sorumluluk bilinci", "Güvenilirlik", "İnisiyatif alma"],
      weaknesses: ["Kontrolü bırakamama", "Kolay tükenme", "Karşılık beklentisi", "Esneklikte zorlanma"],
      relationshipStyle:
        "İlişkilerde net, planlı ve sadıksın. Karşındakinden aynı ciddiyeti beklersin; belirsizlik seni sevgisizlikten daha çok yıpratır.",
      roleDescription:
        "Grupta sen omurgasın. İsmin olmayan bir görev tanımın var: hatırlatmak, ayarlamak, toparlamak. Grup senin sayende bir grup.",
      shareText: "Arkadaş grubu testinde 'Organizasyonu Yapan' çıktım. Yani her şey yine bende.",
    },
    {
      id: "fg_profile_gecKalan",
      key: "gecKalan",
      name: "Her Şeye Geç Kalan",
      shortDescription:
        "Saatinle aran hep sorunlu ama enerjinle aran mükemmel. Geldiğin an ortam değişiyor, bu yüzden kimse sana gerçekten kızamıyor.",
      fullDescription:
        "Saatinle aran hep sorunlu ama enerjinle aran mükemmel. Geldiğin an ortam değişiyor, bu yüzden kimse sana gerçekten kızamıyor. Geç kalmanın altında tembellik değil, ana fazla dalma hâli var: yoldayken bir şeye takılıyor, bir sohbeti kesemiyor, son dakikada bir fikir buluyorsun. Anı yaşamak konusunda gruptaki en yetenekli kişi sensin. Ama bu esneklik bazen etrafındakilere 'öncelik değilim' hissi veriyor. Küçük bir değişiklik — bir tek mesaj — sana hiçbir şey kaybettirmeden herkesin sana olan güvenini ikiye katlar.",
      strengths: ["Yüksek enerji", "Spontanlık", "Rahatlatıcı tavır", "Yargılamayan yaklaşım"],
      weaknesses: ["Zaman yönetimi", "Sözünü tutmakta gecikme", "Erteleme", "Detayları atlama"],
      relationshipStyle:
        "İlişkilerde eğlenceli ve baskısızsın. Rutin seni boğar; ama sevdiğin kişi için tutarlılık geliştirdiğinde ilişkilerin çok daha derinleşir.",
      roleDescription:
        "Grupta sen çalışan şakasın. Saatinden 40 dakika sonra gelirsin ama en iyi hikâyeyi de sen anlatırsın. Grup seni bekler, çünkü değer.",
      shareText: "Arkadaş grubu testinde 'Her Şeye Geç Kalan' çıktım. Yolda sayılırım.",
    },
    {
      id: "fg_profile_terapist",
      key: "terapist",
      name: "Grubun Terapisti",
      shortDescription:
        "Herkes derdini önce sana anlatıyor. Dinlemeyi biliyorsun, doğru soruyu soruyorsun ve kimseyi yargılamıyorsun.",
      fullDescription:
        "Herkes derdini önce sana anlatıyor. Dinlemeyi biliyorsun, doğru soruyu soruyorsun ve kimseyi yargılamıyorsun. Bu yüzden grubun duygusal hafızası sende: kimin neye üzüldüğünü, kimin neyi unutmadığını sen biliyorsun. Bu rol seni değerli kılıyor ama aynı zamanda görünmez bir yük bindiriyor. Kendi kötü gününü anlatacak birini ararken çoğu zaman kimseyi bulamıyorsun, çünkü herkes senin hep iyi olduğunu varsayıyor. Sınır koymak, bakım vermeyi bırakmak anlamına gelmiyor. Sen de arada dinlenmek istediğini söyleyebilirsin.",
      strengths: ["Derin empati", "Sabır", "Arabuluculuk", "Güven verme"],
      weaknesses: ["Sınır koyamama", "Kendini geri plana atma", "Duygusal yorgunluk", "Hayır demekte zorlanma"],
      relationshipStyle:
        "İlişkilerde anlayışlı ve destekleyicisin. Kendi ihtiyaçlarını dile getirmeyi öğrendiğinde, verdiğin şeyin yarısını bile geri almak seni çok mutlu eder.",
      roleDescription:
        "Grupta sen yumuşak dokusun. Kavgalar sende biter, sırlar sende kalır. Grup senin sayesinde birbirine küsmüyor.",
      shareText: "Arkadaş grubu testinde 'Grubun Terapisti' çıktım. Herkesin derdi bende.",
    },
    {
      id: "fg_profile_karistiran",
      key: "karistiran",
      name: "Sessizce Ortalığı Karıştıran",
      shortDescription:
        "Yüksek sesle konuşmazsın ama her şeyin nasıl bittiğini genelde sen belirlersin. Bilgi sende toplanır, kıvılcım senden çıkar.",
      fullDescription:
        "Yüksek sesle konuşmazsın ama her şeyin nasıl bittiğini genelde sen belirlersin. Bilgi sende toplanır, kıvılcım senden çıkar. Kötü niyetli değilsin; sadece insanları izlemeyi ve gerçeği görmeyi seviyorsun. Bir cümlenin doğru anda söylendiğinde neyi değiştireceğini içgüdüsel olarak biliyorsun. Bu, grubun en zeki ama en tehlikeli rolü. Doğru kullanıldığında sen gerçeği ortaya çıkaran kişisin; dikkatsiz kullanıldığında ise kırgınlığın kaynağı olursun. Gücünün farkına vardığında, grubun en iyi dengeleyicisine dönüşebilirsin.",
      strengths: ["Keskin gözlem", "Sosyal zekâ", "Cesur dürüstlük", "Mizah"],
      weaknesses: ["Kışkırtma eğilimi", "Sır tutmakta zorlanma", "Mesafeli görünme", "Sonuçları hafife alma"],
      relationshipStyle:
        "İlişkilerde ilgi çekici ve öngörülemezsin. Sıkılmayı sevmezsin; güvendiğin kişiye ise şaşırtıcı derecede açık ve sadık olursun.",
      roleDescription:
        "Grupta sen görünmeyen akımsın. Kimse plan yaptığını düşünmez ama olayların yönü çoğu zaman senin bir cümlenle değişir.",
      shareText: "Arkadaş grubu testinde 'Sessizce Ortalığı Karıştıran' çıktım. Şaşırmadım.",
    },
  ],
};

export const tests: Test[] = [desperateHousewives, friendGroupTest];

export function getTestBySlug(slug: string): Test | undefined {
  return tests.find((test) => test.slug === slug);
}

export function getProfileByKey(test: Test, key: string) {
  return test.resultProfiles.find((profile) => profile.key === key);
}