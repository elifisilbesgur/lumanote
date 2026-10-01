# LumaNote 0.5.4 — Test raporu

Sürüm: `LUMA-0.5.4-SEASONS-NOTES` · 30 Eylül 2026

| Grup | Geçen / Toplam |
|---|---:|
| Chromium not/bahçe/mağaza/yerleşim | 69 / 69 |
| Ek işlemler, eşzamanlılık, dokunma ve sınırlar | 19 / 19 |
| Ses indirme ve güvenli hata davranışı — yerel fixture | 27 / 27 |
| Native kaynak ve adaptör kontrolleri | 27 / 27 |
| Gerçek yerel ZIP/kaynak güncelleyicisi | 19 / 19 |
| Gerçekte uygulanmış 0.5 → 0.5.3 → 0.5.4 kaynak zinciri | 5 / 5 |
| Yerleşik kaynak/üretilmiş arayüz denetimi | 35 / 35 |
| **Toplam** | **201 / 201** |

Bu toplam yalnızca bu teslimde çalıştırılan yeni testlere aittir; önceki 0.5.3
raporunun sayıları eklenmedi. Kontrol sayısı fiziksel cihaz testi veya kalite
garantisi değildir. Ham JSON, test kodu ve loglar `tests/054` klasöründedir.

## Gerçekte nasıl test edildi?

Chromium gerçek başsız tarayıcı motoru kullanıldı. HTML `set_content` ile yüklendi;
depolama erişimi kısıtlı olduğu için localStorage bellek adaptörü kullanıldı.
Serileştirme/yeniden normalize etme veri geçişini sınar, cihaz diskinin dayanıklılığını
kanıtlamaz. Bazı dokunmalar CDP Input.dispatchTouchEvent ile gönderildi; bu iPhone
WKWebView ya da fiziksel parmak değildir. Ekranlar 320/375/390/430/768 genişliklerde
ve 844x390 yatayda kontrol edildi. Biçim, gerçek editör düğmesi tıklamalarıyla denendi.

Seçili metinde renk/kalın/italik/alt çizgi, geri al/yinele, tekrar açma, normal
biçime dönüş, çok paragraf ve yeni yazılan renk kontrol edildi. Üç özel havada
satın alma, kalıcı hak, iptal, bakiyenin düşmesi, eşzamanlı istek, yetersiz bakiye ve
kayıt hatasında geri alma denendi. Toplu not silme/geri getirme/arşiv ve filtrelenmiş
Tümünü seç denendi. İçeride/ dışarıda ayrı yerleşim, sınır kısıtları, yön okları,
mağaza ve televizyonun dokunmayla aç/kapa davranışı denendi.

Ses indiriciye yerel HTML ve sentetik test baytları verildi. Lisans/ID/URL
süzgeci, yönlendirme ve boyut sınırları, başarısız indirme, önceki dosya hash’i,
bozuk dosya, atomic kayıt ve symlink reddi denendi. Bu fixture dosyaları uygulama
varlığına kopyalanmadı ve gerçek ses diye sunulmadı. Test MP3 başlık/sınır doğrulamasıdır;
gerçek müzik/alan kaydı çözme veya dinleme testi değildir. Web üzerinde kaynak
sayfaları ayrıca kontrol edildi; gerçek ses baytlarının indirilmesi DNS erişimi
olmadığından bu ortamda yapılamadı. Gerçek indirme Mac kurulumunda denenir.

Onarıcı Linux üzerinde gerçek `zip`, `unzip` ve Node 22.16.0 ile geçici hedef
klasörlerinde çalıştırıldı; önceki 0.5.3 kaynağı temel alındı. Paket/lock/özel
alanlar ve veri servisi koruması, tekrarlanabilir onarım, kişisel düzenlemelerde
ret, symlink, yanlış SDK ve doğrulama hatasında kaynakların geri alınması test edildi.
Testlerde ağ indirmesi LUMA_SKIP_RECORDINGS=1 ile kapalıydı; ayrıca indirme modülü
bağımsız adaptör testlerinden geçti. macOS npx Node24 ve Expo başlatılması burada yok.

Native TS kaynakları TypeScript ile dönüştürüldü; bu tam typecheck değildir.
Metro çözümleyici ve AudioEngine bileşenleri adaptörle sınandı. Gerçek Expo crypto,
bildirim ve ses bağlamaları çalıştırılmadı. Şifreleme algoritması ve NativeServices
kaynağının değişmediği denetlendi.

## Bulunan somut ek hatalar

Seçim araç düğmesinde kaybolabiliyordu. Araçlar inline oldu, odak değişmeden Range
ve not-kimliğine bağlı konum işaretçisi saklanıp kullanılıyor. Biçim işlemi gerçek
tıklama içinde eşzamanlı uygulanıyor. Sanitizer tarayıcının ürettiği text-decoration-line
özelliğini siliyordu; izin listesi düzeltildi. Toast kapsayıcısının pointer-events:none
özelliği Geri al düğmesini engelliyordu; yalnızca düğmeye dokunma erişimi eklendi.

## Bu teslimde yapılmayanlar

Fiziksel iPhone/Expo Go, WKWebView klavyesi ve metin seçim tutamaçları, gerçek Metro
iOS bundle ve npm kurulumu, gerçek ses kayıtlarını indirme/dinleme, kilit ekranı,
bildirim teslimi, PDF uçtan uca işaretleme/export ve şifreli yedek gerçek cihaz testi.

## iPhone kabul kontrolü

Önce telefon veri yedeğini Dosyalar'a kaydet. Yeni sürümde eski not, jeton ve saksı
bilgilerini kontrol et. Bir deneme notunda kelimeyi seç; B → renk → I → B tekrar
uygula, notu kapat/aç. Uzun basıp 2 notu seç, çöpe taşı, Geri al; gerçek önemli notta
kalıcı silmeyi sırf test amacıyla kullanma. Bahçe havasında Kar seçip beyaz zemini
kontrol et. Jeton harcamadan önce mod fiyatını onay ekranında gör. Kulübede eşyayı
oklarla taşı, uygulamayı yeniden açıp konumunu kontrol et. Sesler kurulduysa Kayıt
etiketini ve kaynak kredisini gör, kulaklıkta düşük sesle başlat. Eksik kayıt varsa
SESLERI_INDIR.command çalıştır; kanalların gerçekmiş gibi demo çalmadığını kontrol et.

Önizlemeler gerçek uygulama HTML’inden örnek bakiye/alışveriş ve örnek notlarla
alındı. Örnek veriler uygulama başlangıcına veya kullanıcı cihazına yüklenmez.
