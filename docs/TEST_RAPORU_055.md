# LumaNote 0.5.5 — Sakura Koleksiyonu / Test raporu

Sürüm: `LUMA-0.5.5-SAKURA-COLLECTION` · 30 Eylül 2026

| Bu teslimde yeniden çalıştırılan grup | Sonuç |
|---|---:|
| Sakura kataloğu, alışveriş, yerleşim, hareket ve test bütçesi — gerçek Chromium | 55 / 55 |
| Önceki not/tema/mağaza arayüzünün regresyon kontrolleri — gerçek Chromium | 69 / 69 |
| Güncelleyici, ZIP yedeği, geri alma ve test-jetonu komutları — gerçek Linux/Node dosya işlemleri | 27 / 27 |
| Kaynak/üretilmiş arayüz/baslangıç bütünlük doğrulaması | 40 / 40 |
| **Toplam** | **191 / 191** |

Bu rakam 191 fiziksel iPhone testi veya tüm uygulamanın kalite garantisi değildir. Kaynak varlığı kontrolleri işlev testlerinden ayrı gösterilmiştir. Dağıtımdaki Bash dosyaları ayrıca `bash -n` ile denetlendi; bu kontroller tabloya eklenmedi.

## Nasıl çalıştırıldı?

Üretilmiş `ONIZLEME.html` Chromium'da `set_content` ile açıldı. Ortamın gezinme kısıtı nedeniyle localStorage için bellek adaptörü kullanıldı. Gerçek iOS depolaması değildir. Yeniden açılış, serileştirilmiş durumu normalize ederek ve yeni sayfada yükleyerek denendi.

30 yeni model ve mağaza filtresi, yetersiz bakiye, bir kez ödeme, kayıt hatasında geri alma, bahçe/ev yerleştirme ayrımı, oklarla taşıma, tek parmak kamera sürüklemesinin kapalı kalması ve yakınlaştırma/sığdırma denendi. 320, 375, 390, 430 ve 768 piksel genişliklerde taşma ve satın alma düğmelerinin boyutları kontrol edildi.

Dört yeni hareketli model farklı zamanlarda tuvale çizilerek piksel çıktılarının değiştiği doğrulandı. Azaltılmış hareket modunda aynı model farklı zamanlarda aynı sonucu verdi. Koi havuzuna canvas üzerinden pointer dokunması küçük etkileşimi başlattı. Bu ölçümler FPS/pil tüketimi garantisi değildir.

Test-jetonu anahtarı ve native izin bayrağı tarayıcıda taklit edildi. Yeni dekorların mevcut 100 milyon test bütçesini kullanması, gerçek çalışma bakiyesinin korunması, yeniden yüklemede bütçenin dolmaması ve üretim izni olmadan test öğelerinin temizlenmesi denendi. Gerçek native `__DEV__` ile oluşturulmuş üretim uygulaması burada çalıştırılmadı.

Güncelleyici, bilinen 0.5.4 tam kaynak kopyasına, test-jetonu eklentisi açık kopyaya ve eklentisi kapalı kopyaya uygulandı. Gerçek `zip`/`unzip` kullanıldı. Değişmemesi gereken `package-lock.json`, uygulama kimliği, sürüm bağımlılıkları, özel ayar ve ses dosyaları hash ile karşılaştırıldı. Tekrar uygulama, boşluklu yol, farklı SDK, kişisel kod değişikliği, sembolik bağlantı, manifest yol ihlali ve doğrulama hatasından sonra tüm dosyaların geri alınması kontrol edildi.

İlk animasyon testinde kurbağa hareketinin seçilen iki örnek karede aynı piksele yuvarlandığı görüldü. Küçük hareket 2 piksele ayarlandı; son çalıştırmada tüm sonuçlar geçti. Nihai sonuç dosyaları `tests/055` içindedir.

## Burada yapılmayanlar

Fiziksel iPhone/Expo Go, gerçek npm kurulumu, Metro iOS bundle, WKWebView dokunma/klavye, iOS kilit ekranı, bildirim teslimi, gerçek ses dinleme/indirme ve native şifreleme. PDF özellikleri bu sürümde değiştirilmedi ve uçtan uca yeniden test edilmedi. Mevcut dosyalara dayanılarak hazırlanan güncelleyici, bilinmeyen kişisel kod değişikliklerini otomatik birleştirmez.

## Tekrar çalıştırma

`python tests/055/collection-test.py` için Python Playwright ve Chromium gerekir. `python tests/055/installer-test.py`, eski tam kaynak klasörünü `LUMA_054_SOURCE` ortam değişkeniyle alır; varsayılan aynı üst dizindeki `LumaNote_054_Tam_Proje` klasörüdür. Test-jetonu eklentisinin halka açık kod fixtürü testler içinde bulunur. `node tools/verify.cjs` npm paketi kurmaz.

## iPhone kabul kontrolü

Sürüm etiketini doğrula; mevcut bakiye, notlar ve saksılar aynı kalmalı. Mağaza → Sakura içinde yeni parçaları görüntüle. Bir dekoru satın alıp yerleştir, oklarla taşı, kapatıp yeniden aç; konumu ve sahipliği korunmalı. Test bütçesi açıksa harcamadan sonra bütçe eksilmeli ve yeniden açınca artmamalı. Koi/kurbağa dokunmasını, yakınlaştırmayı ve azaltılmış hareketi dene. Asıl kulübeye bir ev eşyası yerleştir. Normal odak ekranındaki bahçe teması da aynı eşyaları göstermeli.

Önizlemeler örnek veridir; kullanıcıya hediye sahiplik veya yapay çalışma süresi olarak yüklenmez.
