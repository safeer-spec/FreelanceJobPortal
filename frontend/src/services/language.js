import { useEffect, useState } from "react";

export const supportedLanguages = [
  { code: "en", nativeName: "English", dir: "ltr" },
  { code: "ta", nativeName: "தமிழ்", dir: "ltr" },
  { code: "ml", nativeName: "മലയാളം", dir: "ltr" },
  { code: "ja", nativeName: "日本語", dir: "ltr" },
  { code: "es", nativeName: "Español", dir: "ltr" },
  { code: "fr", nativeName: "Français", dir: "ltr" },
  { code: "de", nativeName: "Deutsch", dir: "ltr" },
  { code: "ar", nativeName: "العربية", dir: "rtl" },
];

const copy = {
  ta: {
    Language: "மொழி", "Why upskill?": "Upskill ஏன்?", Liked: "விருப்பமானவை", "Open account menu": "கணக்கு பட்டியலைத் திறக்கவும்",
    "Learn about Upskill": "Upskill பற்றி அறிக", "Get to know the platform built to help you grow your skills.": "உங்கள் திறன்களை வளர்க்க உருவாக்கப்பட்ட தளத்தை அறிந்து கொள்ளுங்கள்.",
    Resources: "வளங்கள்", "Success stories": "வெற்றிக் கதைகள்", "See how learners reached their goals": "கற்றவர்கள் தங்கள் இலக்குகளை எவ்வாறு அடைந்தார்கள் என்பதைப் பாருங்கள்",
    Reviews: "மதிப்புரைகள்", "Read what people say about Upskill": "Upskill பற்றி மற்றவர்கள் கூறுவதைப் படியுங்கள்", "How to learn": "கற்பது எப்படி", "Find the right path for your goals": "உங்கள் இலக்குகளுக்கான சரியான வழியைக் கண்டறியுங்கள்",
    "How to teach": "கற்பிப்பது எப்படி", "Share your skills with others": "உங்கள் திறன்களை மற்றவர்களுடன் பகிருங்கள்", "What's new": "புதியவை", "Upskill updates": "Upskill புதுப்பிப்புகள்", "Our latest features and partners": "எங்கள் புதிய அம்சங்களும் கூட்டாளர்களும்", Research: "ஆராய்ச்சி", "Insights on skills and careers": "திறன்கள் மற்றும் தொழில் பற்றிய பார்வைகள்",
    "My profile": "என் சுயவிவரம்", "Log out": "வெளியேறு", "Log in": "உள்நுழை", "Sign Up": "பதிவு செய்", "Logging out…": "வெளியேறுகிறது…",
    "Live monitoring": "நேரடி கண்காணிப்பு", "Moderation workspace": "மதிப்பாய்வு பணியிடம்", "Review command center": "மதிப்பாய்வு மையம்", "Refresh dashboard": "டாஷ்போர்டைப் புதுப்பி", "Updating…": "புதுப்பிக்கிறது…",
    "Job listings": "வேலைப் பட்டியல்கள்", "Review queue": "மதிப்பாய்வு வரிசை", "Review outcomes": "மதிப்பாய்வு முடிவுகள்", "Moderation decisions": "மதிப்பாய்வு தீர்மானங்கள்", "Approved jobs": "அங்கீகரிக்கப்பட்ட வேலைகள்", "Rejected jobs": "நிராகரிக்கப்பட்ட வேலைகள்",
    "Total freelancers": "மொத்த ஃப்ரீலான்சர்கள்", "Total clients": "மொத்த வாடிக்கையாளர்கள்", "Total jobs": "மொத்த வேலைகள்", "Active listings": "செயலில் உள்ள பட்டியல்கள்", "In progress": "நடைபெறுகிறது", "Completed jobs": "முடிக்கப்பட்ட வேலைகள்", "Waiting review": "மதிப்பாய்வுக்காக காத்திருக்கிறது",
  },
  ml: {
    Language: "ഭാഷ", "Why upskill?": "Upskill എന്തിന്?", Liked: "ഇഷ്ടപ്പെട്ടവ", "Open account menu": "അക്കൗണ്ട് മെനു തുറക്കുക",
    "Learn about Upskill": "Upskill അറിയുക", "Get to know the platform built to help you grow your skills.": "നിങ്ങളുടെ കഴിവുകൾ വളർത്താൻ രൂപകൽപ്പന ചെയ്ത പ്ലാറ്റ്ഫോം പരിചയപ്പെടുക.",
    Resources: "വിഭവങ്ങൾ", "Success stories": "വിജയകഥകൾ", "See how learners reached their goals": "പഠിതാക്കൾ ലക്ഷ്യത്തിലെത്തിയത് കാണുക", Reviews: "അവലോകനങ്ങൾ", "Read what people say about Upskill": "Upskill-നെക്കുറിച്ചുള്ള അഭിപ്രായങ്ങൾ വായിക്കുക",
    "How to learn": "എങ്ങനെ പഠിക്കാം", "Find the right path for your goals": "നിങ്ങളുടെ ലക്ഷ്യങ്ങൾക്ക് അനുയോജ്യമായ വഴി കണ്ടെത്തുക", "How to teach": "എങ്ങനെ പഠിപ്പിക്കാം", "Share your skills with others": "നിങ്ങളുടെ കഴിവുകൾ മറ്റുള്ളവരുമായി പങ്കിടുക",
    "What's new": "പുതിയതെന്ത്", "Upskill updates": "Upskill അപ്‌ഡേറ്റുകൾ", "Our latest features and partners": "പുതിയ സവിശേഷതകളും പങ്കാളികളും", Research: "ഗവേഷണം", "Insights on skills and careers": "കഴിവുകളും തൊഴിലും സംബന്ധിച്ച ഉൾക്കാഴ്ചകൾ",
    "My profile": "എന്റെ പ്രൊഫൈൽ", "Log out": "പുറത്തുകടക്കുക", "Log in": "ലോഗിൻ", "Sign Up": "രജിസ്റ്റർ ചെയ്യുക", "Logging out…": "പുറത്തുകടക്കുന്നു…",
    "Live monitoring": "തത്സമയ നിരീക്ഷണം", "Moderation workspace": "പരിശോധനാ സ്ഥലം", "Review command center": "പരിശോധനാ കേന്ദ്രം", "Refresh dashboard": "ഡാഷ്ബോർഡ് പുതുക്കുക", "Updating…": "പുതുക്കുന്നു…",
    "Job listings": "ജോലി പട്ടികകൾ", "Review queue": "പരിശോധനാ ക്യൂ", "Review outcomes": "പരിശോധനാ ഫലങ്ങൾ", "Moderation decisions": "പരിശോധനാ തീരുമാനങ്ങൾ", "Approved jobs": "അംഗീകരിച്ച ജോലികൾ", "Rejected jobs": "നിരസിച്ച ജോലികൾ",
    "Total freelancers": "ആകെ ഫ്രീലാൻസർമാർ", "Total clients": "ആകെ ക്ലയന്റുകൾ", "Total jobs": "ആകെ ജോലികൾ", "Active listings": "സജീവ പട്ടികകൾ", "In progress": "പുരോഗതിയിൽ", "Completed jobs": "പൂർത്തിയായ ജോലികൾ", "Waiting review": "പരിശോധന കാത്തിരിക്കുന്നു",
  },
  ja: {
    Language: "言語", "Why upskill?": "Upskillとは", Liked: "お気に入り", "Open account menu": "アカウントメニューを開く", "Learn about Upskill": "Upskillについて", "Get to know the platform built to help you grow your skills.": "スキル向上を支援するプラットフォームをご紹介します。",
    Resources: "リソース", "Success stories": "成功事例", "See how learners reached their goals": "学習者が目標を達成した方法を見る", Reviews: "レビュー", "Read what people say about Upskill": "Upskillへの感想を読む", "How to learn": "学び方", "Find the right path for your goals": "目標に合った学習方法を見つける", "How to teach": "教え方", "Share your skills with others": "スキルを共有する", "What's new": "最新情報", "Upskill updates": "アップデート", "Our latest features and partners": "最新機能とパートナー", Research: "調査", "Insights on skills and careers": "スキルとキャリアの洞察",
    "My profile": "プロフィール", "Log out": "ログアウト", "Log in": "ログイン", "Sign Up": "登録", "Logging out…": "ログアウト中…", "Live monitoring": "ライブモニタリング", "Moderation workspace": "審査ワークスペース", "Review command center": "審査コマンドセンター", "Refresh dashboard": "ダッシュボードを更新", "Updating…": "更新中…", "Job listings": "求人一覧", "Review queue": "審査待ち", "Review outcomes": "審査結果", "Moderation decisions": "審査状況", "Approved jobs": "承認済み求人", "Rejected jobs": "却下された求人",
    "Total freelancers": "フリーランサー総数", "Total clients": "クライアント総数", "Total jobs": "求人総数", "Active listings": "募集中", "In progress": "進行中", "Completed jobs": "完了した仕事", "Waiting review": "審査待ち",
  },
  es: {
    Language: "Idioma", "Why upskill?": "¿Por qué Upskill?", Liked: "Guardados", "Open account menu": "Abrir menú de cuenta", "Learn about Upskill": "Acerca de Upskill", "Get to know the platform built to help you grow your skills.": "Conoce la plataforma diseñada para desarrollar tus habilidades.", Resources: "Recursos", "Success stories": "Casos de éxito", "See how learners reached their goals": "Descubre cómo otros alcanzaron sus metas", Reviews: "Opiniones", "Read what people say about Upskill": "Lee lo que dicen sobre Upskill", "How to learn": "Cómo aprender", "Find the right path for your goals": "Encuentra el camino adecuado para tus metas", "How to teach": "Cómo enseñar", "Share your skills with others": "Comparte tus habilidades", "What's new": "Novedades", "Upskill updates": "Novedades de Upskill", "Our latest features and partners": "Nuevas funciones y colaboradores", Research: "Investigación", "Insights on skills and careers": "Ideas sobre habilidades y carreras", "My profile": "Mi perfil", "Log out": "Cerrar sesión", "Log in": "Iniciar sesión", "Sign Up": "Registrarse", "Logging out…": "Cerrando sesión…", "Live monitoring": "Seguimiento en vivo", "Moderation workspace": "Espacio de moderación", "Review command center": "Centro de revisión", "Refresh dashboard": "Actualizar panel", "Updating…": "Actualizando…", "Job listings": "Ofertas de trabajo", "Review queue": "En espera de revisión", "Review outcomes": "Resultados de revisión", "Moderation decisions": "Decisiones de moderación", "Approved jobs": "Trabajos aprobados", "Rejected jobs": "Trabajos rechazados", "Total freelancers": "Total de freelancers", "Total clients": "Total de clientes", "Total jobs": "Total de trabajos", "Active listings": "Ofertas activas", "In progress": "En curso", "Completed jobs": "Trabajos completados", "Waiting review": "Pendiente de revisión",
  },
  fr: {
    Language: "Langue", "Why upskill?": "Pourquoi Upskill ?", Liked: "Favoris", "Open account menu": "Ouvrir le menu du compte", "Learn about Upskill": "À propos d’Upskill", "Get to know the platform built to help you grow your skills.": "Découvrez la plateforme conçue pour développer vos compétences.", Resources: "Ressources", "Success stories": "Réussites", "See how learners reached their goals": "Découvrez comment les apprenants ont atteint leurs objectifs", Reviews: "Avis", "Read what people say about Upskill": "Lisez les avis sur Upskill", "How to learn": "Comment apprendre", "Find the right path for your goals": "Trouvez le parcours adapté à vos objectifs", "How to teach": "Comment enseigner", "Share your skills with others": "Partagez vos compétences", "What's new": "Nouveautés", "Upskill updates": "Actualités Upskill", "Our latest features and partners": "Nos nouveautés et partenaires", Research: "Recherche", "Insights on skills and careers": "Regards sur les compétences et les carrières", "My profile": "Mon profil", "Log out": "Déconnexion", "Log in": "Connexion", "Sign Up": "S’inscrire", "Logging out…": "Déconnexion…", "Live monitoring": "Suivi en direct", "Moderation workspace": "Espace de modération", "Review command center": "Centre de modération", "Refresh dashboard": "Actualiser le tableau de bord", "Updating…": "Actualisation…", "Job listings": "Offres d’emploi", "Review queue": "À examiner", "Review outcomes": "Résultats", "Moderation decisions": "Décisions de modération", "Approved jobs": "Offres approuvées", "Rejected jobs": "Offres refusées", "Total freelancers": "Nombre de freelances", "Total clients": "Nombre de clients", "Total jobs": "Nombre d’offres", "Active listings": "Offres actives", "In progress": "En cours", "Completed jobs": "Missions terminées", "Waiting review": "En attente d’examen",
  },
  de: {
    Language: "Sprache", "Why upskill?": "Warum Upskill?", Liked: "Merkliste", "Open account menu": "Kontomenü öffnen", "Learn about Upskill": "Über Upskill", "Get to know the platform built to help you grow your skills.": "Lerne die Plattform kennen, die deine Fähigkeiten fördert.", Resources: "Ressourcen", "Success stories": "Erfolgsgeschichten", "See how learners reached their goals": "Sieh, wie Lernende ihre Ziele erreicht haben", Reviews: "Bewertungen", "Read what people say about Upskill": "Lies, was andere über Upskill sagen", "How to learn": "So lernst du", "Find the right path for your goals": "Finde den passenden Weg für deine Ziele", "How to teach": "So lehrst du", "Share your skills with others": "Teile deine Fähigkeiten", "What's new": "Neuigkeiten", "Upskill updates": "Upskill-Neuigkeiten", "Our latest features and partners": "Neue Funktionen und Partner", Research: "Forschung", "Insights on skills and careers": "Einblicke in Fähigkeiten und Berufe", "My profile": "Mein Profil", "Log out": "Abmelden", "Log in": "Anmelden", "Sign Up": "Registrieren", "Logging out…": "Abmeldung…", "Live monitoring": "Live-Überwachung", "Moderation workspace": "Moderationsbereich", "Review command center": "Prüfzentrum", "Refresh dashboard": "Dashboard aktualisieren", "Updating…": "Wird aktualisiert…", "Job listings": "Stellenangebote", "Review queue": "Prüfwarteschlange", "Review outcomes": "Prüfergebnisse", "Moderation decisions": "Moderationsentscheidungen", "Approved jobs": "Genehmigte Jobs", "Rejected jobs": "Abgelehnte Jobs", "Total freelancers": "Freelancer gesamt", "Total clients": "Kunden gesamt", "Total jobs": "Jobs gesamt", "Active listings": "Aktive Angebote", "In progress": "In Bearbeitung", "Completed jobs": "Abgeschlossene Jobs", "Waiting review": "Wartet auf Prüfung",
  },
  ar: {
    Language: "اللغة", "Why upskill?": "لماذا Upskill؟", Liked: "المفضلة", "Open account menu": "فتح قائمة الحساب", "Learn about Upskill": "عن Upskill", "Get to know the platform built to help you grow your skills.": "تعرّف على المنصة المصممة لتطوير مهاراتك.", Resources: "الموارد", "Success stories": "قصص النجاح", "See how learners reached their goals": "اكتشف كيف حقق المتعلمون أهدافهم", Reviews: "التقييمات", "Read what people say about Upskill": "اقرأ آراء المستخدمين حول Upskill", "How to learn": "كيفية التعلم", "Find the right path for your goals": "اعثر على المسار المناسب لأهدافك", "How to teach": "كيفية التعليم", "Share your skills with others": "شارك مهاراتك مع الآخرين", "What's new": "ما الجديد", "Upskill updates": "تحديثات Upskill", "Our latest features and partners": "أحدث الميزات والشركاء", Research: "الأبحاث", "Insights on skills and careers": "رؤى حول المهارات والمسارات المهنية", "My profile": "ملفي الشخصي", "Log out": "تسجيل الخروج", "Log in": "تسجيل الدخول", "Sign Up": "إنشاء حساب", "Logging out…": "جارٍ تسجيل الخروج…", "Live monitoring": "مراقبة مباشرة", "Moderation workspace": "مساحة المراجعة", "Review command center": "مركز المراجعة", "Refresh dashboard": "تحديث لوحة التحكم", "Updating…": "جارٍ التحديث…", "Job listings": "قوائم الوظائف", "Review queue": "قائمة المراجعة", "Review outcomes": "نتائج المراجعة", "Moderation decisions": "قرارات المراجعة", "Approved jobs": "وظائف معتمدة", "Rejected jobs": "وظائف مرفوضة", "Total freelancers": "إجمالي المستقلين", "Total clients": "إجمالي العملاء", "Total jobs": "إجمالي الوظائف", "Active listings": "وظائف نشطة", "In progress": "قيد التنفيذ", "Completed jobs": "وظائف مكتملة", "Waiting review": "بانتظار المراجعة",
  },
};

