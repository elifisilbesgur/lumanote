# GitHub kaynak paketleme raporu

**Hazırlama tarihi:** 1 Ekim 2026  
**Uygulama kaynak sürümü:** 0.5.7  
**Arayüz etiketi:** `LUMA-0.5.7-HOME-GREENHOUSE`

## Kaynak ve amaç

Bu paket, sohbette teslim edilmiş
`LumaNote_v057_Evim_ve_Kis_Bahcem_Tam_Proje.zip` arşivinin tek kök klasörde,
GitHub'a kaynak olarak aktarılabilecek düzenidir. Daha eski bir sürüm yeniden
adlandırılmamıştır. `package.json`, `app.json`, `App.tsx` ve üretilmiş arayüz son
0.5.7 sürümüne aittir.

Kaynak ZIP SHA-256:

```text
920958c6d035d74c25301572c1957aecff21eca12392d06773a6cbf431f8cd7c
```

Bu paket **Mac'teki bir klasörün güncel disk yedeği değildir**. Kullanıcının Expo
kurulumundan, GitHub hesabından veya telefondaki verilerden dosya alınmamıştır.
GitHub'a yükleme yapılmamıştır.

## Neler korundu, neler eklendi?

Özgün arşivdeki **282 dosyanın** tamamı korunur. Bunların uygulama, ses, resim,
bağımlılık tanımı ve geçmiş test dosyaları dahil **280 tanesi byte düzeyinde aynı**
tutulur. `.gitignore` GitHub paylaşımı için genişletilir; `SOURCE_FILES.sha256`
ise yeni paketin içindekilere göre yeniden hesaplanır. Eski ignore ve hash listesi
`docs/provenance/` içinde ayrıca saklanır.

Yeni `README.md`, `GITHUBA_YUKLEME.md`, `.gitattributes`, `.nvmrc` ve
`GITHUB_PACKAGE.json` eklenmiştir. Görselli eğitim rehberinin PDF / Word dosyaları
hiç değiştirilmeden `docs/rehber/` içine kopyalanır. Son ekran / katalog görselleri
`docs/overview/` içinde; öğrenme örnekleri `examples/ogrenme-atolyesi/` içindedir.

Önceki kaynakta bulunan eski tarihli test raporları ve güncelleyici dosyaları silinmez.
Bunlar geçmiş kaynak delili / bakım yardımcılarıdır. `docs/SOURCE.json` gibi bazı
eski dosyalar önceki teslimatlara ait metadatadır; bu yeniden paketleme için güncel
kaynak açıklaması kökteki `GITHUB_PACKAGE.json` ve bu rapordur.

## Bu paketlemede çalıştırılan doğrulamalar

- Kaynak uygulama dosyalarının özgün 0.5.7 arşivindeki hash'lerle eşleşmesi.
- `package.json` ve `app.json` sürüm / başlangıç bilgisinin kontrolü.
- `node tools/verify.cjs`: özgün doğrulayıcının **62 kaynak kontrolü**.
- Ayrı bir geçici kopyada `node tools/build-ui.cjs`: dört üretilmiş dosyanın
  (`ONIZLEME.html`, `UI_HTML.ts`, `AudioAssets.ts`, `Audio-Included.json`) aynı olması.
- Metin kaynaklarında sınırlı özel anahtar, GitHub token, OpenAI anahtarı ve AWS
  erişim anahtarı örüntü taraması. Şüpheli eşleşme bulunmadı; bu tam güvenlik denetimi değildir.
- `node_modules`, `.git`, `.expo`, `.luma`, özel anahtar ve font dosyalarının
  teslim klasöründe bulunmaması; büyük/küçük harf yol çakışması olmaması.
- Her dosyanın 100 MiB'tan küçük olması. En büyük dosya `ONIZLEME.html`:
  **19.801.592 bayt** (yaklaşık 18,9 MiB).
- Rehber PDF / Word dosyalarının özgün dosyalarla aynı olması; yeni README yerel
  bağlantılarının varlığı.
- Geçici bir kopyada gerçek `git init`, `git add`, `git commit` ve yerel bare
  Git deposuna `git push`; kaynak / belgelerin eksiksiz takibi ve commit kimliği eşleşmesi.
- `.gitignore` kurallarının bağımlılık, gizli ayar, anahtar, arşiv ve kişisel
  yedek örneklerini dışarıda bırakması.
- Teslim ZIP'i oluşturulduktan sonra ZIP CRC kontrolü ve dosya hash manifesti kontrolü.

Yerel test deposu yalnızca geçici çalışma alanında oluşturulur; onun `.git`
klasörü ve örnek commit kimliği teslim ZIP'ine eklenmez.

## Paket kilidi ve ilk kurulum

Özgün 0.5.7 tam kaynak arşivinde `package-lock.json` bulunmuyor.
`package.json` içindeki bağımlılık tanımları değiştirilmedi; başka sürümden kilit
alınmadı ve npm kurulumu bu paketleme ortamında yapılmadı. İlk başarılı yerel
kurulumun oluşturduğu kilit sonradan Git'e eklenebilir. Bu aşamada tam bağımlılık
ağacının tekrar üretilebilirliği doğrulanmış değildir.

`npm ci` komutunu henüz kilit dosyası yokken kullanma. Mac'teki 0.4 klasörünün
`package-lock.json` veya `node_modules` klasörünü bu projeye kopyalama.

## Kişisel veriler ve test bakiyesi

Test jetonu kaynak anahtarı, özgün pakette olduğu gibi **false** değerindedir.
Kullanıcının gerçek veya test jetonu bakiyesi bu arşive alınmamıştır. Test bütçesi
geçiş kodu korunur. Test bütçesi açıkken kaydedilmiş bir veriyi bu kapalı kaynakta
açmak, test bakiyesini / testle satın alınmış ürünleri temizleyebilir.

Telefonun notları, çalışma geçmişi, dosya ekleri, bahçesi ve kurulu Expo kimliği
ayrı konulardır. Kod paketini açmak bu verileri otomatik olarak içeri aktarmaz.

## Burada yapılmayanlar

Gerçek GitHub ağına veya hesaba yükleme, Mac üzerinde npm kurulumu, Metro iOS
paketleme, fiziksel iPhone / Expo Go testi, ses dinleme, PDF uçtan uca işlemleri,
şifreleme güvenlik denetimi ve önceki bütün uygulama regresyon testleri bu
paketleme çalışmasının parçası değildir. Özgün 0.5.7 raporundaki **190** sayısı
geçmiş sürüm testlerini anlatır; bu yeniden paketleme işinin yeni test sayısı değildir.

Bu paket uygulama geliştirmesi yapmaz ve yeni bir 0.5.8 sürümü olarak sunulmaz.

## Resmî başvuru

GitHub'ın [dosya boyutu sınırları](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
ve [yerel kaynak yükleme akışı](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)
1 Ekim 2026'da kontrol edildi. ZIP indirmek için tek dosyadır; GitHub deposuna
ZIP'in içindeki kaynak dosyaları gönderilmelidir.
