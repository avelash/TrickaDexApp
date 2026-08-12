export type Language = "en" | "he";

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  he: "עברית",
};

// Every user-facing string in the app. Keys are grouped by screen/component.
const en = {
  // Shared
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.delete": "Delete",
  "common.copy": "Copy",
  "common.clear": "Clear",
  "common.yes": "Yes",
  "common.no": "No",
  "common.unknown": "Unknown",
  "common.none": "None",

  // Welcome
  "welcome.title": "TrickaDex",
  "welcome.subtitle": "Track your tricking journey",
  "welcome.namePrompt": "What's your name?",
  "welcome.namePlaceholder": "Enter your name",
  "welcome.language": "Language",

  // Trick list
  "trickList.title": "Trickadex",
  "trickList.feedback": "Feedback",
  "trickList.noMatch": "No tricks match the selected filters",
  "trickList.empty": "No tricks found",
  "trickList.clearFilters": "Clear filters",

  // Search bar
  "search.close": "Close search",
  "search.open": "Open search",
  "search.activeFilters": "Active filters",
  "search.placeholder": "Search tricks or filter...",
  "search.inputLabel": "Search input",
  "search.inputHint": "Enter trick name or select a filter",

  // Trick card info
  "trickInfo.skillLevel": "Skill Level:",
  "trickInfo.prerequisites": "Prerequisites:",
  "trickInfo.watchTutorial": "Watch Tutorial",
  "trickInfo.excludeFromRandom": "Do not include in random combos",

  // Combo builder
  "combo.title": "Combo Builder",
  "combo.myCombos": "My Combos",
  "combo.yourTricks": "Your Tricks",
  "combo.noMatch": "No tricks match the selected filters",
  "combo.noLanded": "No landed tricks yet",
  "combo.build": "Build Your Combo",
  "combo.random": "Random",
  "combo.clear": "Clear",
  "combo.tricksAvailable": "{count} tricks available",
  "combo.emptyHint": "Drag tricks to build your combo",
  "combo.label": "Combo:",
  "combo.save": "Save Combo",
  "combo.copiedToClipboard": "Your combo has been copied to the clipboard.",
  "combo.noComboTitle": "No Combo",
  "combo.noComboMessage": "Please build a combo before saving.",
  "combo.savedTitle": "Saved!",
  "combo.savedMessage": "Your combo has been saved.",

  // Combo drop zone
  "dropZone.title": "Drag tricks here",
  "dropZone.subtitle": "Build your combo by dragging tricks from above",

  // Save combo modal
  "saveCombo.title": "Save Combo",
  "saveCombo.comboLabel": "Combo:",
  "saveCombo.titleLabel": "Title (optional):",
  "saveCombo.placeholder": "Enter combo title...",

  // Saved combos
  "savedCombos.title": "My Combos",
  "savedCombos.empty": "No saved combos yet",
  "savedCombos.emptyHint": "Save combos from the Combo Builder to see them here",
  "savedCombos.copiedTitle": "Copied!",
  "savedCombos.copiedMessage": "Combo has been copied to clipboard.",
  "savedCombos.deleteTitle": "Delete Combo",
  "savedCombos.deleteMessage": 'Are you sure you want to delete "{title}"?',
  "savedCombos.untitled": "Untitled Combo",

  // Random combo generation
  "random.notEnoughTitle": "Not Enough Tricks",
  "random.notEnoughMessage": "You need at least {count} tricks available.",
  "random.failedTitle": "Could Not Generate",
  "random.failedMessage":
    "Could not find a valid combination after many attempts. Try adding more tricks.",

  // Preferences modal
  "prefs.title": "Preferences",
  "prefs.onlyLanded": "Include Only Landed Tricks",
  "prefs.minLevel": "Minimum Level",
  "prefs.maxLevel": "Maximum Level",
  "prefs.comboSize": "Random combo size",
  "prefs.comboSizeHint":
    "Choose how many tricks the Random button should pick (1–10).",

  // Profile
  "profile.currentLevel": "CURRENT LEVEL",
  "profile.levelProgress": "LEVEL PROGRESS",
  "profile.allLevelsProgress": "all levels progress",
  "profile.nextTricks": "Next Tricks to Master",
  "profile.allNextLearns": "All next Learns",
  "profile.language": "Language",
  "profile.unranked": "Unranked",
  "profile.newToTricks": "New to tricks",
  "profile.wellRounded": "Well Rounded",
  "profile.kicker": "Kicker",
  "profile.flipper": "Flipper",
  "profile.twister": "Twister",

  // All levels progress
  "progress.title": "Level Progress",
  "progress.overall": "Overall Progress",
  "progress.mastered": "Mastered",
  "progress.subtitle": "Track your progress across all skill levels",
  "progress.levelStats": "{landed} / {total} tricks",
  "progress.overallStats": "{landed} / {total} tricks landed",

  // Feedback
  "feedback.title": "Send Feedback",
  "feedback.namePlaceholder": "Your Name",
  "feedback.emailPlaceholder": "Your Email",
  "feedback.subjectPlaceholder": "Select subject",
  "feedback.messagePlaceholder": "Your Message",
  "feedback.submit": "Submit",
  "feedback.subjectBug": "Bug Report",
  "feedback.subjectContributeDev": "Contribute to Development",
  "feedback.subjectContributeFunds": "Contribute Funds",
  "feedback.subjectWrongInfo": "Wrong Trick Info",
  "feedback.validationTitle": "Validation Error",
  "feedback.validationName": "Name is required (max 30 characters).",
  "feedback.validationEmail": "Email is required (max 30 characters).",
  "feedback.validationMessage": "Message must be between 20 and 300 characters.",
  "feedback.successTitle": "✅ Success",
  "feedback.errorTitle": "❌ Error",
  "feedback.successMessage": "Your feedback was sent successfully!",
  "feedback.errorMessage": "Failed to send feedback. Please try again later.",

  // Tabs
  "tab.tricks": "Tricks",
  "tab.profile": "Profile",
  "tab.combo": "Combo",

  // Filters
  "filter.kick": "Kick",
  "filter.flip": "Flip",
  "filter.twist": "Twist",
  "filter.transition": "Transition",
  "filter.landed": "Landed",
  "filter.nextLearns": "Next Learns",
  "filter.favorites": "Favorites",
  "filter.category.level": "Level",
  "filter.category.type": "Type",
  "filter.category.learnLanded": "Learn/Landed",

  // Skill levels
  "level.0": "Novice",
  "level.1": "Beginner",
  "level.2": "Intermediate",
  "level.3": "Advanced",
  "level.4": "Elite",
  "level.5": "Ascendant",
  "level.6": "Transcendent",
  "level.7": "Godlike",

  // Landing stances
  "stance.frontside": "Frontside",
  "stance.semi": "Semi",
  "stance.mega": "Mega",
  "stance.backside": "Backside",
  "stance.hyper": "Hyper",
  "stance.complete": "Complete",
  "stance.fake-mega": "Fake Mega",

  // Combo transition connectors
  "transition.punch": "punch",
  "transition.step-out": "step-out",
  "transition.frontswing": "frontswing",
  "transition.misleg": "misleg",
  "transition.vanish": "vanish",
  "transition.swing": "swing",
  "transition.re-direct": "re-direct",
  "transition.carry-through": "carry-through",
  "transition.wrap": "wrap",
  "transition.reverse": "reverse",
  "transition.pop": "pop",
  "transition.boneless": "boneless",

  // Takeoffs
  "takeoff.frontside": "Frontside",
  "takeoff.pop": "Pop",
  "takeoff.front-vanish": "Front Vanish",
  "takeoff.regular": "Regular",
  "takeoff.backside": "Backside",
  "takeoff.fake-backside": "Fake Backside",
  "takeoff.master-swing": "Master Swing",
  "takeoff.swing": "Swing",
  "takeoff.wrap": "Wrap",
  "takeoff.back-vanish": "Back Vanish",
};

