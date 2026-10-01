# LumaNote 0.5.7 — Evim & Kış Bahçem

Sürüm etiketi: **LUMA-0.5.7-HOME-GREENHOUSE**

Bu klasör tam Expo kaynak projesidir. Önceki ZIP'leri sırasıyla uygulamak gerekmez.
Mevcut çalışan `LumaNote_Yasayan_Bahce` projesi için önerilen yol:

1. Bu klasörü `LumaNote_057_Tam_Proje` adıyla Masaüstü'ne taşı.
2. Aktif çalışmayı bitir/kaydet. Önceki Expo Terminal'inde Control+C yap.
3. `bash "$HOME/Desktop/LumaNote_057_Tam_Proje/MEVCUT_PROJEYI_DUZELT.command"`
4. Oluşan yeni QR kodunu okut; Ayarlar'daki sürüm etiketini kontrol et.

Betik önce kod ZIP'i alır ve doğrular; telefonda bir veri silme veya içe aktarma
işlemi yapmaz. Mevcut projenin bağımlılıklarını, kilit dosyasını ve Expo kimliğini
korur. Test jetonu eklentisi kuruluysa açık/kapalı ayarını korur; yeniden jeton
vermez. Bilinmeyen kişisel kaynak değişikliklerine rastlarsa üzerine yazmadan durur.
Kod ZIP'i telefondaki kişisel kayıtların yedeği değildir. Kodu güncellemeden önce
aktif not veya çalışmayı kaydetmiş olmak önemlidir.

## Kış bahçesi ve odalar
Bahçedeki seraya dokun veya sahnenin altındaki **Sera** düğmesini kullan.
Ev için kulübeye dokun veya **Evim**'i seç. Her alan dikey, bahçe boyutunda bir
sahnedir. Üstteki **Odalar** ya da alttaki oda düğmeleriyle geçiş yapabilirsin.
Evde salon, mutfak, banyo, dinlenme odası ve yatak odası; ayrıca kış bahçesi var.

Eski ev içi eşyaların başlangıç salonunda kalır. Yeni odalar döşenebilir boş
alanlardır; satın alma veya hazır düzen kendiliğinden uygulanmaz. Kış bahçesinin
camları, ahşap iskeleti, sabit kenar bitkileri ve ışıkları mimarinin parçasıdır.

**Mağaza → Sera & Odalar** içinde 10 kış bahçesi, 5 mutfak, 5 banyo eşyası vardır.
Mevcut ev eşyaları da her odada veya serada kullanılabilir. Yeni bir parçayı al,
**Yerleştir** ve hedef odayı seç. Bir eşyanın tek kopyası bulunur; başka odaya
taşıdığında iki kez alınmaz veya çoğalmaz. **Koleksiyon → eşya** ile de taşıyabilirsin.
**Düzenle** modunda seçili eşyayı sürükle veya yön oklarıyla yerleştir.
Yeni odalarda aynı anda toplam 180 yerleştirilmiş öğe sınırı vardır.

## Tematik mağazalar
**Yılbaşı:** 24 yeni model; hediye kızağı, kardan adam, ışıklı süsler, kurabiye evi,
buz pisti, şenlik piyanosu ve diğerleri.
**Cadılar Bayramı:** 24 yeni model; hayalet, kazan, kapılar, balkabağı süsleri,
şakacı mezar taşı, iksir rafı ve diğerleri.
Bunlar dekorlardır; bazı hayvan şekilli modeller bağımsız yol arkadaşı değildir.
Özel hava modlarını satın alma zorunluluğu yoktur. Tek satın alımla sahip olunur.
Japon · Sakura ve Çay & Kilim koleksiyonları korunmuştur.

## Basitleştirilen bahçe araçları
Tam ekranın yanındaki Sığdır düğmesi kaldırıldı; iki parmakla yakınlaştırma ve
yakınken sınırlar içinde gezinme sürer. Boş zemine çift dokunmak yakınlaştırmayı
başa alır. Bahçe dışına boş alan taşmaz. **Bahçemi tema yap** bağlantıları bahçe ve
hava menüsünden kaldırıldı; bahçe teması Ayarlar → Görünüm içinden seçilebilir.
**Hazır düzen** kaldırıldı; zemin boyama ve kişisel yerleşimler korunur.

## Not seçimi düzeltmesi
Toplu işlem çubuğu silme onayının üzerine çıkmaz. Onay menüsü açılınca arka
işlem çubuğu ve gezinme gizlenir, etkileşime kapanır. Vazgeçince seçimin korunur.
Normal silme çöp kutusuna taşır; Geri al ve çöp kutusundan geri getirme devam eder.

## Birbirinden farklı piyanolar
Sesler içindeki mevcut üç yeni piyano anahtarı farklı bestelerle değiştirildi:
- Gece Notları — 48 BPM, 4/4, yavaş ve seyrek.
- Sabah Valsi — 108 BPM, 3/4, hareketli bas-akor eşliği.
- Camdaki Damlalar — 84 BPM, 6/8, üst oktavlarda aralıklı pentatonik melodi.

Dosyalar projeye ait özgün sentez besteleridir; gerçek akustik piyano performansı
olarak sunulmaz. Ücretli kayıt veya örnek ses kullanılmadı. MP3'ler ZIP içinde
çevrimdışı çalışmak üzere hazırdır. Kaydedilmiş karışımların seviyeleri korunur.
Okyanus/ateş ve eski orijinal piyano seçeneği bu sürümde değiştirilmedi. Telefon
kilitlenince sesin durması önceki sürümle aynıdır.

## Tam projeyi ayrı çalıştırma
Mevcut projeyi güncellemek yerine bu klasörü ayrı açmak için BASLAT.command
kullanılabilir. Bu yol ilk kurulumda internet/paket kurulumu ister ve mevcut
projedeki kimlik/kurulumun birebir kopyası değildir. Normal kullanımda yukarıdaki
yerinde güncelleme yöntemi tercih edilir.

## Kaynak ve test
Arayüz kaynakları `tools/ui`; derleme `node tools/build-ui.cjs`. Oluşan
`nocturne/UI_HTML.ts` veya `ONIZLEME.html` tek başına elle düzenlenmemelidir.
Piyano ve çizim üretim kaynakları `tools/generate-piano-057.py` ve
`tools/generate-haven-art.py` içindedir. Kullanmak için üreticileri çalıştırmak
gerekmez. Yeni testlerin ham sonuçları `tests/057` içindedir. Fiziksel iPhone/Expo
Go, gerçek Metro paketleme ve kulaklıkta dinleme bu ortamda test edilmedi.
