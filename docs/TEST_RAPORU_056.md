# LumaNote 0.5.6 — Atölye test raporu

Sürüm: `LUMA-0.5.6-ATELIER` · 30 Eylül 2026

## Çalıştırılan kontroller

| Grup | Geçen / toplam |
|---|---:|
| Japon koleksiyonu, alışveriş ve test cüzdanı regresyonu | 55 / 55 |
| Yeni katalog, anı yerleşimi, kamera, temalar ve ses arayüzü | 65 / 65 |
| Gerçek yerel dosya/ZIP ile yedekli güncelleyici | 27 / 27 |
| Kümülatif 0.5, 0.5.3, 0.5.5 ve yerinde güncelleme zinciri | 12 / 12 |
| TypeScript kaynak / Metro çözümleyici / ses bileşeni adaptörleri | 33 / 33 |
| Beş paketlenmiş MP3'ün çözülmesi ve sayısal bütünlüğü | 20 / 20 |
| Yerleşik kaynak ve üretilmiş çıktı doğrulayıcısı | 56 / 56 |
| **Toplam doğrulama kontrolü** | **268 / 268** |

Bu sayı fiziksel telefon testi sayısı veya bütün uygulamanın kusursuz olduğuna dair
garanti değildir. Önceki teslimlerdeki sonuçlar, yeniden çalıştırılmayan hâlleriyle
bu toplamda yoktur. Çalıştırılan test dosyaları ve ham sonuçlar `tests/056` içindedir.

## Ortam ve neyin test edildiği

Gerçek Chromium motorunda oluşturulmuş ONIZLEME.html açıldı. Sayfa `set_content`
ile yüklenip localStorage için bellek adaptörü kullanıldı. Bu, gerçek iOS kalıcı
saklama alanı veya ağ üzerinden sayfa yükleme testi değildir. 320/375/390/430 px
dikey ve 844×390 yatay boyutlarda taşma kontrol edildi. Dokunmaların bir kısmı
Chromium `Input.dispatchTouchEvent`, bir kısmı fare pointer olaylarıyla gönderildi.

30 Japon/Sakura modeli korunuyor ve 12 yeni Çay & Kilim çizimi gerçek model
kayıtlarından geliyor. Mağaza kısayolları, fiyat/tek ödeme, yetersiz bakiye, kayıt
hatasında geri alma, ev/bahçe seçimi, test bütçesinden harcama, tekrar açılışta
yeniden 100 milyon verilmemesi ve mevcut testten çıkış kuralları kontrol edildi.

Eski anı ağacının adı korunarak normal sahne öğesine dönüştürülmesi, okla taşınması,
konumun normalize edilen kayıtta korunması, kaldırıp anıyı saklama ve geri getirme,
yeni çiçek oluşturma ve sahne hit alanları denendi. Anı bölümünün Yetiştir bölümünün
hemen altında olduğu kontrol edildi. Normalde kamera sabit, yakınken sürüklenebilir;
dört uç pan değerinde dünya dışında boş alan görülmedi. Gerçek Chromium iki parmak
zoom hareketi ve alt menüyü aşağı çekerek kapatma denendi.

Dört yeni lava teması ve mevcut Nocturne/bahçe arasında geçiş yapıldı. Bu ortamda
Chromium WebGL bağlamı vermedi; **temaların Canvas yedek çizimi test edildi**.
Yeni GLSL shader'ın fiziksel WebGL sürücüsünde derlenmesi ve render performansı bu
raporun kapsamına dahil değildir. Hareketi Azalt durumunda yedek animasyon durdu.

Yeni ses dosyalarının tümü MP3 olarak gerçek Chromium AudioContext içinde çözüldü.
Aynı kanalın eşzamanlı çağrılarında tek ses düğümü oluşturulması ve durdurmada
buffer'ların serbest bırakılması kontrol edildi. FFmpeg/ffprobe ile stereo,
44.1 kHz, süre ve SHA256 denetlendi; örnekler sonlu, sessiz olmayan ve kırpılmamıştı.
**Kulaklık/hoparlör üzerinden dinleme ya da sesin gerçekçi bulunmasına yönelik
öznel kalite testi yapılmadı.** Kaynaklar saha kaydı değil, proje için üretilmiş
sentez ses tasarımlarıdır. Yalnızca üretim dosyası değil, MP3'lerin kendisi pakettedir.

Native TypeScript kaynakları TypeScript ile dönüştürüldü; bu tam proje typecheck veya
gerçek Expo bağlaması testi değildir. AudioEngine React/Expo adaptörleriyle,
NativeServices ise kaynak izin listesiyle kontrol edildi. Her yeni piyano anahtarı
bir ses track bileşeni oluşturdu. Şifreleme kaynağı değişmedi. Resolver testleri
Metro adaptörüyle yapıldı; gerçek Metro bundler çalıştırılmadı.

Güncelleyici Linux'ta gerçek Node/zip/unzip araçlarıyla geçici proje klasörlerinde
çalıştırıldı. 0.5.4 + açık/kapalı test cüzdanı, saf 0.5.5 ve eski 0.5.4→0.5.5
betiğiyle gerçekten güncellenmiş klasör, sonra 0.5.6 geçişi test edildi. Ek olarak
0.5 ve 0.5.3'ten doğrudan geçiş denendi. Paket kilidi, bağımlılıklar, Expo kimliği,
özel ayar ve eski ses dosyası sentinel'leri korundu. Kod kişisel olarak değiştirilmişse,
SDK farklıysa, sembolik yol/traversal varsa ya da MP3 pakette bozulmuşsa işlem durdu.
Son doğrulama hatasında değiştirilen bütün dosyalar geri alındı. Idempotent ikinci
uygulama ve boşluklu klasör yolu kontrol edildi.

## Burada yapılmayanlar

Mac üzerinde npm/npx kurulumu, gerçek Metro iOS derlemesi, fiziksel iPhone/Expo Go,
WKWebView klavye/gesture/gerçek ses modülü/OS bildirim teslimi, GPU WebGL sürücü testi,
PDF açma ve export, fiziksel cihazda yedek geri yükleme ve gerçek kulaklıkta dinleme.
Bu sürümde telefon kilitlendiğinde seslerin durması değiştirilmedi.

## Telefon kontrolü

Yeni QR'da sürüm etiketini kontrol edin. Mağazada Japon · Sakura kataloğundan bir
ürün açın, satın alın ve Yerleştir'i seçin. Yeni Çay & Kilim parçasını hem bahçeye
hem kulübeye taşıyın. Yakınlaşın, dört yöne sürükleyin, Sığdır'a basın. Yetiştir'in
altından bir anıyı açıp yerini değiştirin. Yeni temaları deneyin. Sesler bölümünde
kıyı/ateşi tek başına, sonra düşük seviyede piyano ile dinleyin; rahatsız edici bir
geçiş veya donma varsa tam adımı ve `[LumaNote UI]` hatasını kaydedin.

Önizlemelerdeki not/jeton/alışveriş/bitki verileri yalnızca örnektir. Kullanıcının
kayıtları değildir ve kaynak uygulamanın açılış verisine eklenmez. Referans görseller
uygulamaya kopyalanmadı; yeni pikseller kodla çizildi. Font dosyası paylaşılmıyor.
