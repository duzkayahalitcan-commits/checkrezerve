// ============================================================
// W-79: Asistan Hitap Zekası — Cinsiyet tespiti + işletme tipi
// Türkçe isimden cinsiyet tahmini (Bey/Hanım) ve unisex çözümü.
// /api/ai-assistant/chat, /api/ai-chatbot, /api/chat kullanır.
// ============================================================

export type GenderGuess = 'male' | 'female' | 'unisex' | 'unknown'

// ─── Türkçe isim sözlükleri (yaygın isimler) ─────────────────
// Not: Bu listeler kapsamlı değildir; bilinmeyen isim → 'unknown'
// döner ve sistem cinsiyetsiz hitap kullanır (güvenli varsayılan).
export const MALE_NAMES = new Set([
  // Temel
  'ahmet','mehmet','mustafa','halit','halil','emre','mert','burak','can','kaan',
  'onur','serkan','volkan','tarkan','hakan','berk','berkay','efe','yusuf','omer',
  'ömer','ali','veli','osman','hüseyin','hüseyin','ibrahim','ismail','ismail',
  'murat','murathan','kemal','atilla','gökhan','göktürk','tolga','turgay','ugur',
  'uğur','barış','baris','tarik','tarık','selim','celal','necip','kerem',
  'adem','cihan','cüneyt','cuneyt','eren','fırat','firat','hüseyin','kaan',
  'muhammet','ramazan','salih','sami','serdar','tuncay','umut','zeki',
  'bülent','bulent','cengiz','davut','ferhat','görkem','gorkem','harun','ismet',
  'kadir','levent','mahmut','nihat','oğuz','oguz','sabri','şenol','senol',
  // Genişletme
  'abdullah','abidin','adem','adnan','ağah','agah','akif','alper','alperen','alp',
  'arif','arın','arslan','arda','arzu','asaf','asım','asim','ataberk','atalay',
  'ates','ateş','ayaz','aydın','aydin','ayhan','aykut','aytekin','aziz','bahadır',
  'bahadir','bahri','baran','bariş','bayram','bedri','bekir','bengi','berat','berke',
  'berkin','beytullah','bircan','bora','bulut','burhan','bünyamin','bunyamin',
  'cafer','cem','cemal','cemil','ceren','cevdet','ceylan','cihat','cumhur',
  'çağatay','cagatay','çağlar','caglar','çetin','cetin','dağhan','daghan',
  'denizhan','doğan','dogan','doğuş','dogus','duran','durmuş','dursun','duygu',
  'ece','efkan','ekrem','emin','emrah','emrullah','engin','ensar','erdal','erdem',
  'erdi','erdoğan','erdogan','erek','ergün','ergun','erhan','erik','erkan','erkin',
  'erman','ersin','ertan','ertuğrul','ertugrul','erol','eray','eren','ergen',
  'eyüp','eyup','faruk','fatih','faik','fehmi','ferdi','ferhat','feridun','fethi',
  'fevzi','fikret','furkan','galip','gencay','gökdeniz','gökalp','gökhan',
  'görkem','güven','guven','gürbüz','gurbuz','güray','guray','gürcan','gurcan',
  'hakkı','hakki','haldun','hakkı','hamdi','hamit','haris','hasan','hatip',
  'hayati','hayrettin','hayri','hekim','hulusi','hüdayi','hüsamettin','husamettin',
  'hüsnü','husnu','ılgaz','ilgaz','irfan','ısmail','i̇sa','isa','i̇shak','ishak',
  'i̇smet','i̇zzet','izzet','kadri','kağan','kagan','kahraman','kemalettin',
  'kenan','kubilay','laçin','lacin','latif','mahir','maksut','mansur','mazlum',
  'menderes','mert','mesut','mete','metin','miraç','mirac','muammer','muhammed',
  'muhtar','mukaddes','mustafa','mutlu','naci','nasuh','necati','necmi','nazım',
  'nazim','necip','needet','nesim','nezih','niyazi','nizamettin','nuh','numan',
  'oktay','olgun','onay','oras','orçun','orçun','orhun','oğuzhan','oguzhan',
  'özcan','ozcan','özkan','ozkan','özer','ozer','özgür','ozgur','öztürk','ozturk',
  'paşa','pasa','rıza','riza','resul','reşat','resat','recep','refik','remzi',
  'rıfat','rifat','rıdvan','ridvan','roza','sabahattin','saffet','sait','savaş',
  'savas','sedat','sefer','selahattin','selçuk','selcuk','sezai','sıtkı','sitki',
  'sinan','süleyman','suleyman','şaban','saban','şakir','sakir','şeref','seref',
  'şevket','sevket','şuayip','suayip','tahsin','talat','tamer','taner','tanju',
  'tansel','tayfun','tekin','temel','teoman','turgut','tunç','tunc','tuncay',
  'türker','turker','ufuk','ulvi','umut','vahit','vehbi','veysel','veysi','vural',
  'yasin','yavuz','yekta','yener','yılmaz','yilmaz','zafer','zati','zekeriya',
  'zeynel','ziya','ziyad','yusuf','yunus','yakup','yahya','volkan','vedat','vatan',
  'tuğrul','tugrul','tolgahan','tolgay','suat','soner','sermet','serhat','serdar',
  'serbülent','serbülent','sercan','serol','sevket','sevgili','sükrü','sukru',
])

