// ============================================================
// ISutra — Offline / Fallback NLP Requirement Extractor
// High-precision pattern-based extraction engine
// ============================================================

import type { StructuredRequirements, TechnicalParameterItem, TaggedRequirementItem, ClarificationQuestion, ConfidenceLevel } from './types';
import { detectInputLanguage, translateIndicProcurementConcepts, LanguageMetadata } from './multilingualService';

export function extractWithPatternMatching(
  inputText: string,
  inputType: string,
  languageMeta?: LanguageMetadata
): StructuredRequirements {
  const text = inputText.trim();
  const lower = text.toLowerCase();

  // If language metadata is not supplied, run script heuristic detection
  const lang = languageMeta || detectInputLanguage(text);

  // If unsupported script is detected, safely return without hallucination
  if (lang && !lang.is_supported) {
    const errorMsg =
      lang.details ||
      'Language script not supported in current prototype. Supported input languages are English, Hindi, and Telugu.';
    return {
      product: {
        name: 'Unspecified Product (Unsupported Script)',
        category: 'General Procurement',
        confidence: 'needs_review',
        source_text: text.slice(0, 100),
      },
      application: null,
      application_source: undefined,
      industry: null,
      technical_parameters: [],
      materials: [],
      environment: [],
      safety_requirements: [],
      performance_requirements: [],
      testing_requirements: [],
      installation_requirements: [],
      certification_mentions: [],
      quantity: null,
      quantity_source: undefined,
      additional_requirements: [],
      missing_information: [errorMsg],
      blocking_missing_information: [errorMsg],
      clarification_questions: [
        {
          id: 'q-lang-support',
          field: 'Input Language',
          question:
            'The submitted specification uses an unsupported language script. Please provide procurement requirements in English, Hindi, or Telugu.',
          options: [
            'Provide specification in English',
            'Provide specification in Hindi',
            'Provide specification in Telugu',
          ],
          suggestedAnswer: 'Provide specification in English',
        },
      ],
      overall_confidence: 'needs_review',
      ready_for_matching: false,
    };
  }

  // Pre-translate any Indic procurement concepts (Hindi, Telugu, or Mixed)
  const indic = translateIndicProcurementConcepts(text);

  // 1. Identify Product & Category
  let productName = indic.productName || 'Unspecified Equipment';
  let category = indic.category || 'General Procurement';
  let productSource: string | undefined = indic.productSource;

  // Specific domain product patterns (only if product not already identified)
  if (productName === 'Unspecified Equipment') {
  if (/emergency\s+(?:lighting\s+)?(?:luminaires?|fittings?|systems?|lights?)|self-contained\s+emergency/i.test(text)) {
    productName = 'Emergency lighting luminaires';
    category = 'Lighting & Luminaires';
    productSource = text.match(/emergency\s+(?:lighting\s+)?(?:luminaires?|fittings?|systems?|lights?)|self-contained\s+emergency/i)?.[0];
  } else if (/floodlights?|flood\s+lighting/i.test(text)) {
    productName = 'Floodlight luminaires';
    category = 'Lighting & Luminaires';
    productSource = text.match(/floodlights?|flood\s+lighting/i)?.[0];
  } else if (/self-?ballasted\s+(?:led\s+)?lamps?|led\s+bulbs?/i.test(text)) {
    productName = 'Self-ballasted LED lamps';
    category = 'Lighting & Luminaires';
    productSource = text.match(/self-?ballasted\s+(?:led\s+)?lamps?|led\s+bulbs?/i)?.[0];
  } else if (/led\s+modules?/i.test(text)) {
    productName = 'LED modules';
    category = 'Lighting & Luminaires';
    productSource = text.match(/led\s+modules?/i)?.[0];
  } else if (/handlamps?|portable\s+handlamps?/i.test(text)) {
    productName = 'Portable handlamps';
    category = 'Lighting & Luminaires';
    productSource = text.match(/handlamps?|portable\s+handlamps?/i)?.[0];
  } else if (/fixed\s+(?:general\s+purpose\s+)?(?:indoor\s+)?luminaires?|general\s+purpose\s+indoor\s+luminaires?/i.test(text)) {
    productName = 'Fixed general purpose luminaires';
    category = 'Lighting & Luminaires';
    productSource = text.match(/fixed\s+(?:general\s+purpose\s+)?(?:indoor\s+)?luminaires?|general\s+purpose\s+indoor\s+luminaires?/i)?.[0];
  } else if (/led\s+street\s+lighting\s+system/i.test(text)) {
    productName = 'LED street lighting system';
    category = 'Lighting & Luminaires';
    productSource = text.match(/led\s+street\s+lighting\s+system/i)?.[0];
  } else if (/led\s+street\s+lighting\s+luminaires?|street\s+lighting\s+luminaires?/i.test(text)) {
    productName = 'LED street lighting luminaire';
    category = 'Lighting & Luminaires';
    productSource = text.match(/led\s+street\s+lighting\s+luminaires?|street\s+lighting\s+luminaires?/i)?.[0];
  } else if (/led\s+street\s+lights?\b|street\s+lights?\b/i.test(text)) {
    productName = 'LED street lighting luminaire';
    category = 'Lighting & Luminaires';
    productSource = text.match(/led\s+street\s+lights?\b|street\s+lights?\b/i)?.[0];
  } else if (/aerial\s+bunched\s+cables?|abc\s+cables?/i.test(text)) {
    productName = 'Aerial bunched cables';
    category = 'Cables & Conductors';
    productSource = text.match(/aerial\s+bunched\s+cables?|abc\s+cables?/i)?.[0];
  } else if (/xlpe(?:\s+[\w\-]+){0,4}\s+cables?/i.test(text)) {
    productName = 'XLPE insulated power cables';
    category = 'Cables & Conductors';
    productSource = text.match(/xlpe(?:\s+[\w\-]+){0,4}\s+cables?/i)?.[0];
  } else if (/hffr\s+cables?|halogen\s+free\s+flame\s+retardant\s+cables?/i.test(text)) {
    productName = 'Halogen free flame retardant cables';
    category = 'Cables & Conductors';
    productSource = text.match(/hffr\s+cables?|halogen\s+free\s+flame\s+retardant\s+cables?/i)?.[0];
  } else if (/elastomer\s+(?:insulated\s+)?cables?/i.test(text)) {
    productName = 'Elastomer insulated cables';
    category = 'Cables & Conductors';
    productSource = text.match(/elastomer\s+(?:insulated\s+)?cables?/i)?.[0];
  } else if (/flexible\s+cords?|unsheathed\s+and\s+sheathed\s+cables?/i.test(text)) {
    productName = 'PVC insulated flexible cords';
    category = 'Cables & Conductors';
    productSource = text.match(/flexible\s+cords?|unsheathed\s+and\s+sheathed\s+cables?/i)?.[0];
  } else if (/(?:pvc\s+insulated\s+)?heavy\s+duty\s+electric\s+cables?|pvc\s+cables?/i.test(text)) {
    productName = 'PVC insulated electric cables';
    category = 'Cables & Conductors';
    productSource = text.match(/(?:pvc\s+insulated\s+)?heavy\s+duty\s+electric\s+cables?|pvc\s+cables?/i)?.[0];
  } else if (/electrical\s+cables?/i.test(text)) {
    productName = 'Industrial electrical cables';
    category = 'Cables & Conductors';
    productSource = text.match(/industrial\s+electrical\s+cables?|electrical\s+cables?/i)?.[0];
  } else if (/water\s+(?:retaining\s+)?(?:storage\s+)?tanks?|liquid\s+retaining\s+structures?/i.test(text)) {
    productName = 'Liquid retaining concrete structures';
    category = 'Storage Tanks & Vessels';
    productSource = text.match(/water\s+(?:retaining\s+)?(?:storage\s+)?tanks?|liquid\s+retaining\s+structures?/i)?.[0];
  } else if (/concrete\s+mix\s+proportioning|mix\s+design/i.test(text)) {
    productName = 'Concrete mix proportioning';
    category = 'Construction Materials';
    productSource = text.match(/concrete\s+mix\s+proportioning|mix\s+design/i)?.[0];
  } else if (/(?:precast\s+)?(?:reinforced\s+)?concrete\s+pipes?|precast\s+pipes?/i.test(text)) {
    productName = 'Precast concrete pipes';
    category = 'Pipes & Drainage';
    productSource = text.match(/(?:precast\s+)?(?:reinforced\s+)?concrete\s+pipes?|precast\s+pipes?/i)?.[0];
  } else if (/masonry\s+blocks?|concrete\s+blocks?/i.test(text)) {
    productName = 'Concrete masonry blocks';
    category = 'Masonry & Bricks';
    productSource = text.match(/masonry\s+blocks?|concrete\s+blocks?/i)?.[0];
  } else if (/clay\s+(?:building\s+)?bricks?|burnt\s+clay\s+bricks?/i.test(text)) {
    productName = 'Burnt clay building bricks';
    category = 'Masonry & Bricks';
    productSource = text.match(/clay\s+(?:building\s+)?bricks?|burnt\s+clay\s+bricks?/i)?.[0];
  } else if (/structural\s+steel(?:\s+plates|\s+sections)?/i.test(text)) {
    productName = 'Structural steel sections';
    category = 'Structural Steel';
    productSource = text.match(/structural\s+steel(?:\s+plates|\s+sections)?/i)?.[0];
  } else if (/(?:coarse\s+and\s+fine\s+)?aggregates?/i.test(text)) {
    productName = 'Coarse and fine aggregates';
    category = 'Construction Materials';
    productSource = text.match(/(?:coarse\s+and\s+fine\s+)?aggregates?/i)?.[0];
  } else if (/tmt\s+(?:steel\s+)?bars?|deformed\s+(?:steel\s+)?bars?|steel\s+reinforcement/i.test(text)) {
    productName = 'High strength deformed steel bars';
    category = 'Reinforcement Steel';
    productSource = text.match(/tmt\s+(?:steel\s+)?bars?|deformed\s+(?:steel\s+)?bars?|steel\s+reinforcement/i)?.[0];
  } else if (/plain\s+and\s+reinforced\s+concrete|reinforced\s+concrete|structural\s+concrete/i.test(text)) {
    productName = 'Plain and reinforced concrete';
    category = 'Civil & Concrete';
    productSource = text.match(/plain\s+and\s+reinforced\s+concrete|reinforced\s+concrete|structural\s+concrete/i)?.[0];
  } else if (/safety\s+footwear|safety\s+shoes?/i.test(text)) {
    productName = 'Safety footwear';
    category = 'Personal Protective Equipment';
    productSource = text.match(/safety\s+footwear|safety\s+shoes?/i)?.[0];
  } else if (/protective\s+gloves/i.test(text)) {
    productName = 'Mechanical protective gloves';
    category = 'Personal Protective Equipment';
    productSource = text.match(/protective\s+gloves/i)?.[0];
  } else if (/firefighter\s+(?:protective\s+)?clothing/i.test(text)) {
    productName = 'Firefighter protective clothing';
    category = 'Firefighter Equipment';
    productSource = text.match(/firefighter\s+(?:protective\s+)?clothing/i)?.[0];
  } else if (/heat\s+and\s+(?:thermal\s+)?flame|protective\s+clothing\s+against\s+heat/i.test(text)) {
    productName = 'Heat and flame protective clothing';
    category = 'Protective Clothing';
    productSource = text.match(/heat\s+and\s+(?:thermal\s+)?flame|protective\s+clothing\s+against\s+heat/i)?.[0];
  } else if (/respiratory\s+protective|powered\s+filtering/i.test(text)) {
    productName = 'Powered filtering respiratory devices';
    category = 'Respiratory Protection';
    productSource = text.match(/respiratory\s+protective|powered\s+filtering/i)?.[0];
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
    if (firstClause.length > 2) {
      productName = firstClause.replace(/^(procure|supply|need|purchase|requirement for)\s+/i, '');
      category = 'General Procurement';
      productSource = firstClause;
    }
  }
  }

  // 2. Application & Industry
  let application: string | null = indic.application || null;
  let application_source: string | undefined = indic.applicationSource;
  let industry: string | null = indic.industry || null;

  if (!application) {
    if (/government\s+facility/i.test(text)) {
      application = 'Government facility';
      application_source = text.match(/government\s+facility/i)?.[0];
      industry = 'Public Sector / Government';
    } else if (/municipal\s+(?:road|street|expressway)s?|highway|expressways?|street\s+lighting/i.test(text)) {
      if (/light|luminaire|lamp|illumination/i.test(text)) {
        application = 'Highway & Municipal road lighting';
        application_source = text.match(/municipal\s+(?:road|street|expressway)s?(?:\s+lighting)?|highway|road\s+lighting|street\s+lighting(?:\s+illumination)?/i)?.[0];
        industry = 'Urban Infrastructure / Municipal';
      } else {
        application = 'Highway & Municipal infrastructure';
        application_source = text.match(/municipal\s+(?:road|street|expressway)s?|highway|expressways?/i)?.[0];
        industry = 'Urban Infrastructure / Transportation';
      }
    } else if (/industrial/i.test(text)) {
      application = 'Industrial installation';
      application_source = text.match(/industrial/i)?.[0];
      industry = 'Manufacturing & Heavy Industry';
    } else if (/\boutdoor\b/i.test(text)) {
      application = 'Outdoor';
      application_source = text.match(/\boutdoor\b/i)?.[0];
      industry = 'Lighting & Infrastructure';
    }
  }

  // 3. Technical Parameters
  const technical_parameters: TechnicalParameterItem[] = [];

  // Seed with Indic extracted parameters if present
  for (const p of indic.parameters) {
    technical_parameters.push({
      parameter: p.parameter,
      value: p.value,
      unit: p.unit,
      confidence: 'high',
      source_text: p.source_text,
    });
  }

  const hasParam = (name: string) =>
    technical_parameters.some((p) => p.parameter.toLowerCase() === name.toLowerCase());

  // Power (W, kW, HP)
  const powerMatch = text.match(/(\d+(?:\.\d+)?)\s*(W|kW|MW|Watts?|hp)\b/i);
  if (powerMatch && !hasParam('Power')) {
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
  if (voltageMatch && !hasParam('Operating Voltage') && !hasParam('Voltage Rating')) {
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
  if (ipMatch && !hasParam('Ingress Protection')) {
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
  if (efficacyMatch && !hasParam('Luminous Efficacy')) {
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
  if (surgeMatch && !hasParam('Surge Protection')) {
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
  if (capMatch && !hasParam('Capacity')) {
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
  const matDefList = [
    {
      name: 'Die-cast aluminium',
      pattern: /\b(?:(?:weather[\s-]+resistant|robust|durable|heavy[\s-]+duty)\s+)?(?:die-?cast\s+)alumin(?:i)?um(?:\s+(?:housing|body|casing|enclosure))?\b/i,
      test: /die-?cast\s+alumin(?:i)?um/i,
    },
    {
      name: 'Aluminium',
      pattern: /\b(?:made\s+of\s+)?alumin(?:i)?um(?:\s+(?:housing|body|casing|enclosure))?\b/i,
      test: /alumin(?:i)?um/i,
    },
    {
      name: 'Stainless steel',
      pattern: /\b(?:(?:grade\s*)?(?:304|316)\s+)?stainless\s+steel(?:\s*(?:grade\s*)?(?:304|316))?(?:\s+(?:body|housing|enclosure|tank))?\b/i,
      test: /stainless\s+steel/i,
    },
    {
      name: 'Galvanized steel',
      pattern: /\b(?:hot[\s-]+dip\s+)?(?:galvanized|galvanised|gi)\s+steel(?:\s+(?:sheet|structure|pole|body))?\b/i,
      test: /(?:galvanized|galvanised|gi)\s+steel/i,
    },
    {
      name: 'Reinforced concrete',
      pattern: /\b(?:reinforced|plain\s+and\s+reinforced)\s+concrete|rcc\b/i,
      test: /reinforced\s+concrete|rcc/i,
    },
    {
      name: 'Copper',
      pattern: /\b(?:annealed\s+)?copper(?:\s+conductors?)?\b/i,
      test: /\bcopper\b/i,
    },
    {
      name: 'PVC / Polymer',
      pattern: /\b(?:pvc|xlpe|polyethylene|polymer)\b/i,
      test: /\b(?:pvc|xlpe|polyethylene|polymer)\b/i,
    },
  ];

  let hasDieCastAlum = false;
  for (const m of matDefList) {
    if (m.name === 'Aluminium' && hasDieCastAlum) continue;
    const match = text.match(m.pattern);
    if (match && m.test.test(match[0])) {
      if (m.name === 'Die-cast aluminium') hasDieCastAlum = true;
      materials.push({
        name: m.name,
        confidence: 'high',
        source_text: match[0].trim(),
      });
    }
  }

  // 5. Environment
  const environment: TaggedRequirementItem[] = [];

  // Seed with Indic extracted environment items
  for (const env of indic.environment) {
    environment.push({
      name: env.name,
      confidence: 'high',
      source_text: env.source_text,
    });
  }

  const hasEnv = (name: string) =>
    environment.some((e) => e.name.toLowerCase().includes(name.toLowerCase()));

  const outdoorMatch = text.match(/\b(?:outdoor\s+installation|outdoor\s+use|external\s+use|exterior\s+use|continuous\s+outdoor\s+operation|outdoor)\b/i);
  if (outdoorMatch && !hasEnv('outdoor')) {
    environment.push({
      name: 'Outdoor',
      confidence: 'high',
      source_text: outdoorMatch[0],
    });
  }

  const weatherMatch = text.match(/\b(?:weather[\s-]+resistant|weather[\s-]*proof)\b/i);
  if (weatherMatch && !hasEnv('weather')) {
    environment.push({
      name: 'Weather resistant',
      confidence: 'high',
      source_text: weatherMatch[0],
    });
  }

  const dustMatch = text.match(/\b(?:dust[\s-]+resistant|dust[\s-]*proof)\b/i);
  if (dustMatch && !hasEnv('dust')) {
    environment.push({
      name: 'Dust resistant',
      confidence: 'high',
      source_text: dustMatch[0],
    });
  }

  const moistureMatch = text.match(/\b(?:moisture[\s-]+resistant|moisture[\s-]*proof)\b/i);
  if (moistureMatch && !hasEnv('moisture')) {
    environment.push({
      name: 'Moisture resistant',
      confidence: 'high',
      source_text: moistureMatch[0],
    });
  }

  const corrosiveMatch = text.match(/\b(?:corrosion[\s-]+resistant|corrosive|saline|marine)\b/i);
  if (corrosiveMatch && !hasEnv('corros')) {
    environment.push({
      name: 'Corrosive / Marine',
      confidence: 'medium',
      source_text: corrosiveMatch[0],
    });
  }

  const tempMatch = text.match(/\b(?:high\s+temperature|heat\s+resistant)\b/i);
  if (tempMatch && !hasEnv('temperature') && !hasEnv('heat')) {
    environment.push({
      name: 'High temperature',
      confidence: 'high',
      source_text: tempMatch[0],
    });
  }

  // 6. Installation
  const installation_requirements: TaggedRequirementItem[] = [];

  // Seed with Indic extracted installation items
  for (const inst of indic.installation) {
    installation_requirements.push({
      name: inst.name,
      confidence: 'high',
      source_text: inst.source_text,
    });
  }

  const hasInst = (name: string) =>
    installation_requirements.some((i) => i.name.toLowerCase().includes(name.toLowerCase()));

  const instDefList = [
    {
      name: 'Pole mounted',
      pattern: /\b(?:suitable\s+for\s+)?(pole[\s-]+mounted(?:\s+(?:outdoor\s+applications?|outdoor|applications?|fittings?|use))?|pole\s+mounting|installed\s+on\s+poles?)\b/i,
    },
    {
      name: 'Wall mounted',
      pattern: /\b(?:suitable\s+for\s+)?(wall[\s-]+mounted(?:\s+(?:outdoor\s+applications?|outdoor|applications?|fittings?|use))?|wall\s+mounting|installed\s+on\s+walls?)\b/i,
    },
    {
      name: 'Ceiling mounted',
      pattern: /\b(?:suitable\s+for\s+)?(ceiling[\s-]+mounted(?:\s+(?:applications?|fittings?|use))?|ceiling\s+mounting|installed\s+on\s+ceilings?)\b/i,
    },
    {
      name: 'Surface mounted',
      pattern: /\b(?:suitable\s+for\s+)?(surface[\s-]+mounted(?:\s+(?:applications?|fittings?|use))?|surface\s+mounting)\b/i,
    },
    {
      name: 'Panel mounted',
      pattern: /\b(?:suitable\s+for\s+)?(panel[\s-]+mounted(?:\s+(?:applications?|fittings?|use))?|panel\s+mounting)\b/i,
    },
    {
      name: 'Pedestal mounted',
      pattern: /\b(?:suitable\s+for\s+)?(pedestal[\s-]+mounted(?:\s+(?:applications?|fittings?|use))?|pedestal\s+mounting)\b/i,
    },
    {
      name: 'Underground / Trenching',
      pattern: /\b(underground(?:\s+cabling|\s+installation|\s+trenching)?|trenching|buried(?:\s+directly)?)\b/i,
    },
  ];

  for (const item of instDefList) {
    const match = text.match(item.pattern);
    if (match && !hasInst(item.name)) {
      installation_requirements.push({
        name: item.name,
        confidence: 'high',
        source_text: match[1] || match[0],
      });
    }
  }

  // 7. Quantity
  let quantity: string | null = null;
  let quantity_source: string | undefined = undefined;
  let quantity_unit: string | undefined = undefined;

  const qtyPrefixMatch = text.match(/\b(?:quantity|qty)\s*[:\-]?\s*(\d+)\s*(units?|luminaires?|lamps?|nos?|numbers?|pieces?|pcs?|sets?|tanks?|meters?|cables?)?\b/i);
  if (qtyPrefixMatch && parseInt(qtyPrefixMatch[1], 10) > 0) {
    quantity = qtyPrefixMatch[1];
    quantity_unit = qtyPrefixMatch[2]?.toLowerCase() || 'units';
    quantity_source = qtyPrefixMatch[0].trim();
  }

  if (!quantity) {
    const qtyPhraseMatch = text.match(
      /\b(?:(?:supply\s+(?:and\s+installation\s+)?of|procure(?:ment\s+of)?|order\s+of)\s+)?(\d+)\s+(units?|luminaires?|lamps?|nos?|numbers?|pieces?|pcs?|sets?|tanks?|meters?|cables?)\b/i
    );
    if (qtyPhraseMatch && parseInt(qtyPhraseMatch[1], 10) > 0 && !powerMatch?.[0].includes(qtyPhraseMatch[1])) {
      quantity = qtyPhraseMatch[1];
      quantity_unit = qtyPhraseMatch[2].toLowerCase();
      quantity_source = `${qtyPhraseMatch[1]} ${qtyPhraseMatch[2]}`;
    }
  }

  if (!quantity) {
    const genericQtyMatch = text.match(/(?:procure|supply|order)?\s*(\d+)\s*(?:units?|nos?|pieces?|pcs?|sets?|tanks?|meters?|cables?)?\b/i);
    if (genericQtyMatch && parseInt(genericQtyMatch[1], 10) > 1 && !powerMatch?.[0].includes(genericQtyMatch[1])) {
      quantity = genericQtyMatch[1];
      quantity_source = genericQtyMatch[0].trim();
    }
  }

  // 8. Safety & Certifications
  const safety_requirements: TaggedRequirementItem[] = [];
  const certification_mentions: TaggedRequirementItem[] = [];

  const safetyDefList = [
    {
      name: 'Surge protection',
      pattern: /\b(?:include\s+appropriate\s+|with\s+)?(surge\s+protect(?:ion|or)?(?:\s*[:\-]?\s*\d+(?:\.\d+)?\s*(?:kV|V))?)\b/i,
      test: /surge\s+protect/i,
    },
    {
      name: 'Overload protection',
      pattern: /\b(?:with\s+)?(overload\s+protection)\b/i,
      test: /overload\s+protection/i,
    },
    {
      name: 'Short-circuit protection',
      pattern: /\b(?:with\s+)?(short[\s-]+circuit\s+protection)\b/i,
      test: /short[\s-]+circuit\s+protection/i,
    },
    {
      name: 'Earth protection',
      pattern: /\b(?:with\s+)?((?:earth(?:ing)?|ground(?:ing)?)\s+protection)\b/i,
      test: /(?:earth|ground)(?:ing)?\s+protection/i,
    },
    {
      name: 'Safety requirements',
      pattern: /\b((?:relevant\s+|general\s+|applicable\s+)?safety\s+requirements)\b/i,
      test: /safety\s+requirements/i,
    },
    {
      name: 'Fire retardant insulation',
      pattern: /\b(?:with\s+)?(fire\s+retardant(?:\s+insulation)?)\b/i,
      test: /fire\s+retardant/i,
    },
  ];

  for (const s of safetyDefList) {
    const match = text.match(s.pattern);
    if (match && s.test.test(match[0])) {
      safety_requirements.push({
        name: s.name,
        confidence: 'high',
        source_text: match[0].trim(),
      });
    }
  }

  if (/bis|isi|crs/i.test(text)) {
    certification_mentions.push({
      name: 'BIS / CRS certification',
      confidence: 'high',
      source_text: text.match(/bis|isi|crs/i)?.[0],
    });
  } else if (/indian\s+standards?/i.test(text)) {
    certification_mentions.push({
      name: 'Indian Standards (BIS)',
      confidence: 'high',
      source_text: text.match(/applicable\s+Indian\s+Standards?|Indian\s+Standards?/i)?.[0] || 'Indian Standards',
    });
  }

  // --- Append Material, Installation, Safety, Quantity to technical_parameters ---
  for (const m of materials) {
    technical_parameters.push({
      parameter: 'Material',
      value: m.name,
      confidence: m.confidence,
      source_text: m.source_text,
    });
  }

  for (const inst of installation_requirements) {
    if (
      !technical_parameters.some(
        (tp) =>
          tp.parameter.toLowerCase().includes('installation') ||
          tp.parameter.toLowerCase().includes('mounting')
      )
    ) {
      technical_parameters.push({
        parameter: 'Installation / Mounting',
        value: inst.name,
        confidence: inst.confidence,
        source_text: inst.source_text,
      });
    }
  }

  for (const safe of safety_requirements) {
    if (safe.name === 'Surge protection' && surgeMatch) continue;
    technical_parameters.push({
      parameter: 'Safety',
      value: safe.name,
      confidence: safe.confidence,
      source_text: safe.source_text,
    });
  }

  if (quantity) {
    const displayQty = quantity_unit ? `${quantity} ${quantity_unit}` : `${quantity} units`;
    technical_parameters.push({
      parameter: 'Quantity',
      value: displayQty,
      unit: quantity_unit || 'units',
      confidence: 'high',
      source_text: quantity_source || displayQty,
    });
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
