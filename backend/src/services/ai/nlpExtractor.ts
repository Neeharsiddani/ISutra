// ============================================================
// ISutra — Offline / Fallback NLP Requirement Extractor
// High-precision pattern-based extraction engine
// ============================================================

import type { StructuredRequirements, TechnicalParameterItem, TaggedRequirementItem, ClarificationQuestion, ConfidenceLevel } from './types';

export function extractWithPatternMatching(inputText: string, inputType: string): StructuredRequirements {
  const text = inputText.trim();
  const lower = text.toLowerCase();

  // 1. Identify Product & Category
  let productName = 'Unspecified Equipment';
  let category = 'General Procurement';
  let productSource: string | undefined = undefined;

  if (/led\s+street\s+lighting\s+system/i.test(text)) {
    productName = 'LED street lighting system';
    category = 'Lighting & Luminaires';
    productSource = text.match(/led\s+street\s+lighting\s+system/i)?.[0];
  } else if (/led\s+street\s+lights?/i.test(text)) {
    productName = 'LED street light';
    category = 'Lighting & Luminaires';
    productSource = text.match(/led\s+street\s+lights?/i)?.[0];
  } else if (/water\s+storage\s+tanks?/i.test(text)) {
    productName = 'Water storage tank';
    category = 'Storage Tanks & Vessels';
    productSource = text.match(/water\s+storage\s+tanks?/i)?.[0];
  } else if (/electrical\s+cables?/i.test(text)) {
    productName = 'Industrial electrical cables';
    category = 'Cables & Conductors';
    productSource = text.match(/industrial\s+electrical\s+cables?|electrical\s+cables?/i)?.[0];
  } else if (/solar\s+panels?|photovoltaic/i.test(text)) {
    productName = 'Solar photovoltaic modules';
    category = 'Renewable Energy';
    productSource = text.match(/solar\s+panels?|photovoltaic/i)?.[0];
  } else if (/diesel\s+generator/i.test(text)) {
    productName = 'Diesel generator set';
    category = 'Power Generation';
    productSource = text.match(/diesel\s+generator/i)?.[0];
  } else {
    const firstClause = text.split(/[,.;]/)[0].trim();
    if (firstClause.length > 2 && firstClause.length < 80) {
      productName = firstClause.replace(/^(procure|supply|need|purchase|requirement for)\s+/i, '');
      category = 'Specialized Equipment';
      productSource = firstClause;
    }
  }

  // 2. Application & Industry
  let application: string | null = null;
  let application_source: string | undefined = undefined;
  let industry: string | null = null;

  if (/government\s+facility/i.test(text)) {
    application = 'Government facility';
    application_source = text.match(/government\s+facility/i)?.[0];
    industry = 'Public Sector / Government';
  } else if (/municipal\s+road|highway/i.test(text)) {
    application = 'Highway & Municipal road lighting';
    application_source = text.match(/municipal\s+road\s+lighting|highway|road\s+lighting/i)?.[0];
    industry = 'Urban Infrastructure / Municipal';
  } else if (/industrial/i.test(text)) {
    application = 'Industrial installation';
    application_source = text.match(/industrial/i)?.[0];
    industry = 'Manufacturing & Heavy Industry';
  } else if (/\boutdoor\b/i.test(text)) {
    application = 'Outdoor';
    application_source = text.match(/\boutdoor\b/i)?.[0];
    industry = 'Lighting & Infrastructure';
  }

  // 3. Technical Parameters
  const technical_parameters: TechnicalParameterItem[] = [];

  // Power (W, kW, HP)
  const powerMatch = text.match(/(\d+(?:\.\d+)?)\s*(W|kW|MW|Watts?|hp)\b/i);
  if (powerMatch) {
    technical_parameters.push({
      parameter: 'Power',
      value: powerMatch[0].trim(),
      unit: powerMatch[2].toUpperCase(),
      confidence: 'high',
      source_text: powerMatch[0],
    });
  }

  // Voltage (V, kV)
  const voltageMatch = text.match(/(\d+(?:\.\d+)?)\s*(V|kV|Volts?)\b/i);
  if (voltageMatch) {
    technical_parameters.push({
      parameter: 'Operating Voltage',
      value: voltageMatch[0].trim(),
      unit: voltageMatch[2],
      confidence: 'high',
      source_text: voltageMatch[0],
    });
  }

  // Enclosure / IP Rating
  const ipMatch = text.match(/\b(IP\s*\d{2})\b/i);
  if (ipMatch) {
    technical_parameters.push({
      parameter: 'Ingress Protection',
      value: ipMatch[1].replace(/\s+/, '').toUpperCase(),
      unit: 'Rating',
      confidence: 'high',
      source_text: ipMatch[0],
    });
  }

  // Luminous Efficacy
  const efficacyMatch = text.match(/(\d+(?:\.\d+)?)\s*(lm\/W|lumens?\s+per\s+watt)/i);
  if (efficacyMatch) {
    technical_parameters.push({
      parameter: 'Luminous Efficacy',
      value: efficacyMatch[0].trim(),
      unit: 'lm/W',
      confidence: 'high',
      source_text: efficacyMatch[0],
    });
  }

  // Surge Protection
  const surgeMatch = text.match(/surge\s+protection\s*[:\-]?\s*(\d+(?:\.\d+)?\s*(?:kV|V))/i);
  if (surgeMatch) {
    technical_parameters.push({
      parameter: 'Surge Protection',
      value: surgeMatch[1].trim(),
      unit: 'kV',
      confidence: 'high',
      source_text: surgeMatch[0],
    });
  }

  // Capacity / Volume
  const capMatch = text.match(/(\d+(?:\.\d+)?)\s*(liters?|litres?|L|kL|gallons?)\b/i);
  if (capMatch) {
    technical_parameters.push({
      parameter: 'Capacity',
      value: capMatch[0].trim(),
      unit: capMatch[2],
      confidence: 'high',
      source_text: capMatch[0],
    });
  }

  // 4. Materials
  const materials: TaggedRequirementItem[] = [];
  const materialKeywords = [
    { name: 'Stainless steel', pattern: /stainless\s+steel(?:\s*(?:grade\s*)?(?:304|316))?/i },
    { name: 'Die-cast aluminum', pattern: /(?:die-?cast\s+)?aluminum|aluminium/i },
    { name: 'Copper', pattern: /\bcopper\b/i },
    { name: 'PVC / Polymer', pattern: /\b(?:pvc|xlpe|polyethylene|polymer)\b/i },
  ];

  for (const m of materialKeywords) {
    const match = text.match(m.pattern);
    if (match) {
      materials.push({
        name: m.name,
        confidence: 'high',
        source_text: match[0],
      });
    }
  }

  // 5. Environment
  const environment: TaggedRequirementItem[] = [];

  const outdoorMatch = text.match(/\b(?:outdoor\s+installation|outdoor\s+use|external\s+use|exterior\s+use|outdoor)\b/i);
  if (outdoorMatch) {
    environment.push({
      name: 'Outdoor',
      confidence: 'high',
      source_text: outdoorMatch[0],
    });
  }

  const weatherMatch = text.match(/\b(?:weather\s+resistant|weather-?proof)\b/i);
  if (weatherMatch) {
    environment.push({
      name: 'Weather resistant',
      confidence: 'high',
      source_text: weatherMatch[0],
    });
  }

  const tempMatch = text.match(/\b(?:high\s+temperature|heat\s+resistant)\b/i);
  if (tempMatch) {
    environment.push({
      name: 'High temperature',
      confidence: 'high',
      source_text: tempMatch[0],
    });
  }

  const corrosiveMatch = text.match(/\b(?:corrosive|saline|marine)\b/i);
  if (corrosiveMatch) {
    environment.push({
      name: 'Corrosive / Marine',
      confidence: 'medium',
      source_text: corrosiveMatch[0],
    });
  }

  // 6. Installation
  const installation_requirements: TaggedRequirementItem[] = [];
  if (/pole\s+mounted/i.test(text)) {
    installation_requirements.push({ name: 'Pole mounted', confidence: 'high', source_text: 'pole mounted' });
  }
  if (/wall\s+mounted/i.test(text)) {
    installation_requirements.push({ name: 'Wall mounted', confidence: 'high', source_text: 'wall mounted' });
  }
  if (/underground/i.test(text)) {
    installation_requirements.push({ name: 'Underground / Trenching', confidence: 'medium', source_text: 'underground' });
  }

  // 7. Quantity
  let quantity: string | null = null;
  let quantity_source: string | undefined = undefined;
  const qtyMatch = text.match(/(?:procure|supply|quantity|qty|order)?\s*(\d+)\s*(?:units?|nos?|pieces?|pcs?|sets?|tanks?|meters?|cables?)?\b/i);
  if (qtyMatch && parseInt(qtyMatch[1], 10) > 1 && !powerMatch?.[0].includes(qtyMatch[1])) {
    quantity = qtyMatch[1];
    quantity_source = qtyMatch[0].trim();
  }

  // 8. Safety & Certifications
  const safety_requirements: TaggedRequirementItem[] = [];
  const certification_mentions: TaggedRequirementItem[] = [];

  if (/surge\s+protect/i.test(text)) {
    safety_requirements.push({ name: 'Surge protection', confidence: 'high', source_text: text.match(/surge\s+protect\w*/i)?.[0] });
  }
  if (/fire\s+retardant/i.test(text)) {
    safety_requirements.push({ name: 'Fire retardant insulation', confidence: 'high', source_text: text.match(/fire\s+retardant/i)?.[0] });
  }
  if (/bis|isi|crs/i.test(text)) {
    certification_mentions.push({ name: 'BIS / CRS certification', confidence: 'high', source_text: text.match(/bis|isi|crs/i)?.[0] });
  }

  // 9. Genuinely Useful Missing Information Detection (Not random!)
  const missing_information: string[] = [];
  const isLighting = /led|light|luminaire/i.test(text);

  if (isLighting) {
    if (voltageMatch === null) {
      missing_information.push('Voltage rating (e.g., 230V AC)');
    }
    if (efficacyMatch === null) {
      missing_information.push('Illumination requirement / Luminous efficacy (e.g., 120 lm/W)');
    }
    if (ipMatch === null && !/weather\s+resistant/i.test(text)) {
      missing_information.push('Ingress protection (e.g., IP65)');
    }
  } else if (/tank/i.test(text)) {
    if (capMatch === null) {
      missing_information.push('Storage capacity / Volume (e.g., 5000 Liters)');
    }
    if (!/grade\s*(?:304|316)/i.test(text)) {
      missing_information.push('Material grade (e.g., SS304 or SS316)');
    }
  } else if (/cable/i.test(text)) {
    if (voltageMatch === null) {
      missing_information.push('Voltage grade (e.g., 1.1kV)');
    }
    if (!/core/i.test(text)) {
      missing_information.push('Conductor core count & cross-sectional area (e.g., 4 Core x 25 sq.mm)');
    }
  }

  // 10. Clarification Questions for vague inputs
  const clarification_questions: ClarificationQuestion[] = [];
  if (lower === 'need led street lights.' || lower === 'need led street lights' || (lower.includes('led') && text.length < 35)) {
    clarification_questions.push({
      id: 'q-power',
      field: 'Power rating',
      question: 'What is the required power rating?',
      options: ['30W - 60W (Sub-arterial)', '90W - 120W (Main road)', '150W - 250W (Highways)'],
      suggestedAnswer: '100W',
    });
    clarification_questions.push({
      id: 'q-app',
      field: 'Intended application',
      question: 'What is the intended application?',
      options: ['Highway', 'Street', 'Industrial area', 'Residential'],
      suggestedAnswer: 'Street',
    });
  }

  // Overall Confidence
  const overall_confidence: ConfidenceLevel =
    technical_parameters.length >= 1 && productName !== 'Unspecified Equipment'
      ? 'high'
      : 'needs_review';

  return {
    product: {
      name: productName,
      category,
      confidence: productSource ? 'high' : 'medium',
      source_text: productSource,
    },
    application,
    application_source,
    industry,
    technical_parameters,
    materials,
    environment,
    safety_requirements,
    performance_requirements: [],
    testing_requirements: [],
    installation_requirements,
    certification_mentions,
    quantity,
    quantity_source,
    additional_requirements: [],
    missing_information,
    clarification_questions,
    overall_confidence,
    ready_for_matching: true,
  };
}
