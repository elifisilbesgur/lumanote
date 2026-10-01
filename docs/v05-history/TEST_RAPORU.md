# LumaNote 0.5 — Test ve kabul raporu

Sürüm `LUMA-0.5-LIVING-GARDEN` · 30 Eylül 2026. Kaynak: bu sohbetin tam Nocturne projesi + 0.4 payload’u. Kullanıcının güncel Mac projesi yüklenmedi. Bu rapor eski 0.4 raporunun tekrarı değildir.

| Test grubu | Geçen / toplam |
|---|---|
| Chromium uygulama işlevi / kayıt geçişi | 79 / 79 |
| Chromium gerçek pointer etkileşimleri ve farklı ekran boyları | 32 / 32 |
| Başlatıcı yedek korumaları ve Bash sözdizimi | 16 / 16 |
| Native TypeScript + bellek dosya sistemi adaptörü | 19 / 19 |
| Kaynak bütünlüğü, JavaScript sözdizimi ve üretim eşitliği | 29 / 29 |

**Toplam 175 kontrol geçti.** Kontrol sayısı fiziksel cihaz performansı, bütün özelliklerin uçtan uca doğrulanması veya güvenlik sertifikası anlamına gelmez. Ham sonuçlar `tests/*-results.json`; son grup `tools/verify.cjs` çıktısıdır.

## Gerçekte çalıştırılanlar

Gerçek `/usr/bin/chromium` motoru ve Playwright kullanıldı. Ortam dosya/HTTP navigasyonuna izin vermediğinden HTML `set_content` ile yüklendi ve localStorage yerine bellek adaptörü bağlandı. Gerçek tarayıcı disk kalıcılığı testi değil; kayıtlar serialize/normalize edilerek yeni durum açılması sınandı. UI hata dinleyicisinde yakalanmamış hata yoktu.

Yeni/eski bakiye, aynı oturuma tek kredi, kısmi çalışma, mola ve duraklatmada ödül olmaması, Pomodoro uzun molası, Flowtime sayacı, jeton animasyonunun merkez/uçuş aşamaları; olgun bitkiyi bahçeye taşıma, saksının boşalması, görsel sulamanın ödül vermemesi; hayvan sürükleme/geri alma, zemin boyama, kulübe/sera/saksı sahne dokunmaları; yağmur kare değişimi ve azaltılmış hareket; kendi bahçesinin odak arka planı olması; tam ekran kontrollerinin saklanması denendi.

Not sabit + düğmesi 36 not ve kaydırma sonrasında; basılı tutma menüsü, çöpe taşıma/geri al, çekmeceyi sürükleyerek kapatma; seçili metin rengi, tabloda satır/sütun, el yazısı pointer çizimi/geri al/yinele; fotoğraf kâğıdının el yazısı sayfasına aktarılması denendi. Ekran boyları 320×568, 375×812, 430×932, 768×1024 ve 844×390.

Native kaynaklar gerçek TypeScript dönüştürücüsüyle derlendi, Expo API’leri ve dosya sistemi bellek adaptörüyle çağrıldı. Eski dosyaya dokunmadan yeni klasöre kopyalama, eklerin yeni URI’si, önceki anlık kopya, yeni sürüm dosyasına yazma, bozuk dosyada sessiz veri kaybını engelleme, kesilmiş yazımdan previous dosyasıyla toparlama ve izin verilmeyen PDF URI’sinin reddi denendi. Bunlar iOS native modüllerinin testi değildir; gerçek @noble/hashes/Expo şifreleme sınaması da bu grubun parçası değildir.

Başlatıcı testinde gerçek Bash/zip/unzip, geçici HOME ve npm çalıştırmayan sahte npx kullanıldı. Eski kaynak/kilit/özel yapılandırma yedeği, node_modules dışlama, yedek hatasında kurulumun başlamaması, eski projenin hash’inin değişmemesi, bir sonraki çalıştırmada ikinci otomatik yedek alınmaması denendi. Linux ZIP testi, macOS dağıtım testi değildir.

## Özellikle henüz test edilmeyenler

- Gerçek npm kurulumu, bağımlılık kilidi, tam TypeScript tip denetimi ve Metro iOS export. Yalnızca sözdizimi dönüştürmesi tam tip denetimi sayılmaz.
- Fiziksel iPhone/Expo Go, ekran yönü, güvenli alanlar, iOS klavye, uzun süreli pil/FPS/bellek ve arka plan bildirim teslimi.
- Gerçek PDF.js/pdf-lib kurulumu, WKWebView Blob modülü/worker, PDF açma/çizim/dışa aktarma uçtan uca. Testlerde normalleştirilmiş işaret koordinatları, işaret verisinin paint sırasında kaybolmaması ve kütüphane yokluğunda doğru hata kontrol edildi; bu gerçek PDF işleme değildir.
- Freesound dosyalarının gerçekten indirilmesi, dinlenerek doğal ses kalitesi değerlendirmesi. Paket açıkça işaretlenmiş sentez demoları içerir; ilk kurulum indirme girişimi başarısız olabilir.
- Gerçek fotoğraf/PDF seçici, Dosyalar’a kaydetme, paylaşım ekranı ve native şifreli yedek açma. Önceki sürümün şifreleme mimarisi korunmuştur; doğrulama için cihaz gerekir.

## Cihazda güvenli kabul kontrolü

1. Eski telefon JSON yedeğini ayrı sakla; eski proje klasörünü silme. Yeni sürümde yedeği önce yalnızca önizle; içerik doğruysa yeni proje verisini değiştireceğini bilerek onayla.
2. Yeni bir deneme notuyla yazı, klavye, sabit +, uzun basma/geri alma ve kâğıdı dene. Tek gerçek belgen yerine kopya PDF kullan. Bir sayfaya işaret koy, kapat/aç ve işaretli kopyayı dışa aktar; orijinalin değişmediğini kontrol et.
3. Kısa deneme oturumunu duraklat; jeton değişmemeli. Bitir/kaydet; tek animasyon ve tek kredi olmalı. Sonra uygulamayı aç/kapat ve tekrar kredi verilmediğini kontrol et. Molada kazanç olmamalı.
4. Telefon kilitlenip açıldığında kalan süreyi, bildirim iznini ve mola uyarısını kontrol et. Sesin kilitlenince durması bu sürümün bilinen davranışıdır.
5. Bahçe tam ekranında pan/zoom/taşı/geri al; tam ekran odakta yalnızca sayaç/arka plan; yatay/dikey dönüşü dene.
6. Ses kanalı “Kayıt” mı “Üretilmiş demo” mu kontrol et. Kulaklıkla düşük seviyeden başla, döngü geçişlerini ve kanal aç/kapatmayı dinle. “Gerçekçi ses hazır” sonucu yalnızca kaydın indirilmesiyle otomatik kabul edilmez.

## Görseller

`docs/screenshots/` görüntüleri gerçek uygulama kodundan örnek satın almalar, hayvanlar, saksılar ve çalışma kredileriyle alınmıştır. Bunlar kullanıcının hesabına ait değildir ve uygulama başlangıcına yüklenmez. Önizleme düzeni cihaz render garantisi değildir.