export const FEMALE_NAMES = new Set([
  'ayşe','ayse','fatma','zeynep','elif','merve','esra','büşra','busra','hatice',
  'emine','seda','ceren','selin','irem','melis','ece','gizem','hande',
  'öznur','oznur','şeyma','seyma','rabia','kübra','kubra','nur','nuran','sevgi',
  'gül','gul','gülsüm','gulsüm','meryem','yaren','derya','aslı','asli','pınar',
  'pinar','özlem','ozlem','damla','sude','ecrin','zümra','zumra','melike',
  'sümeyye','sumeyye','beyza','mihriban','tuğçe','tugce','nisa','miray','leyla',
  'duygu','demet','gamze','hilal','ipek','jale','kader','melda','nazlı','nazli',
  'özge','ozge','şule','sule','tuğba','tugba','zeliha','buse',
  'cansu','ceren','ece','elvan','eslem','feyza','gülşah','gulsah','hülya','hulya',
  // Genişletme
  'adile','afet','ağcagül','ahsen','alev','almina','amber','anıl','asel',
  'asena','aşkın','aybike','ayçin','ayfer','aygül','ayla','aylin','ayliz','ayten',
  'azade','bahar','balım','banu','basak','başak','bedia','belgin','belkıs','benan',
  'benli','bercem','beril','berna','berrak','beste','beyhan','bilge','birce','birsen',
  'böcü','burcu','buse','büket','canan','cansın','cansu','ceyda','ceylin',
  'çiçek','cicek','çiğdem','cigdem','delfin','dilek','dilruba','dolunay',
  'duygu','ebru','eda','ecem','ela','elmas',
  'elsa','emel','emine','esin','esma','evelina','eysan',
  'fadime','fahriye','fatoş','figen','filiz','firuze','funda','gizem',
  'gonca','göksu','göksel','gülden','gülin','gülizar','güliz','güllü','gülperi','gülşen',
  'gülistan','gülten','habibe','hale','handan','hazal','heba','helin','hilal',
  'hoşgör','hüma','hümeyra','ılgın','ilgın','ilayda','ipek',
  'irem','idil','jülide','kader','kayra','kıvılcım','kıymet',
  'kimya','kübra','lale','lamia','latife','leyla','lider','lina','lütfiye',
  'makbule','medine','mehtap','meltem','meneviş','meryem','mevhibe',
  'meziyet','mihri','mine','mislina','mukaddes','müjde','münevver','münire','naciye',
  'nagihan','nazife','nazike','nedime','neslihan','nesrin','nevin','nevra','nezahat',
  'nihal','nimet','nurcan','nurcihan','nurdan','nurefşan','nurgül','nurhayat','nuriye',
  'nursel','nursen','nurten','örge','özge','özgül','özgün','öykü','öznur',
  'papatya','pekcan','pelda','pelin','perihan','peri','petek','rabia','rengin','reyhan',
  'rumeysa','saadet','sabiha','safiye','saniye','sanem','sebahat','sedef',
  'seher','selda','selma','senem','serap','serpil','sevcan','sevdagül','sevil','sevilay',
  'sevinç','sevim','sezgi','sinem','songül','sultan','suna','suzan',
  'şaziye','saziye','şebnem','sebnem','şefika','sefika','şenay','senay','şengül','sengul',
  'şermin','sermin','şeyda','seyda','şirin','sirin','şükran','sukran','tuba','tülay',
  'tulay','tülin','tulin','umay','ümmü','ummu','ürün','urun','vesile','vildan',
  'yaren','yasemin','yekbun','yelda','yeliz','yıldız','yildiz','zehra','zerrin','zeynep',
  'zilan','zinnet','züleyha','zuleyha','zülal','zulal','zümra','zumra',
])

