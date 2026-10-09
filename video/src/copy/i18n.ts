import { LANG } from '../lib/lang';

/**
 * Preklady textov v obraze (CZ a EN verzia, oktober 2026). Kluc je slovensky text presne tak, ako je v kode
 * (`tr('Prilepiť QR kód')`), takze slovenska verzia sa nemeni a chybajuci preklad ostane po slovensky
 * (`node scripts/i18n-check.mjs` vypise chybajuce). Hlas a titulky su v src/copy/vo.<lang>.json.
 * Pravidlo: prekladaju sa popisy a ovladacie prvky, ktore kreslime my; udaje dokumentov (nazov stavby, typ projektu,
 * text so zvyraznenym slovom) ostavaju po slovensky, lebo zodpovedaju zaznamom z aplikacie (search "vodovod").
 * Stav: navrh na schvalenie rodenymi hovorcami (dokument "Preklad videa SK / CZ / EN").
 */
type Entry = { cs: string; en: string };
export const UI: Record<string, Entry> = {
  // --- fazy a nadpisy krokov ---
  'V teréne': { cs: 'V terénu', en: 'On site' },
  'V aplikácii': { cs: 'V aplikaci', en: 'In the app' },
  Vyhľadávanie: { cs: 'Vyhledávání', en: 'Search' },
  'Prvý krok': { cs: 'První krok', en: 'First step' },
  'V archíve': { cs: 'V archivu', en: 'In the archive' },
  'Ako začať': { cs: 'Jak začít', en: 'How to start' },
  'Spracovanie archívu': { cs: 'Zpracování archivu', en: 'Archive processing' },
  'Technické riešenie': { cs: 'Technické řešení', en: 'Technical solution' },
  'Práca s databázou': { cs: 'Práce s databází', en: 'Working with the database' },
  'Fotka je v aplikácii': { cs: 'Fotka je v aplikaci', en: 'The photo is in the app' },
  'Miesto v hierarchii': { cs: 'Místo v hierarchii', en: 'Place in the hierarchy' },
  'Fyzické dokumenty': { cs: 'Fyzické dokumenty', en: 'Physical documents' },
  'Prilepiť QR kód': { cs: 'Nalepit QR kód', en: 'Attach a QR code' },
  'Odfotiť identifikačnú stranu': { cs: 'Vyfotit identifikační stranu', en: 'Photograph the title page' },
  'Odfotiť titulnú stranu': { cs: 'Vyfotit titulní stranu', en: 'Photograph the title page' },
  'Mobilom odfotiť identifikačnú stranu': { cs: 'Mobilem vyfotit identifikační stranu', en: 'Photograph the title page by phone' },
  'Vybrať typ položky': { cs: 'Vybrat typ položky', en: 'Choose the item type' },
  'Zaradiť do hierarchie': { cs: 'Zařadit do hierarchie', en: 'Place in the hierarchy' },
  'Digitálny záznam': { cs: 'Digitální záznam', en: 'Digital record' },
  'Prečítať text': { cs: 'Přečíst text', en: 'Read the text' },
  'Návrh údajov': { cs: 'Návrh údajů', en: 'Suggested data' },
  'Návrh metadát': { cs: 'Návrh metadat', en: 'Suggested metadata' },
  'Overiť a potvrdiť': { cs: 'Ověřit a potvrdit', en: 'Check and confirm' },
  'Opraviť v návrhu': { cs: 'Opravit v návrhu', en: 'Correct the suggestion' },
  'Overený záznam': { cs: 'Ověřený záznam', en: 'Verified record' },
  'Človek potvrdí alebo upraví': { cs: 'Člověk potvrdí nebo upraví', en: 'A person confirms or corrects' },
  'Fotka identifikačnej strany': { cs: 'Fotka identifikační strany', en: 'Photo of the title page' },
  'Navrhnuté údaje sa zhodujú': { cs: 'Navržené údaje se shodují', en: 'The suggested data match' },
  'Napísať kľúčové slovo': { cs: 'Napsat klíčové slovo', en: 'Type a keyword' },
  'Kľúčové slovo': { cs: 'Klíčové slovo', en: 'Keyword' },
  'Cesta k položke': { cs: 'Cesta k položce', en: 'Path to the item' },
  'Cesta v hierarchii': { cs: 'Cesta v hierarchii', en: 'Path in the hierarchy' },
  'Údaje o položke': { cs: 'Údaje o položce', en: 'Item data' },
  'Vyčítané údaje': { cs: 'Vyčtené údaje', en: 'Extracted data' },
  'Záznam a podrobnosti': { cs: 'Záznam a podrobnosti', en: 'Record and details' },
  'Zvýraznené v metadátach': { cs: 'Zvýrazněno v metadatech', en: 'Highlighted in the metadata' },
  'Skenovať všetko je drahé': { cs: 'Skenovat vše je drahé', en: 'Scanning everything is costly' },
  'Katalogizácia: len identifikačná strana': { cs: 'Katalogizace: jen identifikační strana', en: 'Cataloguing: title page only' },
  'Výsledok katalogizácie': { cs: 'Výsledek katalogizace', en: 'Cataloguing result' },
  'Čo ďalej': { cs: 'Co dál', en: 'What next' },
  'Vlastnými silami, alebo na kľúč': { cs: 'Vlastními silami, nebo na klíč', en: 'On your own, or turnkey' },

  // --- titulky v obraze (captions) a slogan ---
  'Dokumentáciu k objektom máte.': { cs: 'Dokumentaci k objektům máte.', en: 'You have the documentation for your buildings.' },
  'Len ju nikto nevie nájsť.': { cs: 'Jen ji nikdo nedokáže najít.', en: 'But nobody can find it.' },
  'Dokumentáciu máte. Nikto ju nevie nájsť.': { cs: 'Dokumentaci máte. Nikdo ji nedokáže najít.', en: 'You have the documents. Nobody can find them.' },
  'V sklade to nie je lepšie.': { cs: 'Ve skladu to není lepší.', en: 'The warehouse is no better.' },
  'Je to niekde tam.': { cs: 'Je to někde tam.', en: "It's in there somewhere." },
  'Hľadanie trvá dlhšie než nové vyhotovenie.': { cs: 'Hledání trvá déle než nové vyhotovení.', en: 'Searching takes longer than producing it again.' },
  'Zaplatené dvakrát za tú istú dokumentáciu.': { cs: 'Zaplaceno dvakrát za stejnou dokumentaci.', en: 'Paid twice for the same documentation.' },
  'Digitálny poriadok v papierovom archíve': { cs: 'Digitální pořádek v papírovém archivu', en: 'Digital order in your paper archive' },
  'Nalepiť QR, odfotiť. Celá práca v teréne.': { cs: 'Nalepit QR, vyfotit. Celá práce v terénu.', en: 'Attach a QR, take a photo. That is all on site.' },
  'Text z fotky rozpozná a navrhne údaje.': { cs: 'Text z fotky rozpozná a navrhne údaje.', en: 'It reads the photo and suggests the data.' },
  'Každá položka má svoje miesto.': { cs: 'Každá položka má své místo.', en: 'Every item has its place.' },
  'Začnime postupne.': { cs: 'Začněme postupně.', en: "Let's go step by step." },
  'Výsledok uvidíte na vlastnej dokumentácii.': { cs: 'Výsledek uvidíte na vlastní dokumentaci.', en: 'You will see the result on your own documents.' },

  // --- ponuka (C8, LinkedIn) ---
  'Služba na kľúč': { cs: 'Služba na klíč', en: 'Turnkey service' },
  'Celý archív spracujeme za vás.': { cs: 'Celý archiv zpracujeme za vás.', en: 'We process the whole archive for you.' },
  'Obhliadka a pilot na krabici': { cs: 'Prohlídka a pilot na krabici', en: 'Site visit and a one-box pilot' },
  Softvér: { cs: 'Software', en: 'Software' },
  'Katalogizujete vlastnými silami.': { cs: 'Katalogizujete vlastními silami.', en: 'You catalogue it yourselves.' },
  'Licencia podľa rozsahu': { cs: 'Licence podle rozsahu', en: 'Licence based on scope' },
  'Rozsah nasadenia': { cs: 'Rozsah nasazení', en: 'Deployment scope' },
  'v oboch prípadoch': { cs: 'v obou případech', en: 'in both cases' },
  'Identifikačné strany': { cs: 'Identifikační strany', en: 'Title pages' },
  'Štítok a obsah každej zložky.': { cs: 'Štítek a obsah každé složky.', en: 'Label and contents of every folder.' },
  'Metadáta a poloha v archíve': { cs: 'Metadata a poloha v archivu', en: 'Metadata and location in the archive' },
  'Celé dokumenty': { cs: 'Celé dokumenty', en: 'Full documents' },
  'Skenovanie všetkých strán.': { cs: 'Skenování všech stran.', en: 'Scanning every page.' },
  'Fulltextové vyhľadávanie': { cs: 'Fulltextové vyhledávání', en: 'Full-text search' },
  'Obhliadka skladu': { cs: 'Prohlídka skladu', en: 'Warehouse visit' },
  'Pilot na jednej krabici': { cs: 'Pilot na jedné krabici', en: 'Pilot on one box' },
  'Rozsah a ponuka': { cs: 'Rozsah a nabídka', en: 'Scope and offer' },
  'Vlastnými silami': { cs: 'Vlastními silami', en: 'On your own' },
  's našou aplikáciou, od pár šanónov': { cs: 's naší aplikací, od pár šanonů', en: 'with our app, from a few binders' },
  'licencia podľa rozsahu': { cs: 'licence podle rozsahu', en: 'licence based on scope' },
  'archív spracujeme my, aj celý sklad': { cs: 'archiv zpracujeme my, i celý sklad', en: 'we do it for you, any size' },
  'Spracujete sami v našej aplikácii.': { cs: 'Zpracujete sami v naší aplikaci.', en: 'Do it yourselves in our app.' },
  'Spracujeme za vás': { cs: 'Zpracujeme za vás', en: 'We do it for you' },
  'V našej aplikácii': { cs: 'V naší aplikaci', en: 'In our app' },
  Bezpečne: { cs: 'Bezpečně', en: 'Secure' },
  'V súlade s vašimi bezpečnostnými požiadavkami': { cs: 'V souladu s vašimi bezpečnostními požadavky', en: 'In line with your security requirements' },
  alebo: { cs: 'nebo', en: 'or' },
  'Online u nás': { cs: 'Online u nás', en: 'Online with us' },
  'Bez vlastných serverov': { cs: 'Bez vlastních serverů', en: 'No servers of your own' },
  'Na vašej infraštruktúre': { cs: 'Na vaší infrastruktuře', en: 'On your infrastructure' },
  'Na vašich serveroch': { cs: 'Na vašich serverech', en: 'On your servers' },
  Začnime: { cs: 'Začněme', en: "Let's start" },
  'jednou krabicou': { cs: 'jednou krabicí', en: 'with one box' },
  'Zadarmo a nezáväzne': { cs: 'Zdarma a nezávazně', en: 'Free, no obligation' },
  'Prvé dokumenty zadarmo a nezáväzne': { cs: 'První dokumenty zdarma a nezávazně', en: 'First documents free, no obligation' },

  // --- vysledok (C8a, LinkedIn) ---
  'Aké dokumenty máte': { cs: 'Jaké dokumenty máte', en: 'What you have' },
  'Kde sa nachádzajú': { cs: 'Kde se nacházejí', en: 'Where they are' },
  Uchovať: { cs: 'Uchovat', en: 'Keep' },
  dlhodobo: { cs: 'dlouhodobě', en: 'long term' },
  Skartovať: { cs: 'Skartovat', en: 'Shred' },
  'menší sklad': { cs: 'menší sklad', en: 'less storage' },
  'Plnohodnotne skenovať': { cs: 'Plně naskenovat', en: 'Fully scan' },
  'fulltextové vyhľadávanie': { cs: 'fulltextové vyhledávání', en: 'full-text search' },

  // --- ilustracie: polozky, cena, databaza ---
  Polica: { cs: 'Police', en: 'Shelf' },
  Krabica: { cs: 'Krabice', en: 'Box' },
  Šanón: { cs: 'Šanon', en: 'Binder' },
  Zložka: { cs: 'Složka', en: 'Folder' },
  Dokument: { cs: 'Dokument', en: 'Document' },
  FAKTÚRY: { cs: 'FAKTURY', en: 'INVOICES' },
  Správa: { cs: 'Zpráva', en: 'Report' },
  Výkres: { cs: 'Výkres', en: 'Drawing' },
  Protokol: { cs: 'Protokol', en: 'Certificate' },
  skladovanie: { cs: 'skladování', en: 'storage' },
  'nové vyhotovenie': { cs: 'nové vyhotovení', en: 'new copy' },
  'Váš archív': { cs: 'Váš archiv', en: 'Your archive' },
  'Digitálny katalóg': { cs: 'Digitální katalog', en: 'Digital catalogue' },
  Export: { cs: 'Export', en: 'Export' },
  Analýza: { cs: 'Analýza', en: 'Analysis' },

  // --- karty aplikacie (popisy, nie udaje dokumentu) ---
  'Názov projektu': { cs: 'Název projektu', en: 'Project name' },
  'NÁZOV PROJEKTU': { cs: 'NÁZEV PROJEKTU', en: 'PROJECT NAME' },
  Typ: { cs: 'Typ', en: 'Type' },
  Potvrdené: { cs: 'Potvrzeno', en: 'Confirmed' },
  Autor: { cs: 'Autor', en: 'Author' },
  Rok: { cs: 'Rok', en: 'Year' },
  'Časti slov, "presné slová" alebo frázy': { cs: 'Části slov, "přesná slova" nebo fráze', en: 'Parts of words, "exact words" or phrases' },
  'Návrh aplikácie: názov projektu': { cs: 'Návrh aplikace: název projektu', en: "App's suggestion: project name" },
  'Na fotke': { cs: 'Na fotce', en: 'In the photo' },
  'Hľadané slovo': { cs: 'Hledané slovo', en: 'Search term' },
  'Nájdená položka': { cs: 'Nalezená položka', en: 'Item found' },

  // --- web v zavere (CZ: assetin.cz, EN: assetin.sk) ---
  'www.assetin.sk': { cs: 'www.assetin.cz', en: 'www.assetin.sk' },
};

