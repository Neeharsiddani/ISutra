// ============================================================
// ISutra: SIH26108 Multilingual Procurement Input Service
// Safe, focused multilingual input layer for English, Hindi, and Telugu
// Transforms natural-language Indic procurement descriptions into
// standardized, language-independent structured requirements.
// ============================================================

export type SupportedLanguage = 'en' | 'hi' | 'te';
export type DetectedLanguage = 'en' | 'hi' | 'te' | 'mixed' | 'unsupported';
export type DetectionMethod =
  | 'user_selected'
  | 'script_heuristic'
  | 'ai_detected'
  | 'fallback_default';

export interface LanguageMetadata {
  detected_language: DetectedLanguage;
  detected_language_label: string;
  detection_method: DetectionMethod;
  confidence: number;
  is_supported: boolean;
  user_selected_language?: string;
  details?: string;
}

/**
 * Detect the language of input procurement text based on script analysis
 * or explicit user selection.
 */
export function detectInputLanguage(
  text: string,
  userSelected: string = 'auto'
): LanguageMetadata {
  const normalizedUser = (userSelected || 'auto').toLowerCase().trim();

  // If user explicitly chose a supported language
  if (normalizedUser === 'en') {
    return {
      detected_language: 'en',
      detected_language_label: 'English',
      detection_method: 'user_selected',
      confidence: 1.0,
      is_supported: true,
      user_selected_language: 'en',
    };
  }

  if (normalizedUser === 'hi') {
    return {
      detected_language: 'hi',
      detected_language_label: 'Hindi',
      detection_method: 'user_selected',
      confidence: 1.0,
      is_supported: true,
      user_selected_language: 'hi',
    };
  }

  if (normalizedUser === 'te') {
    return {
      detected_language: 'te',
      detected_language_label: 'Telugu',
      detection_method: 'user_selected',
      confidence: 1.0,
      is_supported: true,
      user_selected_language: 'te',
    };
  }

  // Automatic script heuristic detection
  if (!text || text.trim().length === 0) {
    return {
      detected_language: 'en',
      detected_language_label: 'Undetermined (Empty)',
      detection_method: 'fallback_default',
      confidence: 0.0,
      is_supported: true,
      user_selected_language: 'auto',
    };
  }

  const trimmed = text.trim();

  // Script character counters
  let devanagariCount = 0; // Hindi [\u0900-\u097F]
  let teluguCount = 0;     // Telugu [\u0C00-\u0C7F]
  let latinCount = 0;      // English [a-zA-Z]
  let unsupportedCount = 0;// Other scripts (Cyrillic, Arabic, CJK, etc.)

  for (const char of trimmed) {
    const code = char.charCodeAt(0);

    if (code >= 0x0900 && code <= 0x097f) {
      devanagariCount++;
    } else if (code >= 0x0c00 && code <= 0x0c7f) {
      teluguCount++;
    } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      latinCount++;
    } else if (
      (code >= 0x0400 && code <= 0x04ff) || // Cyrillic
      (code >= 0x0600 && code <= 0x06ff) || // Arabic
      (code >= 0x4e00 && code <= 0x9fff) || // CJK
      (code >= 0x0b80 && code <= 0x0bff) || // Tamil
      (code >= 0x0980 && code <= 0x09ff) || // Bengali
      (code >= 0x0c80 && code <= 0x0cff) || // Kannada
      (code >= 0x0d00 && code <= 0x0d7f)    // Malayalam
    ) {
      unsupportedCount++;
    }
  }

  const totalLetters = devanagariCount + teluguCount + latinCount + unsupportedCount;

  // If no script letters were found (e.g. only numbers or punctuation)
  if (totalLetters === 0) {
    return {
      detected_language: 'en',
      detected_language_label: 'Undetermined (Defaulted to English)',
      detection_method: 'fallback_default',
      confidence: 0.5,
      is_supported: true,
      user_selected_language: 'auto',
    };
  }

  // Unsupported script check
  if (unsupportedCount > 0 && devanagariCount === 0 && teluguCount === 0 && unsupportedCount >= latinCount) {
    return {
      detected_language: 'unsupported',
      detected_language_label: 'Unsupported Language',
      detection_method: 'script_heuristic',
      confidence: 0.9,
      is_supported: false,
      user_selected_language: 'auto',
      details: 'Language script not supported in current prototype. Supported input languages are English, Hindi, and Telugu.',
    };
  }

  // Mixed language checks (e.g., technical ratings in English mixed with Indic descriptions)
  if (devanagariCount > 0 && latinCount > 0) {
    const devRatio = devanagariCount / totalLetters;
    const latRatio = latinCount / totalLetters;
    if (devRatio >= 0.15 && latRatio >= 0.15) {
      return {
        detected_language: 'mixed',
        detected_language_label: 'Mixed (Hindi / English)',
        detection_method: 'script_heuristic',
        confidence: 0.9,
        is_supported: true,
        user_selected_language: 'auto',
      };
    }
  }

  if (teluguCount > 0 && latinCount > 0) {
    const telRatio = teluguCount / totalLetters;
    const latRatio = latinCount / totalLetters;
    if (telRatio >= 0.15 && latRatio >= 0.15) {
      return {
        detected_language: 'mixed',
        detected_language_label: 'Mixed (Telugu / English)',
        detection_method: 'script_heuristic',
        confidence: 0.9,
        is_supported: true,
        user_selected_language: 'auto',
      };
    }
  }

  // Predominant script
  if (devanagariCount > teluguCount && devanagariCount > latinCount) {
    return {
      detected_language: 'hi',
      detected_language_label: 'Hindi',
      detection_method: 'script_heuristic',
      confidence: 0.95,
      is_supported: true,
      user_selected_language: 'auto',
    };
  }

  if (teluguCount > devanagariCount && teluguCount > latinCount) {
    return {
      detected_language: 'te',
      detected_language_label: 'Telugu',
      detection_method: 'script_heuristic',
      confidence: 0.95,
      is_supported: true,
      user_selected_language: 'auto',
    };
  }

  return {
    detected_language: 'en',
    detected_language_label: 'English',
    detection_method: 'script_heuristic',
    confidence: 0.95,
    is_supported: true,
    user_selected_language: 'auto',
  };
}

