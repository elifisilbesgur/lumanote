# LumaNote Atölye — özgün ses tasarımı

Kıyı ve ateş MP3'leri `tools/generate-atelier-audio.py` ile bu projede üretildi.
0.5.7 sürümünde üç piyano dosyası, `tools/generate-piano-057.py` ile farklı
ölçü, tempo, nota düzeni ve tınıda yeniden üretildi. Okyanus/ateş değiştirilmedi.
Dışarıdan piyano örneği, melodi kaydı, ücretli ses paketi veya doğa kaydı kullanılmadı.
Kıyı ve ateş, doğal ortamı taklit etmeyi amaçlayan **sentez sesleridir**; saha kaydı
olarak etiketlenmemelidir. Üç piyano parçası yeni besteler ve piyano benzeri sentezdir;
klasik müzik repertuvarından alınmış kayıtlar değildir.

Dosyalar bu uygulamada kullanılmak, değiştirilmek ve uygulamayla dağıtılmak üzere
hazırlanmıştır. Bu dosyalar için üçüncü tarafa ödeme ya da atıf zorunluluğu getiren
bir ses örneği kullanılmamıştır. Münhasır telif koruması veya başka her bağlamda
hukuki uygunluk garantisi verilmez.

| Dosya | Başlık | Süre |
|---|---|---|
| ocean.mp3 | Kıyı Dalgaları | 126 sn |
| fire.mp3 | Odun Çıtırtısı | 126 sn |
| pianoMoon.mp3 | Gece Notları | 84 sn |
| pianoDawn.mp3 | Sabah Valsi | 84 sn |
| pianoSakura.mp3 | Camdaki Damlalar | 89,71 sn |

Stereo, 44.100 Hz, MP3 192 kb/s. Kaynak örnekleri aşırı taşmaya karşı sınırlandı;
uygulama birden çok kanalı karıştırırken toplam seviyeyi azaltır. Tekrarlı oynatmada
mevcut 1,5 saniyelik yumuşak geçiş kullanılır. Seslerin gerçekten doğal veya hoş
bulunması öznel olup fiziksel iPhone/kulaklıkta dinleme kontrolü burada yapılmadı.

Daha önce indirilen harici kayıtlar çalışma projesinin `assets/recordings` klasöründe
silinmeden tutulur. Bu sürümde kıyı/ateş kanalları paketlenmiş yeni tasarımları seçer.
Diğer kayıtların önceki lisansları geçerlidir; `Audio-Included.json` gerçekten
seçilen dosyaların güncel kaynağını gösterir. Sayısal bütünlük, süre ve kaynak ayrıntısı
`assets/atelier/manifest.json` dosyasındadır.
