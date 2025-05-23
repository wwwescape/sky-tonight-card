import { en } from "./en";
export type TranslationKey = `card.${keyof typeof en.card}` | `objects.${keyof typeof en.objects}` | `moonPhases.${keyof typeof en.moonPhases}` | `types.${keyof typeof en.types}` | `time.${keyof typeof en.time}` | `editor.${keyof typeof en.editor}` | `languages.${keyof typeof en.languages}`;
export declare const translations: {
    readonly en: {
        readonly card: {
            readonly title: "Sky Tonight";
            readonly latitude: "Latitude";
            readonly longitude: "Longitude";
            readonly elevation: "Elevation";
            readonly moonPhase: "Moon Phase";
            readonly visible: "Visible";
            readonly duration: "Duration";
            readonly altitude: "Altitude";
            readonly nakedEye: "Naked Eye";
            readonly binocular: "Binocular";
            readonly telescope: "Telescope";
        };
        readonly objects: {
            readonly Sun: "Sun";
            readonly Moon: "Moon";
            readonly Mercury: "Mercury";
            readonly Venus: "Venus";
            readonly Mars: "Mars";
            readonly Jupiter: "Jupiter";
            readonly Saturn: "Saturn";
            readonly Uranus: "Uranus";
            readonly Neptune: "Neptune";
            readonly Pluto: "Pluto";
        };
        readonly moonPhases: {
            readonly "New Moon": "New Moon";
            readonly "Waxing Crescent": "Waxing Crescent";
            readonly "First Quarter": "First Quarter";
            readonly "Waxing Gibbous": "Waxing Gibbous";
            readonly "Full Moon": "Full Moon";
            readonly "Waning Gibbous": "Waning Gibbous";
            readonly "Last Quarter": "Last Quarter";
            readonly "Waning Crescent": "Waning Crescent";
        };
        readonly types: {
            readonly Star: "Star";
            readonly Planet: "Planet";
            readonly Moon: "Moon";
        };
        readonly time: {
            readonly h: "h";
            readonly m: "m";
        };
        readonly editor: {
            readonly title: "Sky Tonight Card Editor";
            readonly latitude: "Latitude";
            readonly longitude: "Longitude";
            readonly elevation: "Elevation";
            readonly elevationUnit: "meters";
            readonly languageOverride: "Language Override";
            readonly useHASetting: "Use HA Setting";
            readonly showSun: "Show Sun";
            readonly showBelowHorizon: "Show objects below horizon";
            readonly showConfiguration: "Show configuration";
            readonly colorCustomization: "Color Customization";
            readonly cardBackground: "Card Background";
            readonly cardTitle: "Card Title";
            readonly objectBackground: "Object Background";
            readonly objectName: "Object Name";
            readonly objectData: "Object Data";
            readonly objectType: "Object Type";
            readonly reset: "Reset";
            readonly optional: "optional";
            readonly yes: "Yes";
            readonly no: "No";
        };
        readonly languages: {
            readonly en: "English";
            readonly hi: "Hindi";
            readonly fr: "French";
        };
    };
    readonly hi: {
        readonly card: {
            readonly title: "आज का आकाश";
            readonly latitude: "अक्षांश";
            readonly longitude: "देशांतर";
            readonly elevation: "ऊँचाई";
            readonly moonPhase: "चंद्रमा की अवस्था";
            readonly visible: "दृश्य";
            readonly duration: "अवधि";
            readonly altitude: "ऊंचाई";
            readonly nakedEye: "नंगी आँखों से";
            readonly binocular: "दूरबीन से";
            readonly telescope: "दूरदर्शी से";
        };
        readonly objects: {
            readonly Sun: "सूर्य";
            readonly Moon: "चंद्रमा";
            readonly Mercury: "बुध";
            readonly Venus: "शुक्र";
            readonly Mars: "मंगल";
            readonly Jupiter: "बृहस्पति";
            readonly Saturn: "शनि";
            readonly Uranus: "यूरेनस";
            readonly Neptune: "नेपच्यून";
            readonly Pluto: "प्लूटो";
        };
        readonly moonPhases: {
            readonly "New Moon": "अमावस्या";
            readonly "Waxing Crescent": "बढ़ता हुआ अर्धचंद्र";
            readonly "First Quarter": "प्रथम चतुर्थांश";
            readonly "Waxing Gibbous": "बढ़ता हुआ गिबस";
            readonly "Full Moon": "पूर्णिमा";
            readonly "Waning Gibbous": "घटता हुआ गिबस";
            readonly "Last Quarter": "अंतिम चतुर्थांश";
            readonly "Waning Crescent": "घटता हुआ अर्धचंद्र";
        };
        readonly types: {
            readonly Star: "तारा";
            readonly Planet: "ग्रह";
            readonly Moon: "चंद्रमा";
        };
        readonly time: {
            readonly h: "घं";
            readonly m: "मि";
        };
        readonly editor: {
            readonly title: "आज का आकाश कार्ड संपादक";
            readonly latitude: "अक्षांश";
            readonly longitude: "देशांतर";
            readonly elevation: "ऊँचाई";
            readonly elevationUnit: "मीटर";
            readonly languageOverride: "भाषा अधिरोपण";
            readonly useHASetting: "HA सेटिंग का उपयोग करें";
            readonly showSun: "सूर्य दिखाएँ";
            readonly showBelowHorizon: "क्षितिज के नीचे वस्तुएँ दिखाएँ";
            readonly showConfiguration: "कॉन्फ़िगरेशन दिखाएँ";
            readonly colorCustomization: "रंग अनुकूलन";
            readonly cardBackground: "कार्ड पृष्ठभूमि";
            readonly cardTitle: "कार्ड शीर्षक";
            readonly objectBackground: "वस्तु की पृष्ठभूमि";
            readonly objectName: "वस्तु का नाम";
            readonly objectData: "वस्तु डेटा";
            readonly objectType: "वस्तु प्रकार";
            readonly reset: "रीसेट करें";
            readonly optional: "वैकल्पिक";
            readonly yes: "हाँ";
            readonly no: "नहीं";
        };
        readonly languages: {
            readonly en: "अंग्रेज़ी";
            readonly hi: "हिंदी";
            readonly fr: "फ्रेंच";
        };
    };
    readonly fr: {
        readonly card: {
            readonly title: "Ciel Ce Soir";
            readonly latitude: "Latitude";
            readonly longitude: "Longitude";
            readonly elevation: "Altitude";
            readonly moonPhase: "Phase Lunaire";
            readonly visible: "Visible";
            readonly duration: "Durée";
            readonly altitude: "Hauteur";
            readonly nakedEye: "À l'œil nu";
            readonly binocular: "Jumelles";
            readonly telescope: "Télescope";
        };
        readonly objects: {
            readonly Sun: "Soleil";
            readonly Moon: "Lune";
            readonly Mercury: "Mercure";
            readonly Venus: "Vénus";
            readonly Mars: "Mars";
            readonly Jupiter: "Jupiter";
            readonly Saturn: "Saturne";
            readonly Uranus: "Uranus";
            readonly Neptune: "Neptune";
            readonly Pluto: "Pluton";
        };
        readonly moonPhases: {
            readonly "New Moon": "Nouvelle Lune";
            readonly "Waxing Crescent": "Premier Croissant";
            readonly "First Quarter": "Premier Quartier";
            readonly "Waxing Gibbous": "Lune Gibbeuse Croissante";
            readonly "Full Moon": "Pleine Lune";
            readonly "Waning Gibbous": "Lune Gibbeuse Décroissante";
            readonly "Last Quarter": "Dernier Quartier";
            readonly "Waning Crescent": "Dernier Croissant";
        };
        readonly types: {
            readonly Star: "Étoile";
            readonly Planet: "Planète";
            readonly Moon: "Lune";
        };
        readonly time: {
            readonly h: "h";
            readonly m: "m";
        };
        readonly editor: {
            readonly title: "Éditeur de Carte Ciel Ce Soir";
            readonly latitude: "Latitude";
            readonly longitude: "Longitude";
            readonly elevation: "Élévation";
            readonly elevationUnit: "mètres";
            readonly languageOverride: "Remplacement de la langue";
            readonly useHASetting: "Utiliser le paramètre HA";
            readonly showSun: "Afficher le Soleil";
            readonly showBelowHorizon: "Afficher les objets sous l'horizon";
            readonly showConfiguration: "Afficher la configuration";
            readonly colorCustomization: "Personnalisation des couleurs";
            readonly cardBackground: "Fond de la carte";
            readonly cardTitle: "Titre de la carte";
            readonly objectBackground: "Fond de l'objet";
            readonly objectName: "Nom de l'objet";
            readonly objectData: "Données de l'objet";
            readonly objectType: "Type d'objet";
            readonly reset: "Réinitialiser";
            readonly optional: "optionnel";
            readonly yes: "Oui";
            readonly no: "Non";
        };
        readonly languages: {
            readonly en: "Anglais";
            readonly hi: "Hindi";
            readonly fr: "Français";
        };
    };
};
export type LanguageCode = keyof typeof translations;
