import fs from 'fs'
import path from 'path'

export const AUDIO_DIR = path.join(process.cwd(), 'audio')

export type AudioVoice = 'yunus' | 'mert' | 'lisa' | 'gulsu'
export type AudioCategory = 'universal' | 'restoran' | 'guzellik' | 'saglik' | 'kuafor'

// businessType string → audio category
export function resolveCategory(businessType: string): AudioCategory {
  const t = businessType.toLowerCase()
  if (t.includes('restoran') || t.includes('kafe') || t.includes('bar') || t.includes('yemek')) return 'restoran'
  if (t.includes('güzellik') || t.includes('guzellik') || t.includes('spa') || t.includes('masaj') || t.includes('estetik')) return 'guzellik'
  if (t.includes('sağlık') || t.includes('saglik') || t.includes('klinik') || t.includes('diş') || t.includes('dis') || t.includes('psiko') || t.includes('terapi')) return 'saglik'
  if (t.includes('kuaför') || t.includes('kuafor') || t.includes('berber') || t.includes('saç') || t.includes('sac')) return 'kuafor'
  return 'universal'
}

// Sentence map: category → [key, text][]
const SENTENCES: Record<AudioCategory, Array<[string, string]>> = {
  universal: [
    ['merhaba_1', 'Merhaba, hoş geldiniz! Size nasıl yardımcı olabilirim?'],
    ['merhaba_2', 'Merhaba! Bugün size nasıl yardımcı olabilirim?'],
    ['merhaba_3', 'İyi günler! Sizi aramızda görmekten mutluluk duyarız.'],
    ['merhaba_4', 'Merhaba, ben dijital asistanınızım. Nasıl yardımcı olabilirim?'],
    ['merhaba_5', 'Hoş geldiniz! Rezervasyon için doğru yerdesiniz.'],
    ['tarih_sor', 'Hangi tarihte randevu almak istersiniz?'],
    ['saat_sor', 'Saat tercihiniz nedir?'],
    ['isim_sor', 'Adınızı ve soyadınızı öğrenebilir miyim?'],
    ['telefon_sor', 'Telefon numaranızı alabilir miyim?'],
    ['email_sor', 'E-posta adresinizi paylaşır mısınız?'],
    ['kisi_sor', 'Kaç kişilik rezervasyon yapmak istersiniz?'],
    ['ozel_istek', 'Herhangi bir özel isteğiniz var mı?'],
    ['ilk_ziyaret', 'Daha önce bizi tercih ettiniz mi?'],
    ['onay_1', 'Rezervasyonunuz başarıyla oluşturuldu.'],
    ['onay_2', 'Randevunuz onaylandı, sizi bekliyoruz.'],
    ['onay_3', 'Harika! Her şey tamam, görüşmek üzere.'],
    ['onay_bildirim', 'Rezervasyon detaylarınızı SMS ve e-posta ile ilettik.'],
    ['teyit_sor', 'Randevunuzu onaylamak için lütfen Evet deyin veya bir tuşuna basın.'],
    ['tekrar', 'Bilgileri doğru anladım mı? Bir kez daha tekrarlayayım.'],
    ['iptal_1', 'Rezervasyonunuzu iptal etmek istediğinizi anlıyorum.'],
    ['iptal_2', 'Rezervasyonunuz iptal edildi. Tekrar görüşmek dileğiyle.'],
    ['degisiklik_sor', 'Randevunuzu değiştirmek ister misiniz?'],
    ['yeni_tarih', 'Yeni tarih tercihiniz nedir?'],
    ['degisiklik_onay', 'Değişikliğiniz kaydedildi.'],
    ['dolu_1', 'Üzgünüm, seçtiğiniz saat dolu. Başka bir saat deneyebilir miyiz?'],
    ['dolu_2', 'Maalesef bu tarihte müsait yerimiz bulunmamaktadır.'],
    ['hata_1', 'Bir sorun oluştu, lütfen tekrar dener misiniz?'],
    ['anlayamadim', 'Girdiğiniz bilgileri doğrulayamadım, tekrar söyler misiniz?'],
    ['ses_yok', 'Sizi doğru anlayamadım, biraz daha yüksek sesle söyler misiniz?'],
    ['hatirlatma_1', 'Yarınki randevunuz için sizi aradık, iyi günler.'],
    ['hatirlatma_2', 'Randevunuza iki saat kaldı, sizi bekliyoruz.'],
    ['hatirlatma_iptal', 'Randevunuzu iptal etmek isterseniz bizi arayabilirsiniz.'],
    ['veda_1', 'Teşekkür ederiz, iyi günler dileriz.'],
    ['veda_2', 'Görüşmek üzere, kendinize iyi bakın.'],
    ['veda_3', 'Bizi tercih ettiğiniz için teşekkürler.'],
    ['veda_4', 'İyi günler, hoşça kalın.'],
    ['baska_yardim', 'Başka bir konuda yardımcı olabilir miyim?'],
    ['veda_kisa', 'Görüşmek üzere!'],
    ['sayi_0', 'sıfır'], ['sayi_1', 'bir'], ['sayi_2', 'iki'], ['sayi_3', 'üç'],
    ['sayi_4', 'dört'], ['sayi_5', 'beş'], ['sayi_6', 'altı'], ['sayi_7', 'yedi'],
    ['sayi_8', 'sekiz'], ['sayi_9', 'dokuz'], ['sayi_10', 'on'], ['sayi_11', 'on bir'],
    ['sayi_12', 'on iki'], ['sayi_13', 'on üç'], ['sayi_14', 'on dört'], ['sayi_15', 'on beş'],
    ['sayi_16', 'on altı'], ['sayi_17', 'on yedi'], ['sayi_18', 'on sekiz'], ['sayi_19', 'on dokuz'],
    ['sayi_20', 'yirmi'], ['sayi_21', 'yirmi bir'], ['sayi_22', 'yirmi iki'], ['sayi_23', 'yirmi üç'],
    ['sayi_30', 'otuz'], ['sayi_45', 'kırk beş'],
    ['gun_pazartesi', 'Pazartesi'], ['gun_sali', 'Salı'], ['gun_carsamba', 'Çarşamba'],
    ['gun_persembe', 'Perşembe'], ['gun_cuma', 'Cuma'], ['gun_cumartesi', 'Cumartesi'],
    ['gun_pazar', 'Pazar'], ['gun_bugun', 'bugün'], ['gun_yarin', 'yarın'],
    ['ay_ocak', 'Ocak'], ['ay_subat', 'Şubat'], ['ay_mart', 'Mart'], ['ay_nisan', 'Nisan'],
    ['ay_mayis', 'Mayıs'], ['ay_haziran', 'Haziran'], ['ay_temmuz', 'Temmuz'],
    ['ay_agustos', 'Ağustos'], ['ay_eylul', 'Eylül'], ['ay_ekim', 'Ekim'],
    ['ay_kasim', 'Kasım'], ['ay_aralik', 'Aralık'],
    ['baglac_saat', 'saat'], ['baglac_icin', 'için'], ['baglac_kisilik', 'kişilik'],
    ['baglac_masa', 'masa'], ['baglac_randevu', 'randevu'], ['baglac_ve', 've'],
    ['baglac_tamam', 'tamam'], ['baglac_harika', 'harika'], ['baglac_tesekkur', 'teşekkürler'],
  ],
  restoran: [
    ['merhaba_1', 'Merhaba, lezzetli bir deneyim için doğru yerdesiniz!'],
    ['merhaba_2', 'Hoş geldiniz! Masa rezervasyonu için yardımcı olmaktan mutluluk duyarım.'],
    ['merhaba_3', 'Merhaba! Özel bir gün mü kutluyorsunuz, yoksa keyifli bir yemek mi planlıyorsunuz?'],
    ['kisi_sor', 'Kaç kişilik bir masa ayırtmak istersiniz?'],
    ['mekan_sor', 'İç mekan mı, dış mekan mı tercih edersiniz?'],
    ['sigara_sor', 'Sigara içilen bölümde mi, içilmeyen bölümde mi oturmak istersiniz?'],
    ['ozel_gun', 'Doğum günü veya özel bir kutlama mı var?'],
    ['diyet', 'Menümüzde vejetaryen ve vegan seçeneklerimiz mevcuttur, belirtmek ister misiniz?'],
    ['alerji', 'Alerjiniz olan bir gıda var mı?'],
    ['cocuk', 'Bebek sandalyesi veya çocuk menüsü ister misiniz?'],
    ['pencere', 'Pencere kenarı masa ister misiniz?'],
    ['dekor', 'Özel dekorasyon veya çiçek hazırlamamızı ister misiniz?'],
    ['mutfak_bilgi', 'Mutfağımız Türk ve Akdeniz mutfağından oluşmaktadır.'],
    ['menu_bilgi', 'Günlük özel menümüz için lütfen web sitemizi ziyaret edin.'],
    ['kahvalti', 'Açık büfe kahvaltımız hafta sonları sunulmaktadır.'],
    ['otopark', 'Ücretsiz otopark hizmetimiz bulunmaktadır.'],
    ['vale', 'Vale park hizmetimizden yararlanabilirsiniz.'],
    ['onay_1', 'Masanız hazırlandı, afiyet şimdiden!'],
    ['onay_2', 'Rezervasyonunuz alındı, lezzetli bir yemek dileriz.'],
    ['onay_3', 'Sizi en güzel masada ağırlamaktan mutluluk duyacağız.'],
    ['gec_kalma', 'Geç kalmanız durumunda lütfen bizi arayın, masanızı on beş dakika saklarız.'],
  ],
  guzellik: [
    ['merhaba_1', 'Merhaba, kendinizi şımartmak için doğru yere geldiniz!'],
    ['merhaba_2', 'Hoş geldiniz! Dinlendirici bir deneyim için buradayız.'],
    ['merhaba_3', 'Merhaba, bugün kendinize özel zaman ayırıyorsunuz, harika bir seçim!'],
    ['hizmet_sor', 'Hangi hizmetimizden yararlanmak istersiniz?'],
    ['hizmet_liste', 'Masaj, cilt bakımı veya vücut bakımı tercihlerimiz mevcuttur.'],
    ['amac_sor', 'Rahatlama mı, arındırma mı yoksa canlandırma mı tercih edersiniz?'],
    ['sure_sor', 'Seans sürenizi belirleyelim: elli dakika mı, seksen dakika mı?'],
    ['cift_sor', 'Çift veya tekli seans mı tercih edersiniz?'],
    ['cilt_tipi', 'Cilt tipiniz hakkında bilgi verir misiniz?'],
    ['alerji', 'Herhangi bir alerjiniz veya hassasiyetiniz var mı?'],
    ['hamile', 'Hamile misiniz? Bazı hizmetlerimiz için bilmemiz gerekiyor.'],
    ['terapist_sor', 'Belirli bir terapist tercihiniz var mı?'],
    ['aromaterapi', 'Aromaterapi tercih eder misiniz?'],
    ['sicak_tas', 'Sıcak taş masajı eklemek ister misiniz?'],
    ['erken_gel', 'Seansınızdan on dakika önce gelmenizi öneririz.'],
    ['havlu', 'Havlu ve terlik hizmetimiz ücretsizdir.'],
    ['su', 'Su içmenizi tavsiye ederiz, seansınızdan sonra su ikram edilecektir.'],
    ['onay_1', 'Randevunuz hazır, kendinizi iyi hissedeceksiniz!'],
    ['onay_2', 'Seansınız onaylandı. Gevşemeye hazır olun!'],
    ['onay_3', 'Sizi bekliyoruz, güzel bir deneyim geçireceğinizden eminiz.'],
  ],
  saglik: [
    ['merhaba_1', 'Merhaba, kliniğimizi aradığınız için teşekkür ederiz.'],
    ['merhaba_2', 'Hoş geldiniz, sağlığınız için doğru adımı attınız.'],
    ['merhaba_3', 'Merhaba, randevu merkezimiz ile görüşüyorsunuz.'],
    ['uzman_sor', 'Hangi uzmanlık alanı için randevu almak istersiniz?'],
    ['kayit_sor', 'Daha önce kliniğimize başvurdunuz mu?'],
    ['tc_sor', 'T.C. kimlik numaranızı öğrenebilir miyim?'],
    ['sigorta_sor', 'Sigorta bilgilerinizi paylaşır mısınız?'],
    ['sgk_sor', 'SGK veya özel sigorta mı kullanmak istersiniz?'],
    ['sikayet_sor', 'Şikayetinizi kısaca belirtebilir misiniz?'],
    ['kronik', 'Kronik bir hastalığınız veya süregelen bir tedaviniz var mı?'],
    ['ilac_sor', 'Kullandığınız ilaçlar var mı?'],
    ['acil_sor', 'Acil randevu mu, normal randevu mu tercih edersiniz?'],
    ['terapi_turu', 'Bireysel mi, çift terapisi mi, aile terapisi mi tercih edersiniz?'],
    ['online_seans', 'Online seans imkânımız da mevcuttur.'],
    ['gizlilik', 'Seans bilgileriniz tamamen gizli tutulmaktadır.'],
    ['ilk_seans', 'İlk seans değerlendirme seansıdır, randevunuz altmış dakika sürecektir.'],
    ['dis_tur', 'Kontrol mü, tedavi mi yoksa estetik uygulama mı istiyorsunuz?'],
    ['dis_agri', 'Diş ağrınız var mı?'],
    ['onay_1', 'Randevunuz oluşturuldu, sağlıklı günler dileriz.'],
    ['onay_2', 'Doktorunuz sizi belirlenen saatte bekleyecektir.'],
    ['iptal_bilgi', 'Randevunuzdan yirmi dört saat önce iptal için lütfen bizi arayın.'],
    ['belgeler', 'Yanınızda kimlik ve sigorta kartınızı getirmenizi rica ederiz.'],
    ['ac_karin', 'Açık karnına gelmeniz gerekmektedir.'],
  ],
  kuafor: [
    ['merhaba_1', 'Merhaba! Harika bir görünüm için doğru yerdesiniz.'],
    ['merhaba_2', 'Hoş geldiniz, saçlarınızı emanet ettiğiniz için teşekkürler.'],
    ['merhaba_3', 'Merhaba, yeni bir görünüm için buradayız!'],
    ['hizmet_sor', 'Hangi hizmetimizi almak istersiniz?'],
    ['islem_sor', 'Saç kesimi mi, renklendirme mi yoksa bakım mı?'],
    ['stilist_sor', 'Belirli bir stilist tercihiniz var mı?'],
    ['sac_tipi', 'Saçınızın uzunluğu ve tipi nedir?'],
    ['kimyasal', 'Daha önce kimyasal işlem yaptırdınız mı?'],
    ['renk_sor', 'Hangi renk tonu düşünüyorsunuz?'],
    ['referans', 'Referans fotoğrafınız var mı?'],
    ['teknik_sor', 'Balayaj mı, ombre mi, tek renk mi istiyorsunuz?'],
    ['berber_islem', 'Saç kesimi, sakal tıraşı veya ikisi birden mi?'],
    ['sakal_sor', 'Sakalınızı kesmemizi ister misiniz, şekillendirmemizi mi?'],
    ['ustura', 'Klasik ustura tıraşı ister misiniz?'],
    ['maske', 'Saç bakım maskesi eklemek ister misiniz?'],
    ['kas', 'Kaş alma hizmetimizden yararlanmak ister misiniz?'],
    ['onay_1', 'Randevunuz alındı, şık görünmeye hazır olun!'],
    ['onay_2', 'Stilistiniz sizi belirlenen saatte bekleyecektir.'],
    ['onay_3', 'Rezervasyonunuz onaylandı, güzel bir deneyim dileriz.'],
    ['bilgi_1', 'Randevunuzdan önce saçınızı yıkamanıza gerek yoktur.'],
  ],
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}

// text → { category, key }
const LOOKUP = new Map<string, { category: AudioCategory; key: string }>()
for (const [cat, items] of Object.entries(SENTENCES) as [AudioCategory, Array<[string, string]>][]) {
  for (const [key, text] of items) {
    LOOKUP.set(normalize(text), { category: cat, key })
  }
}

export function findAudioFile(answer: string, businessType: string, voice: AudioVoice): string | null {
  const match = LOOKUP.get(normalize(answer))
  if (!match) return null

  const businessCategory = resolveCategory(businessType)

  // Try category-specific file first (same key), then the matched category, then universal
  const candidates: string[] = []

  if (match.category !== 'universal' && match.category === businessCategory) {
    candidates.push(path.join(AUDIO_DIR, match.category, voice, `${match.key}.mp3`))
  }
  if (match.category === 'universal') {
    candidates.push(path.join(AUDIO_DIR, 'universal', voice, `${match.key}.mp3`))
  }
  if (match.category !== 'universal') {
    candidates.push(path.join(AUDIO_DIR, match.category, voice, `${match.key}.mp3`))
  }

  for (const p of candidates) {
    try {
      fs.accessSync(p, fs.constants.R_OK)
      return p
    } catch {
      // continue
    }
  }
  return null
}
