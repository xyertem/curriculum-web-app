# AWS Web Sitesi — Faz Planı

Tarih: 12 Ekim 2026

## Hedef ve kapsam

- Eğitim materyalleri, makaleler ve videolar sunan, mobil uyumlu bir web sitesi.
- Ziyaretçiler kayıt olmadan yayınlanmış içerikleri okuyabilir, materyalleri inceleyebilir ve videoları izleyebilir.
- İlk aşamada tek admin içerik ekler, düzenler, siler ve yayınlar.
- Aylık toplam bütçe hedefi: en fazla 50 USD. Vergi, alan adı, depolama ve trafik bu bütçede ayrıca takip edilir.
- İlk sürümde ödeme, öğrenci hesabı, sertifika ve izleme ilerlemesi kapsam dışıdır.

## Teknoloji kararı

| Alan | Seçim |
|---|---|
| Arayüz ve backend | Next.js + TypeScript |
| Tasarım | Tailwind CSS + shadcn/ui |
| Veritabanı | PostgreSQL + Prisma |
| Admin kimlik doğrulama | Auth.js; izin verilen tek hesap |
| İçerik editörü | Tiptap veya benzeri bir zengin metin editörü |
| Çalıştırma | Lightsail, Docker Compose ve Caddy |
| Dosya depolama | Amazon S3 |
| Video ve dosya dağıtımı | Amazon CloudFront |

Tek uygulama ile ilerle. PostgreSQL başlangıçta uygulamayla aynı sunucuda çalışır; büyüme durumunda ayrılabilir. Veritabanına video/PDF dosyasının kendisi değil, S3 anahtarı ve metadata kaydedilir.

## Faz 1 — Kapsam ve ekran planı

- [ ] Site adı, alan adı ve temel görsel tarzı belirle.
- [ ] Sayfaları netleştir: ana sayfa, eğitim listesi, eğitim detay, ders/video sayfası, makale listesi, makale detay, admin.
- [ ] Eğitim–ders–materyal ilişkisini belirle.
- [ ] İçerik türlerini tanımla: makale, video, PDF, görsel.
- [ ] Kategori, taslak/yayınlanmış durum ve sıralama kurallarını belirle.
- [ ] Pilot içerik miktarını, toplam video boyutunu ve tahmini aylık izlenmeyi yaz.

Tamamlanma ölçütü: ekran listesi, içerik modeli ve ilk sürüm sınırları belli.

## Faz 2 — Yerel proje ve veritabanı

- [ ] Git deposunu ve Next.js TypeScript projesini oluştur.
- [ ] Tailwind ve arayüz bileşenlerini kur.
- [ ] Docker Compose ile yerel PostgreSQL kur.
- [ ] Prisma şemasını oluştur: Category, Article, Course, Lesson, Asset.
- [ ] İçeriklere slug, başlık, açıklama, durum, sıralama ve tarih alanlarını ekle.
- [ ] Auth.js yönteminin gerektirdiği kullanıcı/oturum tablolarını ekle.
- [ ] Migration ve örnek içerik hazırlama komutlarını oluştur.
- [ ] Ortam değişkenleri için örnek dosya oluştur; gerçek sırları Git dışında tut.

Tamamlanma ölçütü: uygulama yerelde açılıyor ve örnek içerikler veritabanından okunuyor.

## Faz 3 — Admin girişi ve içerik yönetimi

- [ ] Auth.js ile admin girişini kur; mümkünse MFA kullanan Google/GitHub hesabını izin listesine al.
- [ ] Her sunucu işlemi ve yükleme izninde admin kimliğini doğrula.
- [ ] Makale ekleme, düzenleme, silme ve zengin metin editörünü geliştir.
- [ ] Eğitim ve ders yönetimini geliştir.
- [ ] Kategori, kapak görseli ve sıralama yönetimini ekle.
- [ ] Taslak, önizleme, yayınlama ve yayından kaldırma özelliklerini ekle.
- [ ] Silme onayı ve tercihen geri alınabilir silme uygula.
- [ ] Alan doğrulaması, hata mesajları ve slug çakışması kontrolü ekle.
- [ ] Editör içeriğini güvenli biçimde göster; XSS riskini gider.

Tamamlanma ölçütü: admin içerikleri yönetebiliyor; yetkisiz istekler reddediliyor.

## Faz 4 — Ziyaretçi sitesi

- [ ] Mobil uyumlu ana sayfa, listeler ve detay sayfalarını geliştir.
- [ ] Kategori filtresi, sayfalama ve basit arama ekle.
- [ ] Yalnızca yayınlanmış içerikleri ziyaretçilere göster.
- [ ] Video oynatıcı ve PDF görüntüleme/indirme bağlantılarını ekle.
- [ ] SEO başlıkları, açıklamalar, sitemap ve robots dosyasını oluştur.
- [ ] İçerik değişince ilgili önbelleği yenile.
- [ ] Boş içerik, bulunamayan sayfa ve hata durumlarını tasarla.
- [ ] Klavye kullanımı, okunabilirlik ve görsel alternatif metinlerini kontrol et.

Tamamlanma ölçütü: ziyaretçi giriş yapmadan içerikleri rahatça inceleyebiliyor; taslaklar görünmüyor.

## Faz 5 — S3 dosyaları ve video

