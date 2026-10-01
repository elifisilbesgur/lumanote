# LumaNote 0.5.7 — CC0 ses seçimi

Bu ses güncellemesi yalnızca `ocean`, `fire`, `pianoDawn`, `pianoSakura` kanallarını değiştirir. `rain`, `piano` ve `pianoMoon` dosyalarını ya da metadata kayıtlarını değiştirmez. İlk iki piyano CC0 diye yeniden lisanslanmaz. Piyano sırası aynı kalır; son iki seçeneğin başlıkları Kadife Piyano / Sakin Ezgi olur.

## Seçilen kaynaklar

| Kanal | Kaynak ve üretici | Üretim bilgisi | Lisans |
|---|---|---|---|
| Kıyı dalgaları | [Calm ocean waves — SamsterBirdies](https://freesound.org/people/SamsterBirdies/sounds/578524/) | Whidbey Island kıyı saha kaydı; üretici döngü olduğunu belirtiyor. | CC0 1.0 |
| Odun çıtırtısı | [Fireplace.wav — BonnyOrbit](https://freesound.org/people/BonnyOrbit/sounds/484337/) | Zoom H6 ile stereo odun ateşi saha kaydı. | CC0 1.0 |
| Kadife Piyano, üçüncü seçenek | [Sleepy Upright Piano Seamless Loop — blankie.rest](https://freesound.org/people/blankie.rest/sounds/859607/) | Logic Pro / Vintage Upright ile stüdyo üretimi. | CC0 1.0 |
| Sakin Ezgi, dördüncü seçenek | [Calm Ambient Piano Loop — Jadis0x](https://freesound.org/people/Jadis0x/sounds/832628/) | FL Studio ile stüdyo üretimi. | CC0 1.0 |

Kaynakların başlık, üretici, süre ve lisans sayfaları 1 Ekim 2026 tarihinde kontrol edildi. [CC0 açıklaması](https://creativecommons.org/publicdomain/zero/1.0/): hak sahibi, haklarından hukuken mümkün olan ölçüde vazgeçer; ticari kullanım, uyarlama ve dağıtım için lisans bedeli aranmaz. Başka kişilerin haklarının bulunmadığına dair garanti değildir. Kaynak bilgileri izlenebilirlik için saklanır. Bu sanatçılar LumaNote'u destekliyor/öneriyor anlamı çıkarılamaz.

## Gerçekte ne indiriliyor?

Oturum açma, API anahtarı veya ödeme gerektirmeyen, kaydın herkese açık yüksek kalite MP3 önizlemesi. Bunlar kaynak sayfasındaki özgün WAV/FLAC dosyaları değil. Orijinal MP3 baytları değiştirilmez; mevcut uygulama ses seviyesi ve yaklaşık 1,5 saniyelik döngü geçişi kullanılır. Piyano parçaları klasik bestelerin canlı akustik icra kayıtları olarak tanıtılmamalıdır; üreticiler dijital stüdyo üretimi bildiriyor.

Her indirme sırasında kaynak sayfasında CC0 bağlantısı ve kaydın kimliğine ait MP3 adresi kontrol edilir. MP3 başlığı/karesi, boyutu ve SHA-256 bilgisi kaydedilir. Bunlar dinleyerek kalite kontrolünün veya tüm dosyanın oynatılabilirliğini doğrulamanın yerine geçmez. Dört kayıttan biri doğrulanamazsa proje dosyalarının hiçbirine geçilmez. Bağlantı hatalarında HTML hata sayfaları MP3 diye yüklenmez.

`assets/cc0/manifest.json` seçimi `tools/build-ui.cjs` tarafından önce değerlendirilir. Seçili dosya bozulursa derleme hata verir; eski sentez sürümüne sessizce dönmez. Bu dizin, eski `assets/recordings` dizininden ayrıdır: önceki yağmur indirme komutu CC0 seçimini silmez. İlk iki piyano ve yağmurun hem dosyaları hem mevcut kayıt manifesti korunur.

## Kapsam dışı

Notlar, bahçe yerleşimi, jetonlar, iPad ekran yerleşimi, ses seviyeleri ve kaydedilmiş karışım tercihleri değiştirilmez. Ekran kilitliyken oynatma davranışı değişmez. Telefon/iPad ses motoru burada test edilmiş sayılmaz. Önizleme dosyasının indirilmesi, gerçek cihazda dinleyerek beğenileceği garantisi değildir.

## GitHub

Güncelleme başarıyla uygulandıktan sonra yeni `assets/cc0/` dosyalarını, güncellenen `tools/build-ui.cjs`, yeni `tools/ui/cc0-audio.js`, üretilen `nocturne/AudioAssets.ts` ve `nocturne/UI_HTML.ts`, lisans kayıtlarını birlikte commit edin. `.luma/` içindeki yerel geri dönüş kopyaları kişisel kalmalı. Kaynak sesler tek tek saklanır; uygulama çalışma sırasında internetten ses yayını yapmaz.
