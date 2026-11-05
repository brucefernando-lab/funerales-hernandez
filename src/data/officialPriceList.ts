export type ChapelLocation = 'constitucion' | 'dr_mier' | 'bienestar';

export interface PaymentTerms {
  termMonths: 12 | 24 | 36 | 48 | 90;
  total: number;
  monthly: number;
  biweekly: number;
  weekly: number;
  isPromo?: boolean;
}

export interface OfficialPlan {
  id: string;
  name: string;
  subtitle: string;
  category: 'metalico' | 'cremacion' | 'madera';
  isAnchor?: boolean;
  contado: number;
  terms: PaymentTerms[];
  features: string[];
}

export interface ChapelCatalog {
  id: ChapelLocation;
  name: string;
  shortName: string;
  address: string;
  badge: string;
  description: string;
  plans: OfficialPlan[];
}

export const OFFICIAL_PRICE_CATALOG: ChapelCatalog[] = [
  // 1. CAPILLAS CONSTITUCIÓN NUEVA MATRIZ
  {
    id: 'constitucion',
    name: 'Capillas Constitución (Nueva Matriz)',
    shortName: 'Capillas Constitución',
    address: 'Constitución #1200, Matriz',
    badge: 'Matriz Premier',
    description: 'Instalaciones premier de alta gama, salas privadas con cafetería ejecutiva 24h.',
    plans: [
      {
        id: 'const_metalico_gris',
        name: 'Metálico Básico Gris',
        subtitle: 'Ataúd metálico acabado gris con servicio de capilla premier',
        category: 'metalico',
        contado: 38500,
        features: [
          'Ataúd metálico color gris estándar',
          'Capilla de velación premier climatizada 24 hrs',
          'Arreglo estético y embalsamamiento certificado',
          'Carroza para traslados locales y cortejo',
          'Servicio de cafetería y asesoría jurídica completa',
          'Plan 100% transferible sin caducidad'
        ],
        terms: [
          { termMonths: 12, total: 40921.00, monthly: 3410.08, biweekly: 1705.04, weekly: 852.52 },
          { termMonths: 24, total: 43238.00, monthly: 1801.58, biweekly: 900.79, weekly: 450.40 },
          { termMonths: 36, total: 46800.00, monthly: 1300.00, biweekly: 650.00, weekly: 325.00 },
          { termMonths: 48, total: 48125.00, monthly: 1002.60, biweekly: 501.30, weekly: 250.65 }
        ]
      },
      {
        id: 'const_metalico_presidente',
        name: 'Metálico Básico Presidente',
        subtitle: 'Ataúd señorial acabado especial y capilla premier ejecutiva',
        category: 'metalico',
        isAnchor: true,
        contado: 55000,
        features: [
          'Ataúd metálico modelo Presidente de acabado refinado',
          'Sala de velación presidencial con sala de descanso',
          'Embalsamamiento de alta estética y tanatopraxia',
          'Cortejo de gala en carroza presidencial',
          'Arreglo floral presidencial y libro de firmas',
          'Atención tanatológica familiar integral',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 58458.00, monthly: 4871.50, biweekly: 2435.75, weekly: 1217.88 },
          { termMonths: 24, total: 51768.00, monthly: 2157.00, biweekly: 1078.50, weekly: 539.25 },
          { termMonths: 36, total: 65195.00, monthly: 1810.97, biweekly: 905.49, weekly: 452.74 },
          { termMonths: 48, total: 68750.00, monthly: 1432.29, biweekly: 716.15, weekly: 358.07 }
        ]
      },
      {
        id: 'const_metalico_plus',
        name: 'Metálico Plus (Tamaño XL hasta 130 Kilos)',
        subtitle: 'Especial para dimensiones amplias y peso especial',
        category: 'metalico',
        contado: 69500,
        features: [
          'Ataúd metálico reforzado tamaño XL (hasta 130 kg)',
          'Capilla de velación premier amplia',
          'Equipo y maniobras de traslado especializadas',
          'Carroza adaptada de gran capacidad',
          'Gestoría de trámites y certificado médico',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 73270.00, monthly: 6105.83, biweekly: 3052.92, weekly: 1526.46 },
          { termMonths: 24, total: 78053.00, monthly: 3252.21, biweekly: 1626.10, weekly: 813.05 },
          { termMonths: 36, total: 82384.00, monthly: 2288.44, biweekly: 1144.22, weekly: 572.11 },
          { termMonths: 48, total: 86875.00, monthly: 1809.90, biweekly: 904.95, weekly: 452.47 }
        ]
      },
      {
        id: 'const_cremacion_velacion_gris',
        name: 'Cremación con Velación Ataúd Metálico Gris',
        subtitle: 'Velación de cuerpo presente + Proceso de cremación y urna',
        category: 'cremacion',
        contado: 50545,
        features: [
          'Capilla de velación por 24 horas con ataúd en comodato',
          'Servicio de cremación certificado en horno ecológico',
          'Urna básica para cenizas incluida',
          'Trámites de cremación y permiso sanitario',
          'Sala de entrega formal de cenizas',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 52108.00, monthly: 4342.33, biweekly: 2171.17, weekly: 1085.58 },
          { termMonths: 24, total: 53605.00, monthly: 2233.54, biweekly: 1116.77, weekly: 558.39 },
          { termMonths: 36, total: 55107.00, monthly: 1530.75, biweekly: 765.38, weekly: 382.69 },
          { termMonths: 48, total: 56646.00, monthly: 1180.13, biweekly: 590.06, weekly: 295.03 }
        ]
      },
      {
        id: 'const_cremacion_velacion_presidente',
        name: 'Cremación con Velación Ataúd Metálico Presidente',
        subtitle: 'Velación presidencial de gala + Cremación y urna de distinción',
        category: 'cremacion',
        contado: 67545,
        features: [
          'Ataúd Presidente en velación de cuerpo presente',
          'Capilla presidencial con servicio de alimentos/cafetería',
          'Cremación en crematorio propio certificado',
          'Urna conmemorativa de madera fina o metal pulido',
          'Ceremonia íntima de entrega de cenizas',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 71729.75, monthly: 5977.48, biweekly: 2988.74, weekly: 1494.37 },
          { termMonths: 24, total: 75857.75, monthly: 3160.74, biweekly: 1580.37, weekly: 790.18 },
          { termMonths: 36, total: 80066.51, monthly: 2224.07, biweekly: 1112.03, weekly: 556.02 },
          { termMonths: 48, total: 84431.25, monthly: 1758.98, biweekly: 879.49, weekly: 439.75 }
        ]
      },
      {
        id: 'const_cremacion_directa',
        name: 'Cremación Directa (Sin Velación)',
        subtitle: 'Servicio ágil, digno y directo de cremación',
        category: 'cremacion',
        contado: 26000,
        features: [
          'Recolección del cuerpo en hospital o domicilio',
          'Resguardo y refrigeración reglamentaria',
          'Proceso de cremación directa',
          'Urna básica para cenizas',
          'Gestoría de acta de defunción ante el Registro Civil',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 27635.00, monthly: 2302.92, biweekly: 1151.46, weekly: 575.73 },
          { termMonths: 24, total: 29199.00, monthly: 1216.63, biweekly: 608.31, weekly: 304.16 },
          { termMonths: 36, total: 30819.00, monthly: 856.08, biweekly: 428.04, weekly: 214.02 },
          { termMonths: 48, total: 32500.00, monthly: 677.08, biweekly: 338.54, weekly: 169.27 }
        ]
      }
    ]
  },

  // 2. CAPILLAS DE DR MIER Y LAGO DE CHAPALA
  {
    id: 'dr_mier',
    name: 'Capillas de Dr. Mier y Lago de Chapala',
    shortName: 'Capillas Dr. Mier',
    address: 'Dr. Mier esq. Lago de Chapala',
    badge: 'Tradicional y Céntrica',
    description: 'Ubicación tradicional de fácil acceso, ambiente cálido y promociones de hasta 90 meses.',
    plans: [
      {
        id: 'drmier_metalico_gris',
        name: 'Metálico Básico Gris',
        subtitle: 'Ataúd metálico tradicional con velación en capilla Dr. Mier',
        category: 'metalico',
        contado: 29500,
        features: [
          'Ataúd metálico básico color gris',
          'Capilla de velación tradicional por 24 horas',
          'Arreglo del cuerpo y embalsamamiento profesional',
          'Carroza fúnebre para traslados y panteón local',
          'Asistencia legal y administrativa de defunción',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 31355.00, monthly: 2612.92, biweekly: 1306.46, weekly: 653.23 },
          { termMonths: 24, total: 33130.00, monthly: 1380.42, biweekly: 690.21, weekly: 345.10 },
          { termMonths: 36, total: 34969.00, monthly: 971.36, biweekly: 485.68, weekly: 242.84 },
          { termMonths: 48, total: 38675.00, monthly: 805.73, biweekly: 402.86, weekly: 201.43 }
        ]
      },
      {
        id: 'drmier_metalico_presidente',
        name: 'Metálico Presidente',
        subtitle: '★ ¡Promoción especial de hasta 90 meses a $100 semanales!',
        category: 'metalico',
        isAnchor: true,
        contado: 46500,
        features: [
          'Ataúd metálico modelo Presidente',
          'Capilla de velación ejecutiva',
          'Embalsamamiento estético certificado',
          'Cortejo con carroza fúnebre de gala',
          'Cafetería continua y libro conmemorativo',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 49424.00, monthly: 4118.67, biweekly: 2059.33, weekly: 1029.67 },
          { termMonths: 24, total: 52223.00, monthly: 2175.96, biweekly: 1087.98, weekly: 543.99 },
          { termMonths: 36, total: 55120.00, monthly: 1531.11, biweekly: 765.56, weekly: 382.78 },
          { termMonths: 48, total: 58125.00, monthly: 1210.94, biweekly: 605.47, weekly: 302.73 },
          { termMonths: 90, total: 36000.00, monthly: 400.00, biweekly: 200.00, weekly: 100.00, isPromo: true }
        ]
      },
      {
        id: 'drmier_metalico_plus',
        name: 'Metálico Plus (Tamaño XL hasta 130 Kilos)',
        subtitle: 'Modelo reforzado y espacioso en Dr. Mier',
        category: 'metalico',
        contado: 60500,
        features: [
          'Ataúd metálico XL reforzado para personas de hasta 130 kg',
          'Capilla amplia con facilidades de acceso',
          'Personal especializado para cortejo y traslado',
          'Carroza adaptada de gran capacidad',
          'Gestoría legal completa',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 64350.00, monthly: 5362.50, biweekly: 2681.25, weekly: 1340.63 },
          { termMonths: 24, total: 67946.00, monthly: 2831.08, biweekly: 1415.54, weekly: 707.77 },
          { termMonths: 36, total: 71715.00, monthly: 1992.08, biweekly: 996.04, weekly: 498.02 },
          { termMonths: 48, total: 75625.00, monthly: 1575.52, biweekly: 787.76, weekly: 393.88 }
        ]
      },
      {
        id: 'drmier_cremacion_velacion_gris',
        name: 'Cremación con Velación Ataúd Metálico Gris',
        subtitle: 'Velación completa + Cremación y urna',
        category: 'cremacion',
        contado: 37355,
        features: [
          'Capilla de velación en Dr. Mier por 24 horas',
          'Servicio de cremación en horno propio',
          'Urna reglamentaria para cenizas',
          'Trámites de salubridad y certificado de defunción',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 39704.00, monthly: 3308.67, biweekly: 1654.33, weekly: 827.17 },
          { termMonths: 24, total: 41952.00, monthly: 1748.00, biweekly: 874.00, weekly: 437.00 },
          { termMonths: 36, total: 44280.00, monthly: 1230.00, biweekly: 615.00, weekly: 307.50 },
          { termMonths: 48, total: 46694.00, monthly: 972.79, biweekly: 486.40, weekly: 243.20 }
        ]
      },
      {
        id: 'drmier_cremacion_velacion_presidente',
        name: 'Cremación con Velación Ataúd Metálico Presidente',
        subtitle: 'Servicio superior con ataúd Presidente + Cremación',
        category: 'cremacion',
        contado: 54355,
        features: [
          'Velación de gala con ataúd modelo Presidente',
          'Capilla ejecutiva en Dr. Mier',
          'Cremación completa y urna conmemorativa',
          'Gestoría jurídica y apoyo familiar',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 57773.25, monthly: 4814.44, biweekly: 2407.22, weekly: 1203.61 },
          { termMonths: 24, total: 61044.45, monthly: 2543.52, biweekly: 1271.76, weekly: 635.88 },
          { termMonths: 36, total: 64431.35, monthly: 1789.76, biweekly: 894.88, weekly: 447.44 },
          { termMonths: 48, total: 67943.75, monthly: 1415.49, biweekly: 707.75, weekly: 353.87 }
        ]
      },
      {
        id: 'drmier_cremacion_directa',
        name: 'Cremación Directa (Sin Velación)',
        subtitle: 'Servicio directo, solemne y accesible',
        category: 'cremacion',
        contado: 26000,
        features: [
          'Traslado del lugar de fallecimiento al crematorio',
          'Cremación directa ecológica',
          'Urna básica para cenizas',
          'Trámites de defunción incluidos',
          'Plan 100% transferible'
        ],
        terms: [
          { termMonths: 12, total: 27635.00, monthly: 2302.92, biweekly: 1151.46, weekly: 575.73 },
          { termMonths: 24, total: 29199.00, monthly: 1216.63, biweekly: 608.31, weekly: 304.16 },
          { termMonths: 36, total: 30819.00, monthly: 856.08, biweekly: 428.04, weekly: 214.02 },
          { termMonths: 48, total: 32500.00, monthly: 677.08, biweekly: 338.54, weekly: 169.27 }
        ]
      }
    ]
  },

  // 3. PLAN BIENESTAR (CAPILLAS DE DR MIER Y LAGO DE CHAPALA)
  {
    id: 'bienestar',
    name: 'Plan Bienestar (Mayores de 60 Años o Discapacidad)',
    shortName: 'Plan Bienestar',
    address: 'Capillas Dr. Mier y Lago de Chapala',
    badge: 'Apoyo Social 60+ Años',
    description: 'No transferible. Exclusivo para el titular mayor de 60 años o personas con discapacidad. Tarifas sociales preferenciales.',
    plans: [
      {
        id: 'bienestar_metalico_gris',
        name: 'Metálico Básico Gris (Plan Bienestar)',
        subtitle: 'Subsidio para titular mayor de 60 años o discapacidad',
        category: 'metalico',
        contado: 27435,
        features: [
          'No transferible (solo titular calificado)',
          'Ataúd metálico color gris',
          'Capilla de velación en Dr. Mier',
          'Embalsamamiento y preparación básica',
          'Carroza fúnebre local',
          'Trámites de defunción'
        ],
        terms: [
          { termMonths: 12, total: 29160.00, monthly: 2430.00, biweekly: 1215.00, weekly: 607.50 },
          { termMonths: 24, total: 30810.90, monthly: 1283.79, biweekly: 641.89, weekly: 320.95 },
          { termMonths: 36, total: 32521.17, monthly: 903.37, biweekly: 451.68, weekly: 225.84 }
        ]
      },
      {
        id: 'bienestar_madera_basico',
        name: 'Madera Básico (Plan Bienestar)',
        subtitle: 'El plan más accesible de la ciudad: desde $164 pesos semanales',
        category: 'madera',
        contado: 20000,
        features: [
          'No transferible (solo titular calificado)',
          'Ataúd de madera tradicional barnizado',
          'Capilla de velación estándar en Dr. Mier',
          'Preparación del cuerpo',
          'Carroza para traslados locales',
          'Asesoría en trámites de defunción'
        ],
        terms: [
          { termMonths: 12, total: 21600.00, monthly: 1800.00, biweekly: 900.00, weekly: 450.00 },
          { termMonths: 24, total: 22000.00, monthly: 916.67, biweekly: 458.33, weekly: 229.17 },
          { termMonths: 36, total: 23650.00, monthly: 656.94, biweekly: 328.47, weekly: 164.24 }
        ]
      }
    ]
  }
];