// Keep the small shared translation catalog in sync across every route, including
// labels rendered by components that do not use the language hook directly.
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const translatableAttributes = ["placeholder", "title", "aria-label", "alt"];

function translateElement(root) {
  const language = getAppLanguage();
  const dictionary = copy[language];
  if (!dictionary || !root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/.test(parent.tagName) || parent.isContentEditable) continue;
    const cached = originalText.get(node);
    const original = cached && node.nodeValue === cached.applied ? cached.original : node.nodeValue;
    const key = original.trim();
    if (!key) continue;
    const translated = dictionary[key];
    const nextValue = translated ? original.replace(key, translated) : original;
    if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
    originalText.set(node, { original, applied: nextValue });
  }

  const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll("*")] : root.querySelectorAll?.("*") || [];
  for (const element of elements) {
    if (/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(element.tagName)) continue;
    let saved = originalAttributes.get(element);
    if (!saved) {
      saved = new Map();
      originalAttributes.set(element, saved);
    }
    for (const attribute of translatableAttributes) {
      const current = element.getAttribute(attribute);
      if (current == null) continue;
      const cached = saved.get(attribute);
      const original = cached && current === cached.applied ? cached.original : current;
      const nextValue = dictionary[original] || original;
      if (current !== nextValue) element.setAttribute(attribute, nextValue);
      saved.set(attribute, { original, applied: nextValue });
    }
  }
}