export type TranslationKey = keyof typeof en;

const he: Record<TranslationKey, string> = {
  // Shared
  "common.cancel": "ביטול",
  "common.save": "שמירה",
  "common.delete": "מחיקה",
  "common.copy": "העתקה",
  "common.clear": "ניקוי",
  "common.yes": "כן",
  "common.no": "לא",
  "common.unknown": "לא ידוע",
  "common.none": "אין",

  // Welcome
  "welcome.title": "TrickaDex",
  "welcome.subtitle": "עקבו אחרי מסע הטריקינג שלכם",
  "welcome.namePrompt": "איך קוראים לך?",
  "welcome.namePlaceholder": "הכניסו את שמכם",
  "welcome.language": "שפה",

  // Trick list
  "trickList.title": "Trickadex",
  "trickList.feedback": "משוב",
  "trickList.noMatch": "אין טריקים שמתאימים לסינון שנבחר",
  "trickList.empty": "לא נמצאו טריקים",
  "trickList.clearFilters": "ניקוי סינון",

  // Search bar
  "search.close": "סגירת חיפוש",
  "search.open": "פתיחת חיפוש",
  "search.activeFilters": "סינונים פעילים",
  "search.placeholder": "חיפוש טריקים או סינון...",
  "search.inputLabel": "שדה חיפוש",
  "search.inputHint": "הקלידו שם של טריק או בחרו סינון",

  // Trick card info
  "trickInfo.skillLevel": "רמת קושי:",
  "trickInfo.prerequisites": "דרישות קדם:",
  "trickInfo.watchTutorial": "צפייה במדריך",
  "trickInfo.excludeFromRandom": "אל תכלול בקומבו אקראי",

  // Combo builder
  "combo.title": "בניית קומבו",
  "combo.myCombos": "הקומבואים שלי",
  "combo.yourTricks": "הטריקים שלך",
  "combo.noMatch": "אין טריקים שמתאימים לסינון שנבחר",
  "combo.noLanded": "עדיין לא נחתו טריקים",
  "combo.build": "בנו את הקומבו שלכם",
  "combo.random": "אקראי",
  "combo.clear": "ניקוי",
  "combo.tricksAvailable": "{count} טריקים זמינים",
  "combo.emptyHint": "גררו טריקים כדי לבנות את הקומבו",
  "combo.label": "קומבו:",
  "combo.save": "שמירת קומבו",
  "combo.copiedToClipboard": "הקומבו הועתק ללוח.",
  "combo.noComboTitle": "אין קומבו",
  "combo.noComboMessage": "בנו קומבו לפני השמירה.",
  "combo.savedTitle": "נשמר!",
  "combo.savedMessage": "הקומבו שלכם נשמר.",

  // Combo drop zone
  "dropZone.title": "גררו טריקים לכאן",
  "dropZone.subtitle": "בנו את הקומבו שלכם על ידי גרירת טריקים מלמעלה",

  // Save combo modal
  "saveCombo.title": "שמירת קומבו",
  "saveCombo.comboLabel": "קומבו:",
  "saveCombo.titleLabel": "כותרת (לא חובה):",
  "saveCombo.placeholder": "הכניסו כותרת לקומבו...",

  // Saved combos
  "savedCombos.title": "הקומבואים שלי",
  "savedCombos.empty": "עדיין אין קומבואים שמורים",
  "savedCombos.emptyHint": "שמרו קומבואים מבניית הקומבו כדי לראות אותם כאן",
  "savedCombos.copiedTitle": "הועתק!",
  "savedCombos.copiedMessage": "הקומבו הועתק ללוח.",
  "savedCombos.deleteTitle": "מחיקת קומבו",
  "savedCombos.deleteMessage": 'למחוק את "{title}"?',
  "savedCombos.untitled": "קומבו ללא כותרת",

  // Random combo generation
  "random.notEnoughTitle": "אין מספיק טריקים",
  "random.notEnoughMessage": "צריך לפחות {count} טריקים זמינים.",
  "random.failedTitle": "לא ניתן ליצור קומבו",
  "random.failedMessage":
    "לא נמצא שילוב תקין אחרי נסיונות רבים. נסו להוסיף עוד טריקים.",

  // Preferences modal
  "prefs.title": "העדפות",
  "prefs.onlyLanded": "כלול רק טריקים שנחתו",
  "prefs.minLevel": "רמה מינימלית",
  "prefs.maxLevel": "רמה מקסימלית",
  "prefs.comboSize": "אורך קומבו אקראי",
  "prefs.comboSizeHint": "בחרו כמה טריקים כפתור האקראי יבחר (1–10).",

  // Profile
  "profile.currentLevel": "רמה נוכחית",
  "profile.levelProgress": "התקדמות ברמה",
  "profile.allLevelsProgress": "התקדמות בכל הרמות",
  "profile.nextTricks": "הטריקים הבאים ללמידה",
  "profile.allNextLearns": "כל הטריקים הבאים",
  "profile.language": "שפה",
  "profile.unranked": "ללא דירוג",
  "profile.newToTricks": "חדש בטריקינג",
  "profile.wellRounded": "מגוון",
  "profile.kicker": "קיקר",
  "profile.flipper": "פליפר",
  "profile.twister": "טוויסטר",

  // All levels progress
  "progress.title": "התקדמות ברמות",
  "progress.overall": "התקדמות כוללת",
  "progress.mastered": "הושלם",
  "progress.subtitle": "עקבו אחרי ההתקדמות שלכם בכל רמות הקושי",
  "progress.levelStats": "{landed} / {total} טריקים",
  "progress.overallStats": "{landed} / {total} טריקים נחתו",

  // Feedback
  "feedback.title": "שליחת משוב",
  "feedback.namePlaceholder": "השם שלכם",
  "feedback.emailPlaceholder": "האימייל שלכם",
  "feedback.subjectPlaceholder": "בחרו נושא",
  "feedback.messagePlaceholder": "ההודעה שלכם",
  "feedback.submit": "שליחה",
  "feedback.subjectBug": "דיווח על באג",
  "feedback.subjectContributeDev": "תרומה לפיתוח",
  "feedback.subjectContributeFunds": "תרומה כספית",
  "feedback.subjectWrongInfo": "מידע שגוי על טריק",
  "feedback.validationTitle": "שגיאת אימות",
  "feedback.validationName": "חובה למלא שם (עד 30 תווים).",
  "feedback.validationEmail": "חובה למלא אימייל (עד 30 תווים).",
  "feedback.validationMessage": "ההודעה חייבת להכיל בין 20 ל-300 תווים.",
  "feedback.successTitle": "✅ נשלח",
  "feedback.errorTitle": "❌ שגיאה",
  "feedback.successMessage": "המשוב שלכם נשלח בהצלחה!",
  "feedback.errorMessage": "שליחת המשוב נכשלה. נסו שוב מאוחר יותר.",

  // Tabs
  "tab.tricks": "טריקים",
  "tab.profile": "פרופיל",
  "tab.combo": "קומבו",

  // Filters
  "filter.kick": "בעיטה",
  "filter.flip": "סלטה",
  "filter.twist": "טוויסט",
  "filter.transition": "מעבר",
  "filter.landed": "נחת",
  "filter.nextLearns": "הבא ללמידה",
  "filter.favorites": "מועדפים",
  "filter.category.level": "רמה",
  "filter.category.type": "סוג",
  "filter.category.learnLanded": "למידה/נחיתה",

  // Skill levels
  "level.0": "מתחיל מוחלט",
  "level.1": "מתחיל",
  "level.2": "בינוני",
  "level.3": "מתקדם",
  "level.4": "עילית",
  "level.5": "מצטיין",
  "level.6": "נשגב",
  "level.7": "אלוהי",

  // Landing stances
  "stance.frontside": "פרונטסייד",
  "stance.semi": "סמי",
  "stance.mega": "מגה",
  "stance.backside": "בקסייד",
  "stance.hyper": "הייפר",
  "stance.complete": "קומפליט",
  "stance.fake-mega": "פייק מגה",

  // Combo transition connectors
  "transition.punch": "פאנץ'",
  "transition.step-out": "סטפ אאוט",
  "transition.frontswing": "פרונט סווינג",
  "transition.misleg": "מיסלג",
  "transition.vanish": "ואניש",
  "transition.swing": "סווינג",
  "transition.re-direct": "רי-דיירקט",
  "transition.carry-through": "קארי טרו",
  "transition.wrap": "ווראפ",
  "transition.reverse": "ריברס",
  "transition.pop": "פופ",
  "transition.boneless": "בונלס",

  // Takeoffs
  "takeoff.frontside": "פרונטסייד",
  "takeoff.pop": "פופ",
  "takeoff.front-vanish": "פרונט ואניש",
  "takeoff.regular": "רגיל",
  "takeoff.backside": "בקסייד",
  "takeoff.fake-backside": "פייק בקסייד",
  "takeoff.master-swing": "מאסטר סווינג",
  "takeoff.swing": "סווינג",
  "takeoff.wrap": "ווראפ",
  "takeoff.back-vanish": "בק ואניש",
};

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  he,
};