/** Text v obraze v jazyku videa; slovencina a chybajuci preklad = povodny text. */
export const tr = (sk: string): string => (LANG === 'sk' ? sk : (UI[sk]?.[LANG] ?? sk));

/** Preklad vsetkych retazcov objektu (captions, phases, offer ...); tvar a typ ostavaju. */
export const trDeep = <T,>(o: T): T => {
  if (LANG === 'sk') return o;
  if (typeof o === 'string') return tr(o) as T;
  if (Array.isArray(o)) return o.map((x) => trDeep(x)) as T;
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, trDeep(v)])) as T;
  return o;
};

/** Pocet stran pri pocitani (C4b, LinkedIn hacik): cislo s medzerou ako oddelovacom tisicov a sklonovanie. */
export const pagesLabel = (n: number, plural: 'sk' | 'gen' = 'sk'): string => {
  const k = Math.round(n);
  const num = k.toLocaleString(LANG === 'en' ? 'en-GB' : LANG === 'cs' ? 'cs-CZ' : 'sk-SK').replace(/[  ]/g, ' ');
  if (LANG === 'en') return `${num} ${k === 1 ? 'page' : 'pages'}`;
  // plural 'gen' = vzdy genitiv mnozneho cisla (LinkedIn: "strán"), 'sk' = podla poctu (C4b)
  const [one, few, many] = LANG === 'cs' ? ['strana', 'strany', 'stran'] : ['strana', 'strany', 'strán'];
  if (plural === 'gen') return `${num} ${many}`;
  return `${num} ${k === 1 ? one : k >= 2 && k <= 4 ? few : many}`;
};