/**
 * Domain Procurement Vocabulary Concept Map for Hindi & Telugu
 * Maps high-frequency procurement expressions to standardized English concepts.
 */
export interface IndicConceptMatch {
  productName?: string;
  category?: string;
  productSource?: string;
  application?: string;
  applicationSource?: string;
  industry?: string;
  environment: Array<{ name: string; source_text?: string }>;
  installation: Array<{ name: string; source_text?: string }>;
  parameters: Array<{ parameter: string; value: string; unit?: string; source_text?: string }>;
}

export function translateIndicProcurementConcepts(text: string): IndicConceptMatch {
  const match: IndicConceptMatch = {
    environment: [],
    installation: [],
    parameters: [],
  };

  // 1. LED Street Lighting
  // Hindi: एलईडी स्ट्रीट लाइट, स्ट्रीट लाइट, मार्ग प्रकाश, सड़क प्रकाश, सड़क की बत्ती
  // Telugu: ఎల్‌ఈడీ స్ట్రీట్ లైట్లు, వీధి దీపాలు, స్ట్రీట్ లైట్లు, రోడ్డు దీపాలు
  const ledMatch =
    text.match(/(?:एलईडी\s+)?(?:स्ट्रीट\s+)?(?:लाइट(?:्स)?|प्रकाश|दीपक|ल्यूमिनेयर)|सड़क\s+की\s+बत्ती/i) ||
    text.match(/(?:ఎల్\s*ఈ\s*డీ|ఎల్‌ఈడీ)\s+(?:స్ట్రీట్\s+)?(?:లైట్(?:లు)?|దీపాలు|లైటింగ్)|వీధి\s+దీపాలు/i);

  if (ledMatch) {
    match.productName = 'LED street lighting luminaire';
    match.category = 'Lighting & Luminaires';
    match.productSource = ledMatch[0];
  }

  // 2. Cables
  // Hindi: विद्युत केबल, एक्सएलपीई केबल, पावर केबल, पीवीसी केबल
  // Telugu: విద్యుత్ కేబుల్స్, ఎక్స్ఎల్పీఈ కేబుల్స్, పవర్ కేబుల్స్
  const xlpeMatch =
    text.match(/(?:एक्स\s*एल\s*पी\s*ई|एक्सएलपीई)\s+(?:इंसुलेटेड\s+)?(?:पावर\s+)?केबल/i) ||
    text.match(/(?:ఎక్స్\s*ఎల్\s*పీ\s*ఈ|ఎక్స్‌ఎల్‌పీఈ)\s+(?:విద్యుత్\s+)?కేబుల్(?:లు)?/i);

  if (xlpeMatch) {
    match.productName = 'XLPE insulated power cables';
    match.category = 'Cables & Conductors';
    match.productSource = xlpeMatch[0];
  } else {
    const pvcMatch =
      text.match(/पीवीसी\s+(?:इंसुलेटेड\s+)?केबल/i) ||
      text.match(/పీవీసీ\s+(?:విద్యుత్\s+)?కేబుల్(?:లు)?/i);
    if (pvcMatch) {
      match.productName = 'PVC insulated electric cables';
      match.category = 'Cables & Conductors';
      match.productSource = pvcMatch[0];
    } else {
      const elecMatch =
        text.match(/विद्युत\s+केबल|पावर\s+केबल/i) ||
        text.match(/విద్యుత్\s+కేబుల్(?:లు)?|పవర్\s+కేబుల్(?:లు)?/i);
      if (elecMatch) {
        match.productName = 'Industrial electrical cables';
        match.category = 'Cables & Conductors';
        match.productSource = elecMatch[0];
      }
    }
  }

  // 3. Concrete & Construction
  const concreteMatch =
    text.match(/(?:प्रबलित\s+)?कंक्रीट|सीमेंट\s+कंक्रीट/i) ||
    text.match(/కాంక్రీట్|సిమెంట్\s+కాంక్రీట్/i);
  if (concreteMatch && !match.productName) {
    match.productName = 'Plain and reinforced concrete';
    match.category = 'Civil & Concrete';
    match.productSource = concreteMatch[0];
  }

  // 4. PPE - Safety Footwear & Gloves
  const shoesMatch =
    text.match(/सुरक्षा\s+जूते|सेफ्टी\s+शूज/i) ||
    text.match(/భద్రతా\s+బూట్లు|సేఫ్టీ\s+షూస్/i);
  if (shoesMatch && !match.productName) {
    match.productName = 'Safety footwear';
    match.category = 'Personal Protective Equipment';
    match.productSource = shoesMatch[0];
  }

  const glovesMatch =
    text.match(/सुरक्षा\s+दस्ताने/i) ||
    text.match(/రక్షణ\s+చేతి\s+తొడుగులు|గ్లోవ్స్/i);
  if (glovesMatch && !match.productName) {
    match.productName = 'Mechanical protective gloves';
    match.category = 'Personal Protective Equipment';
    match.productSource = glovesMatch[0];
  }

  // 5. Bricks
  const brickMatch =
    text.match(/(?:मिट्टी\s+की\s+)?ईंट(?:ें)?/i) ||
    text.match(/(?:మట్టి\s+)?ఇటుకలు/i);
  if (brickMatch && !match.productName) {
    match.productName = 'Burnt clay building bricks';
    match.category = 'Masonry & Bricks';
    match.productSource = brickMatch[0];
  }

  // Application Mapping
  const appMatch =
    text.match(/नगर\s+निगम|नगरपालिका|सड़क(?:ों)?|मार्ग\s+प्रकाश|सड़क\s+प्रकाश|राजमार्ग/i) ||
    text.match(/మున్సిపల్|మునిసిపల్|రోడ్లు|రహదారులు|హైవేలు|వీధి\s*దీపాలు|వీధి/i);
  if (appMatch) {
    match.application = 'Highway & Municipal road lighting';
    match.applicationSource = appMatch[0];
    match.industry = 'Urban Infrastructure / Municipal';
  } else {
    const underMatch = text.match(/भूमिगत/i) || text.match(/భూగర్భ/i);
    if (underMatch) {
      match.application = 'Underground power transmission and distribution network';
      match.applicationSource = underMatch[0];
      match.industry = 'Power & Utilities';
    } else {
      const structMatch =
        text.match(/पुल|इमारत|भवन\s+निर्माण|संरचनात्मक/i) ||
        text.match(/వంతెన|భవనం|భవన\s+నిర్మాణం/i);
      if (structMatch) {
        match.application = 'General structural construction and infrastructure';
        match.applicationSource = structMatch[0];
        match.industry = 'Civil Construction';
      }
    }
  }

  // Environment Mapping
  const outdoorMatch =
    text.match(/बाहरी|बाहर|खुले\s+में/i) ||
    text.match(/బహిరంగ|బయట/i);
  if (outdoorMatch) {
    match.environment.push({
      name: 'Outdoor',
      source_text: outdoorMatch[0],
    });
  }

  const weatherMatch =
    text.match(/मौसम\s+प्रतिरोधी|जलरोधक|वाटरप्रूफ/i) ||
    text.match(/వాతావరణ\s+నిరోధక|వాటర్‌ప్రూఫ్|వర్ష\s+నిరోధక/i);
  if (weatherMatch) {
    match.environment.push({
      name: 'Weather resistant',
      source_text: weatherMatch[0],
    });
  }

  // Installation Mapping
  const poleMatch =
    text.match(/पोल\s+माउंटेड|खंभे\s+पर(?:\s+स्थापित)?|खंभे\s+माउंटिंग/i) ||
    text.match(/పోల్\s+మౌంటెడ్|స్తంభంపై(?:\s+అమర్చిన)?/i);
  if (poleMatch) {
    match.installation.push({
      name: 'Pole mounted',
      source_text: poleMatch[0],
    });
  }

  // Technical Parameters Extraction (Numbers with Indic/Latin units)
  // Power: 100 वाट / 100 वॉट / 100 వాట్లు / 100W
  const powerMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:वाट|वॉट|वाట్లు|వాట్|w\b|watt)/i);
  if (powerMatch) {
    match.parameters.push({
      parameter: 'Power',
      value: `${powerMatch[1]}W`,
      unit: 'W',
      source_text: powerMatch[0],
    });
  }

  // Ingress Protection: IP65 / आईपी65 / ఐపీ65
  const ipMatch = text.match(/(?:ip|आईपी|ఐపీ)\s*(\d{2})/i);
  if (ipMatch) {
    match.parameters.push({
      parameter: 'Ingress Protection',
      value: `IP${ipMatch[1]}`,
      unit: 'Rating',
      source_text: ipMatch[0],
    });
  }

  // Voltage: 11kV / 11 केवी / 11 కేవీ / 230V
  const kvMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:केवी|కేవీ|kv\b|kilovolt)/i);
  if (kvMatch) {
    match.parameters.push({
      parameter: 'Operating Voltage',
      value: `${kvMatch[1]}kV`,
      unit: 'kV',
      source_text: kvMatch[0],
    });
  }

  // Surge Protection: 10kV सर्ज / 10 కేవీ సర్జ్
  const surgeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:केवी|కేవీ|kv\b)\s*(?:सर्ज|సర్జ్|surge)/i) ||
                     text.match(/(?:सर्ज|సర్జ్|surge)\s*(?:सुरक्षा|రక్షణ)?\s*[:\-]?\s*(\d+(?:\.\d+)?\s*(?:केवी|కేవీ|kv\b|v\b))/i);
  if (surgeMatch) {
    const surgeVal = surgeMatch[1].replace(/केवी|కేవీ/i, 'kV').trim();
    match.parameters.push({
      parameter: 'Surge Protection',
      value: surgeVal.endsWith('kV') || surgeVal.endsWith('V') ? surgeVal : `${surgeVal}kV`,
      unit: 'kV',
      source_text: surgeMatch[0],
    });
  }

  return match;
}