export const UNISEX_NAMES = new Set([
  'deniz','duru','aydın','aydin','alp','güneş','gunes','yağmur','yagmur',
  'umut','ege','kuzey','melodi','yıldız','yildiz','sahra','berfin','azra',
  'nehir','ada','tuna','evren','baran','çağan','cagan','dila','idil','lara',
  'mira','naz','seray','şirin','sirin','alaz','azur','bengü','bengu','defne',
  'derin','dora','hira','ila','lina','masal','nil','nisa','ruya','rüya','vera',
  // Genişletme (gerçek nötr/ikiye açık isimler)
  'arda','ayaz','bengisu','berrak','çağla','cagla','dilay','dolunay','egemen',
  'ela','eliz','esin','eylül','eylul','gökçe','gokce','gözde','gozde','kardelen',
  'kaya','kıvanç','kivanc','maya','neva','oyku','öykü','selvi','sema','sena',
  'sera','tuna','tülin','tulin','yade','yiğit','yigit',
])

// ─── Yabancı isimler (İngilizce/Arapça/Rusça/Almanca/Fransızca...) ──
// Türkçe dışı yaygın isimler. Bunlar da 'unknown' düşüp ünvansız kalmak
// yerine doğru Bey/Hanım hitabı için ayrı setlerde tutulur.
export const FOREIGN_MALE_NAMES = new Set([
  // İngilizce / uluslararası
  'john','james','robert','michael','william','david','richard','joseph','thomas','charles',
  'christopher','daniel','matthew','anthony','mark','donald','steven','paul','andrew','joshua',
  'kenneth','kevin','brian','george','edward','ronald','timothy','jason','jeffrey','ryan',
  'jacob','gary','nicholas','eric','jonathan','stephen','larry','justin','scott','brandon',
  'benjamin','samuel','gregory','alexander','frank','patrick','raymond','jack','dennis','jerry',
  'tyler','aaron','jose','adam','nathan','henry','douglas','zachary','peter','kyle',
  'walter','ethan','jeremy','harold','keith','christian','roger','noah','gerald','carl',
  'terry','sean','austin','arthur','lawrence','jesse','dylan','bryan','joe','jordan',
  'billy','bruce','albert','willie','gabriel','logan','alan','juan','wayne','roy',
  // Almanca / Avrupa
  'hans','karl','lukas','felix','paul','luca','maximilian','jonas','david','leon',
  'tobias','simon','niklas','moritz','jannik','tim','philipp','jan','florian','christian',
  'markus','thomas','stefan','andreas','wolfgang','klaus','peter','michael','daniel','tobias',
  'johann','otto','friedrich','günther','gunther','dieter','jürgen','jurgen','ulrich','rainer',
  // Fransızca
  'lucas','lucas','nathan','leo','gabriel','raphael','louis','arthur','jules','adam',
  'hugo','paul','maxime','antoine','nicolas','pierre','jean','jacques','francois','michel',
  'olivier','thomas','alexandre','julien','florian','damien','romain','benjamin','quentin','thibault',
  // Rusça / Slav
  'alexey','aleksei','dmitry','dmitri','sergey','sergei','andrey','andre','ivan','vladimir',
  'vlad','nikolai','nikolay','pavel','mikhail','michael','oleg','igor','anton','yuri',
  'vadim','roman','artem','artem','kirill','daniil','stepan','grigory','denis','maxim',
  // Arapça / Orta Doğu
  'mohamed','mohammed','muhammad','ahmed','ahmad','omar','osama','usama','khaled','khalid',
  'hassan','hussein','hussain','ali','abdullah','abdul','tariq','tarek','youssef','yousef',
  'sami','samer','kareem','karim','rashid','hamza','bilal','mustapha','moustafa','mamadou',
  // İtalyan / İspanyol / Portekiz
  'mario','luigi','giuseppe','antonio','francesco','andrea','luca','marco','giovanni','alessandro',
  'carlos','jose','juan','manuel','javier','diego','fernando','alejandro','pedro','miguel',
  'rafael','luis','antonio','francisco','jorge','sergio','pablo','eduardo','ricardo','oscar',
  'joao','joão','pedro','lucas','guilherme','rafael','bruno','tiago','diogo','felipe',
  // Diğer
  'george','georges','giorgi','giorgos','yorgos','dimitris','stavros','nikos','costas','michael',
  'ahmed','murad','farid','amir','ali','reza','majid','saied','nabil','waleed',
])

