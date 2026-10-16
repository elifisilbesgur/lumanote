<div align="center">

<img src="docs/readme/hero.svg" alt="LumaNote — odaklan, not al, bahçeni büyüt" width="100%">

<br>

**Odak oturumlarını, notları, planlamayı ve çalıştıkça büyüyen bir piksel bahçeyi tek uygulamada birleştiren Expo / React Native projesi.**

<br>

![Sürüm](https://img.shields.io/badge/sürüm-0.5.7-c9b8ff?style=for-the-badge&labelColor=141a2b)
![Expo](https://img.shields.io/badge/Expo-57-c9b8ff?style=for-the-badge&logo=expo&logoColor=white&labelColor=141a2b)
![React Native](https://img.shields.io/badge/React_Native-0.86-7fb2e5?style=for-the-badge&logo=react&logoColor=white&labelColor=141a2b)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-7fb2e5?style=for-the-badge&logo=typescript&logoColor=white&labelColor=141a2b)
![Node](https://img.shields.io/badge/Node-24-7cc29a?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=141a2b)

<sub>Arayüz etiketi: <code>LUMA-0.5.7-HOME-GREENHOUSE</code></sub>

<br><br>

<a href="#-uygulamada-neler-var">Özellikler</a> ·
<a href="#-hızlı-başlangıç">Hızlı başlangıç</a> ·
<a href="#-teknik-yapı">Teknik yapı</a> ·
<a href="#-rehberler">Rehberler</a> ·
<a href="#-test-jetonları-ve-kişisel-veriler">Kişisel veriler</a>

</div>

<img src="docs/readme/divider.svg" width="100%" alt="">

## 🌙 Kısa bir tur

<div align="center">
  <img src="docs/readme/tour.gif" alt="LumaNote ekran turu: bahçe, odak sayacı, notlar, ev, kış bahçesi, mağazalar ve sesler" width="100%">
  <br>
  <sub>Ekranlardaki notlar, mobilyalar ve bakiyeler örnek kayıtlardır; uygulama başlangıçta satın alınmış öğe veya kişisel çalışma geçmişi içermez.</sub>
</div>

<img src="docs/readme/divider.svg" width="100%" alt="">

## ✨ Uygulamada neler var?

<table>
<tr>
<td width="50%" valign="top">

### ⏱️ Odak ve planlama
Çalışma yöntemleri, çalışma / mola ayarları, tam ekran sayaç, haftalık özet ve
çalışma sonunda **jeton ödülü**. Mola süresi çalışma kazancı üretmez.

</td>
<td width="50%" align="center">
<img src="docs/readme/focus.svg" alt="Odak sayacı dolarken büyüyen fide" width="320">
</td>
</tr>
<tr>
<td valign="top">

### 📝 Notlar
Metin biçimlendirme, renkler, toplu seçim, çöp kutusu, kâğıt arka planları,
çizim alanı, tablo ve dosya ekleri. PDF görüntüleme ve işaretleme kaynakları da
bulunur.

</td>
<td valign="top">

### 🌸 Yaşayan bahçe
Tohum yetiştirme, anı bitkileri, hayvanlar, dekorlar, mevsimsel atmosferler ve
sınırları olan, iki parmakla yakınlaştırılabilen piksel sahne.

</td>
</tr>
<tr>
<td valign="top">

### 🏡 Ev ve kış bahçesi
Salon, mutfak, banyo, dinlenme odası, yatak odası ve camlı sera. Eşyalar alanlara
atanır; yön oklarıyla ya da **Düzenle** modunda sürüklenerek taşınır.

</td>
<td valign="top">

### 🛍️ Tematik mağazalar
Japon · Sakura, Çay & Kilim, Yılbaşı, Cadılar Bayramı ve Sera & Odalar
koleksiyonları. Bir eşyanın tek kopyası olur; odalar arasında taşınınca çoğalmaz.

</td>
</tr>
<tr>
<td colspan="2" valign="top">

### 🎹 Ses ve yedekleme
Katmanlı ortam sesleri, farklı ritim ve ölçülerde **özgün sentez piyano besteleri**,
dosya dışa / içe aktarma ve isteğe bağlı şifreli yedek akışı. Seslerin kaynak ve
lisans notları [`licenses/`](licenses/) klasöründedir. Sentez parçalar gerçek saha
veya akustik performans kaydı olarak sunulmaz.

</td>
</tr>
</table>

<details>
<summary><b>📸 Daha fazla ekran görüntüsü</b></summary>
<br>

| Kış bahçesi | Salon | Mutfak | Sakura bahçesi |
|:---:|:---:|:---:|:---:|
| <img src="docs/screenshots057/winter-garden.png" width="180"> | <img src="docs/screenshots057/salon.png" width="180"> | <img src="docs/screenshots057/kitchen.png" width="180"> | <img src="docs/screenshots056/garden.png" width="180"> |
| **Odak** | **Notlar** | **Sesler** | **Sera** |
| <img src="docs/screenshots053/focus.png" width="180"> | <img src="docs/screenshots054/writing.png" width="180"> | <img src="docs/screenshots056/piano.png" width="180"> | <img src="docs/screenshots057/greenhouse.png" width="180"> |

Genel bakış: [`docs/overview/uygulama.png`](docs/overview/uygulama.png)

</details>

<img src="docs/readme/divider.svg" width="100%" alt="">

## 🚀 Hızlı başlangıç

### 1 · Kurulum yapmadan kaynağı doğrula

Node kurulu bir Terminal'de, **bu klasörün içindeyken**:

```bash
node tools/verify.cjs
```

Bu kontrol npm paketlerini yüklemez; sürümü, başlangıç dosyalarını, üretilmiş
arayüzü, ses hash'lerini ve temel kaynak bütünlüğünü denetler. Gerçek iPhone testi değildir.

### 2 · Ayrı bir geliştirme kopyası olarak çalıştır

Proje `package.json` içinde **Node 24** ve **Expo 57** bağımlılıklarını tanımlar.
İlk kurulum internet erişimi ister; kurulu telefon projesinin yerine geçmez ve
telefon verilerini taşımaz.

```bash
npx --yes --package=node@24 --call 'node tools/setup.cjs'
```

`setup.cjs` npm paketlerini kurar, Expo 57 uyumunu kontrol eder, arayüzü yeniden
üretir ve Expo Go sunucusunu başlatır. Konsolda **bu klasörün tam yolunu** ve
`LUMA-0.5.7-HOME-GREENHOUSE` etiketini kontrol et. Hata olursa dur; eski klasörlerden
dosya kopyalayarak veya sürümleri rastgele değiştirerek devam etme.

### 3 · Kaynağı düzenledikten sonra

```bash
npm run build:ui   # tools/ui → nocturne/UI_HTML.ts + ONIZLEME.html
npm run verify     # kaynak bütünlüğü kontrolü
```

<details>
<summary><b>📦 Paket kilidi hakkında</b></summary>
<br>

Teslim edilen özgün 0.5.7 arşivinde `package-lock.json` yoktu; başka sürümün kilidi
kopyalanmadı veya doğrulanmamış bir kilit uydurulmadı. Başarılı ilk kurulumda oluşan
kilidi Git'e ekle. Bu nedenle mevcut Mac kurulumundaki kesin bağımlılık ağacının bu
arşivden birebir yeniden üretileceği garanti değildir. `npm ci` ancak geçerli bir kilit
dosyası oluştuktan sonra kullanılmalı.

Eski yerinde güncelleme yardımcıları (`*.command`, `tools/repair-existing.cjs`,
`README_TR.md`) geçmiş kaynak bütünlüğü için korunmuştur. Bu klasörü GitHub'da tutmak
için onları çalıştırman gerekmez; güncelleyiciyi eski `LumaNote_Nocturne_Final`
klasörüne rastgele uygulama.

</details>

<img src="docs/readme/divider.svg" width="100%" alt="">

## 🧩 Teknik yapı

```mermaid
flowchart LR
    A["index.js"] --> B["App.tsx<br/><sub>React Native · Expo</sub>"]
    B --> C["nocturne/UI_HTML.ts<br/><sub>WebView arayüzü</sub>"]
    U["tools/ui/<br/><sub>HTML · CSS · JS</sub>"] -- "npm run build:ui" --> C
    U -- "npm run build:ui" --> P["ONIZLEME.html"]
```

| Katman | Kullanılan yapı | Ana konum |
|---|---|---|
| Telefon uygulaması | TypeScript, React Native, Expo, WebView | `App.tsx`, `nocturne/` |
| Arayüz ve iş kuralları | HTML, CSS, JavaScript | `tools/ui/` |
| Piksel sahneler ve hareket | Canvas; lava temalarında WebGL ve yedek çizim | `tools/ui/` |
| Üretilmiş arayüz | Önizleme HTML'i ve WebView'in kullandığı TypeScript çıktısı | `ONIZLEME.html`, `nocturne/UI_HTML.ts` |
| Üretim ve doğrulama | Node.js / CommonJS | `tools/*.cjs` |
| Görsel / ses üreticileri ve tarihsel testler | Python, JavaScript | `tools/*.py`, `tests/` |

> [!IMPORTANT]
> Arayüz değişikliklerini **`tools/ui/`** içinde yap. `UI_HTML.ts` ve `ONIZLEME.html`
> aynı kaynaklardan üretilir; yalnızca birini elle düzenleme.

> [!NOTE]
> Dosya adında `v04`, `054`, `055` veya `056` bulunması onun gereksiz olduğu anlamına
> gelmez. Son sürüm bu birikimli modülleri de yükler; klasörleri isimlerine bakarak silme.

<img src="docs/readme/divider.svg" width="100%" alt="">

## 📚 Rehberler

| Amaç | Dosya |
|---|---|
| Uygulamayı ve kodu sıfırdan öğrenmek | [Görselli rehber — PDF](docs/rehber/LumaNote_Gorselli_Egitim_ve_Gelistirici_Rehberi.pdf) |
| Rehberi düzenlemek | [Görselli rehber — Word](docs/rehber/LumaNote_Gorselli_Egitim_ve_Gelistirici_Rehberi.docx) |
| Küçük örneklerle kod denemek | [Öğrenme atölyesi](examples/ogrenme-atolyesi/README.md) |
| Klasörü Terminal'den GitHub'a yüklemek | [GITHUBA_YUKLEME.md](GITHUBA_YUKLEME.md) |
| Paketin kaynağı, korunan dosyalar ve sınırlar | [Paket raporu](docs/GITHUB_PAKET_RAPORU.md) |
| 0.5.7 test kapsamı | [Özgün sürüm test raporu](docs/TEST_RAPORU_057.md) |
| Ses kaynakları ve lisanslar | [licenses/KAYNAKLAR.md](licenses/KAYNAKLAR.md) |

<img src="docs/readme/divider.svg" width="100%" alt="">

## 🪙 Test jetonları ve kişisel veriler

Bu kaynakta `LUMA_TEST_COINS_SWITCH = false`; 100.000.000 test jetonu otomatik verilmez.
Test cüzdanı ve kapatma / geçiş kodları korunmuştur, gerçek çalışma süresi uydurulmaz.
Depo telefondaki notları, bahçe yerleşimini veya test bakiyesini içermez.

> [!WARNING]
> Test jetonları açıkken oluşturulmuş bir yedeği, test anahtarı kapalı bu kopyada
> açarsan geçiş kodu test bütçesini ve testle alınmış öğeleri ayıklayabilir.
> Canlı verinin üzerinde yedeksiz test yapma ve kişisel kayıt yedeklerini depoya koyma.

## 🧭 Kapsam ve sınırlar

- Önceki test raporlarındaki rakamlar geçmiş çalıştırmalardır; bu pakette yeniden
  yapılmış telefon testleri olarak yorumlanmamalıdır.
- Fiziksel iPhone / Expo Go, yeni npm kurulumu, Metro iOS derlemesi, PDF uçtan uca
  akışı ve gerçek ses dinleme bu paketleme işinde yapılmadı.
- Arka planda / kilit ekranında sesin durması mevcut davranıştır.
- GitHub'a kaynak yüklemek App Store veya Google Play yayını değildir.

## 📄 Lisans

Projeye henüz bir açık kaynak lisansı atanmadı. Üçüncü taraf kaynak ve ses notları
[`licenses/`](licenses/) içinde korunur.

<br>

<div align="center">
<img src="docs/readme/divider.svg" width="100%" alt="">
<br>
<sub>🌙 <b>luma.</b> — her çalışma dakikası bir tohum.</sub>
</div>
