# LumaNote 0.5.7 — Evim ve Kış Bahçem

Sürüm: **LUMA-0.5.7-HOME-GREENHOUSE** · 30 Eylül 2026

## Bu teslimde gerçekten çalıştırılanlar

| Grup | Başarılı / toplam |
|---|---:|
| Yeni odalar, katalog, satın alma, kayıt geçişi, modal katmanı ve ekran boyları | 67 / 67 |
| Dokunma, oda taşıma, çalışma/molalar, yazı biçimi ve tarayıcı ses çözme | 18 / 18 |
| Gerçek yerel dosya ve ZIP işlemleriyle yedekli güncelleyici | 25 / 25 |
| Üç MP3 dosyasının çözülmesi, süre, dalga örnekleri, metadata ve nota farklılığı | 18 / 18 |
| Kaynak sözdizimi / üretilmiş arayüz / ses bütünlüğü doğrulayıcısı | 62 / 62 |
| **Toplam doğrulama** | **190 / 190** |

Bu sayı fiziksel telefon testi sayısı değildir; önceki sürümlerin raporlarındaki
rakamlar bu toplama eklenmemiştir. Test kaynakları, JSON sonuçları ve komut çıktıları
`tests/057` içindedir.

## İşlev ve etkileşim kapsamı
Gerçek Chromium, `ONIZLEME.html` ve bellekte localStorage adaptörü kullanıldı.
Bu testler gerçek iOS kayıt dosyaları veya WKWebView değildir. Sahne ve modal
kontrolleri gerçek DOM/canvas üzerinde çalıştırıldı; iki parmak ve aşağı çekme
senaryolarının bir bölümü Chromium DevTools Protocol touch olayları ile, sürükleme
ve düğmelerin bir bölümü pointer/fare olayları ile denendi.

Seranın sahnedeki hit alanına tıklayarak girme; altı ayrı alan; eski room:true
kayıtlarının salonda kalması; tek eşyanın bir odaya atanması; başka odaya taşınınca
çoğalmaması; oda ayarlarının bağımsızlığı; kayıt reddinde alışveriş/taşıma/stil
değişiminin geri alınması; oda geçişinde başka alana ait öğenin görünmemesi denendi.

Yılbaşı (24), Cadılar Bayramı (24), Sera/Odalar (20) yeni öğelerinin hepsi ayrı
çizim tarifine sahiptir. Önceki Japon/Sakura (30) ve Çay/Kilim (12) katalogları
yerindedir. Test jetonu önce harcanır; tekrar normalize etmek yeni bütçe vermez.
Yeni yerleşimler veya alışverişler kullanıcıya kendiliğinden verilmez.

Notlarda toplu seçim çubuğu açıkken silme onayı açılarak hata durumu yeniden
kuruldu: çubuk gizlendi, modal düğmesine elementFromPoint ile erişilebildi, arka
plan inert oldu; Vazgeç seçimi korudu. Tümünü seç, çöpe taşı ve Geri al denendi.
Kalın/renk biçimlendirme ve kapatıp açma da yeniden kontrol edildi. Bu, iPhone'un
metin seçim tutamaçları/klavyesiyle yapılmış test değildir.

Bahçe temasında odaktan çıkış/giriş, bir dakikalık sayaçla başlat-duraklat-devam
ve simüle kalan süreyle kısmi kayıtta 3 jeton/dakika, tekrar bitirmede tek ödül ve
molaya ödül vermeme kontrol edildi. Gerçek OS bildirimleri çalıştırılmadı.
320/390/430 piksel dikey ve 844×390 yatay sayfa taşması kontrol edildi.

## Sesler
Üç parça FFmpeg ile PCM'e çözüldü; sonlu, sessiz olmayan ve sert kırpılmayan
örnekler doğrulandı. Stereo 44,1 kHz, MP3, süre ve SHA256 denetlendi. Gerçek
Chromium AudioContext decodeAudioData üç dosyayı da açtı. Üç ayrı ölçü (4/4, 3/4,
6/8), tempo (48, 108, 84) ve nota olay sayısı (78, 486, 127) kaydedildi.

Bu sayısal farklar, kullanıcının beğenisini veya gerçek piyano kadar doğal
bulunacağını garanti etmez. **Kulaklık/hoparlör üzerinden öznel dinleme testi
yapılmadı.** Yeni besteler özgün sentezdir; akustik performans kaydı değildir.
Okyanus/ateş dosyaları byte düzeyinde korunmuştur.

## Güvenli güncelleme
Linux üzerinde gerçek Node 22, zip ve unzip ile geçici proje klasörlerine
güncelleme uygulandı. 0.5.6 ana kaynakları, açık/kapalı test cüzdanı; ayrıca
0.5.4 ve 0.5.5 tam kaynaklarından doğrudan geçiş denendi. Dosya yolu boşlukları,
aynı işlemi ikinci kez uygulama, yanlış SDK, kişisel kod değişikliği, bozuk ses,
sembolik yol, manifest traversal, son doğrulamada hata ve tam geri alma test edildi.

package-lock, node_modules sentinel'i, eski kayıt ses sentinel'i, özel npm scripti,
Expo kimliği ve ek ayarlar korunmuştur. Test cüzdanı aç/kapat komutları çalıştırıldı.
Mac'te npx Node24 indirme veya gerçek Expo sunucusu başlatılmadı.

## Burada yapılmayanlar
Fiziksel iPhone/Expo Go, gerçek npm kurulumu, Metro iOS paketleme, native modül
bağlamaları, WKWebView gerçek klavye/gesture/ekran yönü, OS bildirim teslimi,
PDF çizimi/export, gerçek cihazda yedek geri yükleme ve fiziksel ses dinleme.
Yeni sürüm kilit ekranı ses davranışını veya PDF motorunu değiştirmez.

## Telefon kabul adımları
Uygulamada sürüm etiketini kontrol et. Bir deneme notunu seç, silme onayını
aç, Vazgeç'e bas; seçim çubuğu onayın üzerinde olmamalı. Seraya gir; bir öğeyi
al, seraya yerleştir, okla taşı ve başka odaya taşı. Uygulamayı yeniden açınca
konumu korunsun. Piyano seçeneklerini tek tek, aynı ses düzeyinde dinle.

Önizlemeler gerçek koddan örnek kayıt ve mobilyalarla oluşturuldu. Örnekler
uygulamanın açılış verisine eklenmez. Gönderilen referans fotoğraf, ücretli
model veya font dosyası pakete dahil edilmedi.