export const FOREIGN_FEMALE_NAMES = new Set([
  // İngilizce / uluslararası
  'mary','patricia','jennifer','linda','elizabeth','barbara','susan','jessica','sarah','karen',
  'lisa','nancy','betty','margaret','sandra','ashley','kimberly','emily','donna','michelle',
  'carol','amanda','dorothy','melissa','deborah','stephanie','rebecca','sharon','laura','cynthia',
  'kathleen','amy','angela','shirley','anna','brenda','pamela','emma','nicole','helen',
  'samantha','katherine','christine','debra','rachel','carolyn','janet','catherine','maria','heather',
  'diane','ruth','julie','olivia','joyce','virginia','victoria','kelly','lauren','christina',
  'joan','evelyn','judith','megan','andrea','cheryl','hannah','jacqueline','martha','gloria',
  'teresa','ann','sara','madison','frances','kathryn','janice','jean','abigail','alice',
  'julia','judy','sophia','grace','denise','amber','doris','marilyn','danielle','beverly',
  // Almanca / Avrupa
  'anna','hanna','lena','laura','sophie','sofia','emma','mia','hannah','julia',
  'sara','sarah','clara','lena','lisa','laura','johanna','marie','katharina','anna-lena',
  'gabi','frauke','sabine','katrin','petra','monika','ursula','renate','elke','ingrid',
  // Fransızca
  'lea','lucie','lola','chloe','manon','camille','sarah','jade','lina','anna',
  'emma','ines','nina','julie','pauline','marie','claire','nathalie','sophie','isabelle',
  'celine','virginie','sandra','laurence','valerie','sylvie','caroline','anne','helene','francoise',
  // Rusça / Slav
  'anna','olga','svetlana','tatiana','tatyana','elena','yulia','yuliya','irina','nina',
  'maria','mariya','daria','darya','ekaterina','katerina','oksana','natalia','natasha','vera',
  'ludmila','ludmila','galina','valentina','alla','lyudmila','kristina','alina','veronika','polina',
  // Arapça / Orta Doğu
  'aisha','aïcha','fatima','zahra','layla','leila','nour','noor','amina','amira',
  'hana','hanaa','salma','sara','maria','yasmin','yasmeen','rana','dina','heba',
  'nadia','rania','dalia','lina','maya','malak','sara','huda','asma','zeinab',
  // İtalyan / İspanyol / Portekiz
  'sofia','sophia','giulia','gaia','alice','ginevra','chiara','francesca','elena','giorgia',
  'martina','valentina','letizia','isabella','sara','anna','maria','giovanna','lucia','paola',
  'lucia','lucia','carmen','lucia','rosa','isabel','ana','maria','carla','paula',
  'sonia','dolores','pilar','teresa','cristina','marta','nuria','silvia','beatriz','patricia',
  // Diğer
  'elena','maria','zoe','zoe','chloe','amelie','amelia','noa','emma','ava',
  'mila','sofia','leonora','ines','aya','hala','reem','shaima','nour','fatima',
])

