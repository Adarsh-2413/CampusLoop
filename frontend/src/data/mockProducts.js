/**
 * Fictional mock catalog for CampusLoop Phase 1 prototyping.
 * Adheres to college marketplace categories, realistic conditions, and single-unit used goods.
 */

export const CATEGORIES = [
  'All',
  'Books',
  'Electronics',
  'Calculators',
  'Cycles',
  'Hostel Essentials',
  'Lab Equipment',
  'Other'
];

export const CONDITIONS = ['All', 'New', 'Like New', 'Good', 'Fair'];

export const MOCK_PRODUCTS = [
  {
    id: 'prod-001',
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    description: 'High-resolution LCD scientific calculator with 552 functions. Essential for 1st & 2nd year Engineering Math and Thermodynamics. Barely used for one semester with original slide-on hard case and solar panel in perfect working condition.',
    category: 'Calculators',
    price: 850,
    priceInPaise: 85000,
    condition: 'Like New',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80'
    ],
    seller: {
      id: 'user-seller-1',
      name: 'Rohan Sharma',
      college: 'National Institute of Technology',
      department: 'Mechanical Engineering (3rd Year)',
      isVerifiedStudent: true,
      pickupSpot: 'Library Lawn or Hostel 4 Front Gate'
    },
    status: 'ACTIVE',
    createdAt: '2026-10-12T09:30:00Z'
  },
  {
    id: 'prod-002',
    title: 'Hercules Roadeo 21-Speed Geared Mountain Bicycle',
    description: 'Sturdy alloy frame cycle with front suspension, dual disc brakes, and Shimano 21-speed thumb shifters. Purchased last year for campus commuting between academic block and hostel. Comes with free cable lock and bottle cage.',
    category: 'Cycles',
    price: 4200,
    priceInPaise: 420000,
    condition: 'Good',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80'
    ],
    seller: {
      id: 'user-seller-2',
      name: 'Priya Patel',
      college: 'Indian Institute of Information Technology',
      department: 'Computer Science (Final Year)',
      isVerifiedStudent: true,
      pickupSpot: 'Main Sports Complex Cycle Stand'
    },
    status: 'ACTIVE',
    createdAt: '2026-10-13T14:15:00Z'
  },
  {
    id: 'prod-003',
    title: 'Introduction to Algorithms (CLRS 3rd Edition)',
    description: 'The standard algorithms textbook by Cormen, Leiserson, Rivest, and Stein. Hardcover copy with zero torn pages and clean margins. Indispensable for Design & Analysis of Algorithms and competitive coding preparation.',
    category: 'Books',
    price: 650,
    priceInPaise: 65000,
    condition: 'Good',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80'
    ],
    seller: {
      id: 'user-seller-3',
      name: 'Arjun Verma',
      college: 'Delhi Technological University',
      department: 'Information Technology (4th Year)',
      isVerifiedStudent: true,
      pickupSpot: 'Central Canteen or IT Dept Foyer'
    },
    status: 'ACTIVE',
    createdAt: '2026-10-14T11:00:00Z'
  },
  {
    id: 'prod-004',
    title: 'Prestige 1.5L Stainless Steel Electric Kettle',
    description: 'Compact 1500W electric kettle with automatic cutoff, 360-degree swivel base, and ergonomic cool-touch handle. Perfect for making late-night noodles, green tea, and hot water in the hostel room during exam weeks.',
    category: 'Hostel Essentials',
    price: 499,
    priceInPaise: 49900,
    condition: 'Like New',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?auto=format&fit=crop&w=800&q=80'
    ],
    seller: {
      id: 'user-seller-4',
      name: 'Ananya Deshmukh',
      college: 'BITS Pilani',
      department: 'Electrical & Electronics (3rd Year)',
      isVerifiedStudent: true,
      pickupSpot: 'Hostel C Mess Entrance'
    },
    status: 'ACTIVE',
    createdAt: '2026-10-11T16:20:00Z'
  },
  {
    id: 'prod-005',
    title: 'Engineering Chemistry & Physics Lab Coat (Size L)',
    description: '100% white cotton lab apron with full sleeves and deep utility pockets. Required for First-Year Engineering Chemistry and Materials Science lab sessions. Freshly washed, ironed, and free of any chemical stains.',
    category: 'Lab Equipment',
    price: 250,
    priceInPaise: 25000,
    condition: 'Good',
    isUniqueItem: false,
    stockQuantity: 3,
    images: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
    ],
    seller: {
      id: 'user-seller-1',
      name: 'Rohan Sharma',
      college: 'National Institute of Technology',
      department: 'Mechanical Engineering (3rd Year)',
      isVerifiedStudent: true,
      pickupSpot: 'Chemistry Dept Entrance'
    },
    status: 'ACTIVE',
    createdAt: '2026-10-10T12:00:00Z'
  },
  {
    id: 'prod-006',
    title: 'Logitech K380 Multi-Device Bluetooth Wireless Keyboard',
    description: 'Ultra-slim wireless keyboard with quiet scissor keys. Easily connects to up to 3 devices (laptop, tablet, phone) with easy-switch buttons. Great for quiet hostel room study sessions. Includes fresh AAA batteries.',
    category: 'Electronics',
    price: 1350,
    priceInPaise: 135000,
    condition: 'Like New',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    seller: {
      id: 'user-seller-2',
      name: 'Priya Patel',
      college: 'Indian Institute of Information Technology',
      department: 'Computer Science (Final Year)',
      isVerifiedStudent: true,
      pickupSpot: 'Library Study Area 2nd Floor'
    },
    status: 'ACTIVE',
    createdAt: '2026-10-14T08:45:00Z'
  },
  {
    id: 'prod-007',
    title: 'Wipro LED Study Desk Lamp with 3 Dimming Modes',
    description: 'Rechargeable LED desk lamp featuring flexible gooseneck, touch-sensitive power control, and 3 color temperatures (warm, cool, daylight). Battery backup lasts up to 5 hours on low mode. Includes Micro-USB charging cord.',
    category: 'Hostel Essentials',
    price: 380,
    priceInPaise: 38000,
    condition: 'Good',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80'
    ],
    seller: {
      id: 'user-seller-3',
      name: 'Arjun Verma',
      college: 'Delhi Technological University',
      department: 'Information Technology (4th Year)',
      isVerifiedStudent: true,
      pickupSpot: 'Hostel 2 Common Room'
    },
    status: 'ACTIVE',
    createdAt: '2026-10-13T18:10:00Z'
  },
  {
    id: 'prod-008',
    title: 'Digital Multimeter with Probes & Transistor Tester',
    description: 'Compact DT830D digital multimeter for Basic Electrical & Electronics Lab. Accurately measures AC/DC voltage, DC current, resistance, continuity buzzer, and diodes. Includes red and black test leads and 9V battery.',
    category: 'Lab Equipment',
    price: 320,
    priceInPaise: 32000,
    condition: 'New',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    ],
    seller: {
      id: 'user-seller-4',
      name: 'Ananya Deshmukh',
      college: 'BITS Pilani',
      department: 'Electrical & Electronics (3rd Year)',
      isVerifiedStudent: true,
      pickupSpot: 'EEE Hardware Lab Room 204'
    },
    status: 'ACTIVE',
    createdAt: '2026-10-09T10:00:00Z'
  }
];