- [ ] Private S3 bucket oluştur; public erişimi kapalı tut.
- [ ] CloudFront Origin Access Control ile S3 okuma erişimini sınırla.
- [ ] Admin için kısa ömürlü yükleme izinleri üret.
- [ ] Tarayıcıdan doğrudan S3 yükleme yap; büyük dosyaları Next.js sunucusundan geçirme.
- [ ] Büyük videolarda multipart yükleme ve hata/yeniden deneme akışını kur.
- [ ] Dosya türü, boyut limiti, CORS ve metadata kontrollerini uygula.
- [ ] İlk sürümde önceden sıkıştırılmış MP4 kullan; otomatik dönüştürmeyi sonraya bırak.
- [ ] Video ileri sarma, mobil oynatma ve uygun cache başlıklarını kontrol et.
- [ ] Taslak videoları herkese açık dağıtıma çıkarma; yayınlanan içerikleri ayrı prefix/dağıtım politikasıyla ayır.
- [ ] İçerik silinince bağlı dosyalar için güvenli temizleme kuralı kur.
- [ ] Tamamlanmamış multipart yüklemeler için lifecycle temizliği ekle.

Tamamlanma ölçütü: admin dosya yükleyebiliyor, yayınlanmış videolar CloudFront üzerinden oynuyor.

Not: Private bucket, yayınlanmış videoyu üyeye özel yapmaz. Bu projede yayınlanan videolar herkese açıktır; bağlantıların paylaşılması mümkündür.

## Faz 6 — AWS kurulumu ve maliyet kontrolü

- [ ] AWS hesabında MFA ve günlük işlemler için sınırlı yetki kur.
- [ ] Servisler için aynı uygun bölgeyi seç; fiyatı kurulum öncesi kontrol et.
- [ ] Lightsail 4 GB Linux paketini değerlendir.
- [ ] Sunucuda Docker Compose, Next.js, PostgreSQL ve Caddy kur.
- [ ] PostgreSQL portunu internete açma; HTTPS ve gerekli yönetim erişimleriyle sınırla.
- [ ] Alan adı, DNS ve TLS sertifikasını yapılandır.
- [ ] Uygulama imajını yerelde veya CI içinde build et.
- [ ] Sunucudaki AWS erişimini yalnızca gereken S3 işlemlerine sınırla.
- [ ] CloudFront Free ile başla; Pro gereksinimini trafikle değerlendir.
- [ ] 20, 35 ve 45 USD bütçe uyarıları ve maliyet anomali takibi kur.
- [ ] Log saklama süresini, S3 kullanımını ve eski yedek temizliğini belirle.
- [ ] Kullanılmayan kaynakları düzenli kontrol et.

Tamamlanma ölçütü: site HTTPS ile erişilebilir ve giderler takip ediliyor.

## Faz 7 — Yedekleme, test ve yayına çıkış

- [ ] Günlük PostgreSQL yedeğini sunucu dışında sakla.
- [ ] Yedeklerin saklama süresini ve Lightsail snapshot planını belirle.
- [ ] Bir yedeği geri yükleyerek kurtarma işlemini doğrula.
- [ ] Admin girişi, yetki, içerik CRUD, taslak erişimi ve dosya yüklemeyi test et.
- [ ] Video oynatmayı masaüstü ve mobil tarayıcılarda kontrol et.
- [ ] Silinen/yayından kaldırılan içeriğin cache davranışını kontrol et.
- [ ] Beklenen eşzamanlı kullanımda kaynak tüketimini ölç.
- [ ] Hata izleme, sağlık kontrolü ve disk doluluk uyarıları kur.
- [ ] Canlı güncelleme ve önceki sürüme dönüş adımlarını yaz.
- [ ] Pilot içerikleri ekle ve yayına çık.

Tamamlanma ölçütü: temel akışlar çalışıyor, geri yükleme denenmiş ve bütçe kontrol edilmiş.

## Faz 8 — Yayın sonrası geliştirme

- [ ] İlk ay gerçek depolama, trafik, RAM ve CPU kullanımını incele.
- [ ] İçerik yönetimi kullanımına göre admin panelini iyileştir.
- [ ] İhtiyaç oluşursa gelişmiş arama, altyazı ve HLS ekle.
- [ ] Kullanım büyürse veritabanını ayrı/yönetilen servise taşı.
- [ ] Kullanıcı hesabı, ücretli eğitim ve sertifikayı ayrı kapsam olarak değerlendir.

## Başlangıç maliyet planı

| Kalem | Aylık tutar |
|---|---:|
| Lightsail 4 GB Linux, IPv4 dahil | 24 USD |
| CloudFront Free / Pro | 0 / 15 USD |
| S3 depolama ve istekler | 2–5 USD tahmini |
| Yedekler ve snapshot | 2–4 USD tahmini |
| Toplam | 28–48 USD tahmini |

Vergi, alan adı ve beklenmeyen kullanım dahil değildir. 50 USD sınırını korumak için Free planıyla başla ve mümkünse normal aylık gideri 35–40 USD altında tut. Bütçe uyarıları harcamayı otomatik durdurmaz. Sabit CloudFront planı tüm AWS faturasını sabitlemez.

12 Ekim 2026 görüşmesinde kontrol edilen fiyatlar; kurulumdan önce yeniden doğrulanmalı:

- Lightsail: https://aws.amazon.com/lightsail/pricing/
- CloudFront: https://aws.amazon.com/cloudfront/pricing/
- CloudFront plan limitleri: https://docs.aws.amazon.com/PricingPlanManager/latest/UserGuide/plans.html
- S3: https://aws.amazon.com/s3/pricing/

## İlk yapılacaklar

1. Ekran listesi ve örnek eğitim içeriğini belirle.
2. Next.js + yerel PostgreSQL projesini kur.
3. Admin girişi ve makale yönetimini tamamla.
4. Eğitim/ders yapısını ekle.
5. S3 ve video entegrasyonunu yap.
6. AWS kurulumu, yedekleme ve testlerden sonra yayınla.