export function installSiteTranslations() {
  const apply = () => translateElement(document.body);
  apply();
  const observer = new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "childList") change.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) translateElement(node);
      });
      else if (change.type === "characterData") translateElement(change.target.parentElement || document.body);
      else if (change.type === "attributes") translateElement(change.target);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: translatableAttributes });
  window.addEventListener("jobportal:language-changed", apply);
  return () => {
    observer.disconnect();
    window.removeEventListener("jobportal:language-changed", apply);
  };
}

export function getAppLanguage() {
  const saved = localStorage.getItem("jobportal.language");
  return supportedLanguages.some(({ code }) => code === saved) ? saved : "en";
}

export function setAppLanguage(code) {
  const selected = supportedLanguages.find((language) => language.code === code);
  if (!selected) return;
  localStorage.setItem("jobportal.language", selected.code);
  document.documentElement.lang = selected.code;
  document.documentElement.dir = selected.dir;
  window.dispatchEvent(new Event("jobportal:language-changed"));
}

export function useAppLanguage() {
  const [language, setLanguage] = useState(getAppLanguage);
  useEffect(() => {
    const sync = () => {
      const selected = supportedLanguages.find(({ code }) => code === getAppLanguage());
      setLanguage(selected.code);
      document.documentElement.lang = selected.code;
      document.documentElement.dir = selected.dir;
    };
    sync();
    window.addEventListener("jobportal:language-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("jobportal:language-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const t = (key) => copy[language]?.[key] || key;
  return { language, t };
}
