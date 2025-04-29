
import React, { createContext, useState, useContext, ReactNode } from "react";

// Define available languages and translations
export type Language = "en" | "el";

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    // Home page
    "app.title": "Car Scanner App",
    "app.subtitle": "Intelligent vehicle inspection system",
    "how.works": "How it works",
    "how.works.description": "Select a recognition method below to start analyzing your vehicle. You can identify car parts, detect damages, or perform a complete scan using photos or videos.",
    "photo.recognition": "Photo Recognition",
    "photo.analysis": "Photo Analysis",
    "photo.analysis.description": "Upload or take photos to identify car parts and damages",
    "video.recognition": "Video Recognition",
    "video.analysis": "Video Analysis",
    "video.analysis.description": "Record or upload videos for more comprehensive inspection",
    
    // Recognition pages
    "select.analysis.type": "Select an analysis type",
    "car.parts": "Car Parts",
    "car.parts.description": "Identify different parts of your vehicle",
    "damage.detection": "Damage Detection",
    "damage.detection.description": "Detect and analyze vehicle damages",
    "full.scan": "Full Scan",
    "full.scan.description": "Combined analysis of parts and damages",
    
    // Analysis pages
    "car.parts.detection": "Car Parts Detection",
    "upload.capture.photo": "Upload or capture a photo to analyze",
    "upload.record.video": "Upload or record a video to analyze",
    "analyze.image": "Analyze Image",
    "analyzing": "Analyzing...",
    "reset": "Reset",
    "analysis.complete": "Analysis complete",
    "detections.found": "{count} detections found",
    "no.image": "No image selected",
    "select.capture.first": "Please select or capture an image first",
    "analysis.failed": "Analysis failed",
    "error.analyzing": "There was an error analyzing the image. Please try again.",
  },
  el: {
    // Home page
    "app.title": "Car Scanner App",
    "app.subtitle": "Έξυπνο σύστημα επιθεώρησης οχημάτων",
    "how.works": "Πώς λειτουργεί",
    "how.works.description": "Επιλέξτε μια μέθοδο αναγνώρισης παρακάτω για να ξεκινήσετε την ανάλυση του οχήματός σας. Μπορείτε να αναγνωρίσετε εξαρτήματα αυτοκινήτων, να εντοπίσετε ζημιές ή να εκτελέσετε πλήρη σάρωση με φωτογραφίες ή βίντεο.",
    "photo.recognition": "Αναγνώριση Φωτογραφίας",
    "photo.analysis": "Ανάλυση Φωτογραφίας",
    "photo.analysis.description": "Ανεβάστε ή τραβήξτε φωτογραφίες για αναγνώριση εξαρτημάτων και ζημιών",
    "video.recognition": "Αναγνώριση Βίντεο",
    "video.analysis": "Ανάλυση Βίντεο",
    "video.analysis.description": "Καταγράψτε ή ανεβάστε βίντεο για πιο ολοκληρωμένη επιθεώρηση",
    
    // Recognition pages
    "select.analysis.type": "Επιλέξτε τύπο ανάλυσης",
    "car.parts": "Εξαρτήματα Αυτοκινήτου",
    "car.parts.description": "Αναγνωρίστε διαφορετικά μέρη του οχήματός σας",
    "damage.detection": "Ανίχνευση Ζημιών",
    "damage.detection.description": "Εντοπίστε και αναλύστε ζημιές οχημάτων",
    "full.scan": "Πλήρης Σάρωση",
    "full.scan.description": "Συνδυασμένη ανάλυση εξαρτημάτων και ζημιών",
    
    // Analysis pages
    "car.parts.detection": "Ανίχνευση Εξαρτημάτων Αυτοκινήτου",
    "upload.capture.photo": "Ανεβάστε ή τραβήξτε μια φωτογραφία για ανάλυση",
    "upload.record.video": "Ανεβάστε ή καταγράψτε ένα βίντεο για ανάλυση",
    "analyze.image": "Ανάλυση Εικόνας",
    "analyzing": "Γίνεται ανάλυση...",
    "reset": "Επαναφορά",
    "analysis.complete": "Η ανάλυση ολοκληρώθηκε",
    "detections.found": "Βρέθηκαν {count} ανιχνεύσεις",
    "no.image": "Δεν επιλέχθηκε εικόνα",
    "select.capture.first": "Παρακαλώ επιλέξτε ή τραβήξτε πρώτα μια εικόνα",
    "analysis.failed": "Η ανάλυση απέτυχε",
    "error.analyzing": "Υπήρξε σφάλμα κατά την ανάλυση της εικόνας. Παρακαλώ δοκιμάστε ξανά.",
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[language][key] || key;
    if (!params) return translation;
    
    return Object.entries(params).reduce((acc, [param, value]) => {
      return acc.replace(`{${param}}`, String(value));
    }, translation);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