// ─── İşletme tipi → Türkçe etiket + hitap bağlamı ────────────
export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: 'restoran',
  barber: 'berber',
  hairdresser: 'kuaför',
  psychologist: 'psikolog',
  spa: 'spa ve masaj salonu',
  beauty_salon: 'güzellik salonu',
  dentist: 'diş hekimi',
  fitness: 'fitness salonu',
  veterinary: 'veteriner',
  pilates: 'pilates stüdyosu',
  chiropractor: 'kiropraktör',
  other: 'işletme',
}

// ─── İsim cinsiyet tespiti ────────────────────────────────────
// Bir ismi alır, erkek/kadın/unisex/unknown döndürür.
export function guessGender(name: string): GenderGuess {
  const clean = name.trim().toLowerCase().replace(/[^a-zçğıöşü0-9]/gi, '')
  if (!clean) return 'unknown'
  // Son ekten ipucu: "a/ye" bitenler çoğu kadın, ama güvenli değil
  if (UNISEX_NAMES.has(clean)) return 'unisex'
  if (FEMALE_NAMES.has(clean)) return 'female'
  if (MALE_NAMES.has(clean)) return 'male'
  if (FOREIGN_FEMALE_NAMES.has(clean)) return 'female'
  if (FOREIGN_MALE_NAMES.has(clean)) return 'male'
  // Bilinmeyen isim: güvenli varsayılan → unisex (cinsiyet varsayma)
  return 'unknown'
}

// ─── Hitap üretimi ────────────────────────────────────────────
// Cinsiyete göre Bey/Hanım; unisex/unknown için cinsiyetsiz hitap.
// Cinsiyetsiz: isim + "hoş geldiniz" / "rica ederim" (ünvansız).
export function buildAddress(name: string): string {
  const g = guessGender(name)
  if (g === 'male') return `${name} Bey`
  if (g === 'female') return `${name} Hanım`
  return name // unisex / unknown → sadece isim (en güvenli, en doğal)
}

// İsim + cinsiyet hakkında model için ipucu üret (prompt'a eklenir)
export function genderHint(name: string): string | null {
  const g = guessGender(name)
  if (g === 'male') return `${name} erkek ismidir; "${name} Bey" diye hitap et`
  if (g === 'female') return `${name} kadın ismidir; "${name} Hanım" diye hitap et`
  if (g === 'unisex') return `${name} unisex bir isimdir; cinsiyet belirtme, sadece "${name}" diye hitap et`
  return null
}

// Konuşma geçmişinden kullanıcının adını çıkar (deterministik)
// "Adım Halit", "benim adım Ayşe", "Halit" gibi ifadeleri yakalar.
export function extractNameFromHistory(messages: { role: string; content: string }[]): string | null {
  const namePatterns: RegExp[] = [
    /(?:adım|ismim|benim adım|benim ismim)\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)/u,
    /ben\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+(?:bey|hanım)/u,
    /([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+(?:bey|hanım)/u,
    /benim\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+(?:adım|ismim)/u,
  ]
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== 'user') continue
    for (const re of namePatterns) {
      const match = m.content.match(re)
      if (match?.[1]) return match[1]
    }
    // Düz tek isim (başında selamlama yoksa) — güvenli değil, atla
  }
  return null
}
