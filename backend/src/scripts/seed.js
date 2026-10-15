import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const SEED_USERS = [
  {
    name: 'Aarav Mehta',
    email: 'aarav.m@college.edu',
    password: 'Password@123',
    role: 'BUYER',
    college: 'National Institute of Technology',
    department: 'Civil Engineering (2nd Year)',
    phone: '+91 98765 43210',
    hostelRoom: 'Hostel 3, Room 214',
    isEmailVerified: true
  },
  {
    name: 'Rohan Sharma',
    email: 'rohan.s@college.edu',
    password: 'Password@123',
    role: 'SELLER',
    college: 'National Institute of Technology',
    department: 'Mechanical Engineering (3rd Year)',
    phone: '+91 98234 56789',
    hostelRoom: 'Hostel 4, Room 108',
    isEmailVerified: true
  },
  {
    name: 'Prof. Rao',
    email: 'admin.moderator@college.edu',
    password: 'AdminPassword@123',
    role: 'ADMIN',
    college: 'National Institute of Technology',
    department: 'Computer Applications',
    phone: '+91 99000 11223',
    hostelRoom: 'Staff Quarters B-12',
    isEmailVerified: true
  }
];

const SEED_PRODUCTS = [
  {
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    description: 'High-resolution LCD scientific calculator with 552 functions. Essential for 1st & 2nd year Engineering Math and Thermodynamics. Barely used for one semester with original slide-on hard case and solar panel in perfect working condition.',
    category: 'Calculators',
    priceInPaise: 85000,
    condition: 'Like New',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'ACTIVE',
    pickupLocationNote: 'Library Lawn or Hostel 4 Front Gate'
  },
  {
    title: 'Hercules Roadeo 21-Speed Geared Mountain Bicycle',
    description: 'Sturdy alloy frame cycle with front suspension, dual disc brakes, and Shimano 21-speed thumb shifters. Purchased last year for campus commuting between academic block and hostel. Comes with free cable lock and bottle cage.',
    category: 'Cycles',
    priceInPaise: 420000,
    condition: 'Good',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'ACTIVE',
    pickupLocationNote: 'Main Sports Complex Cycle Stand'
  },
  {
    title: 'Introduction to Algorithms (CLRS 3rd Edition)',
    description: 'The standard algorithms textbook by Cormen, Leiserson, Rivest, and Stein. Hardcover copy with zero torn pages and clean margins. Indispensable for Design & Analysis of Algorithms and competitive coding preparation.',
    category: 'Books',
    priceInPaise: 65000,
    condition: 'Good',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'ACTIVE',
    pickupLocationNote: 'Central Canteen or IT Dept Foyer'
  },
  {
    title: 'Prestige 1.5L Stainless Steel Electric Kettle',
    description: 'Compact 1500W electric kettle with automatic cutoff, 360-degree swivel base, and ergonomic cool-touch handle. Perfect for making late-night noodles, green tea, and hot water in the hostel room during exam weeks.',
    category: 'Hostel Essentials',
    priceInPaise: 49900,
    condition: 'Like New',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'ACTIVE',
    pickupLocationNote: 'Hostel C Mess Entrance'
  },
  {
    title: 'Engineering Chemistry & Physics Lab Coat (Size L)',
    description: '100% white cotton lab apron with full sleeves and deep utility pockets. Required for First-Year Engineering Chemistry and Materials Science lab sessions. Freshly washed, ironed, and free of any chemical stains.',
    category: 'Lab Equipment',
    priceInPaise: 25000,
    condition: 'Good',
    isUniqueItem: false,
    stockQuantity: 3,
    images: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'ACTIVE',
    pickupLocationNote: 'Chemistry Dept Entrance'
  },
  {
    title: 'Logitech K380 Multi-Device Bluetooth Wireless Keyboard',
    description: 'Ultra-slim wireless keyboard with quiet scissor keys. Easily connects to up to 3 devices (laptop, tablet, phone) with easy-switch buttons. Great for quiet hostel room study sessions. Includes fresh AAA batteries.',
    category: 'Electronics',
    priceInPaise: 135000,
    condition: 'Like New',
    isUniqueItem: true,
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'ACTIVE',
    pickupLocationNote: 'Library Study Area 2nd Floor'
  }
];

const seedDatabase = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log('Skipping seed: No MongoDB connection established.');
      process.exit(0);
    }

    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Seeding demo users...');
    const createdUsers = [];
    for (const userData of SEED_USERS) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);
      const user = await User.create({
        ...userData,
        passwordHash
      });
      createdUsers.push(user);
    }

    const sellerUser = createdUsers.find((u) => u.role === 'SELLER') || createdUsers[0];

    console.log('Seeding campus products...');
    for (const prodData of SEED_PRODUCTS) {
      await Product.create({
        ...prodData,
        sellerId: sellerUser._id
      });
    }

    console.log(`\n🎉 Seed Successful!`);
    console.log(`- Created ${createdUsers.length} users (Buyer, Seller, Admin)`);
    console.log(`- Created ${SEED_PRODUCTS.length} marketplace products`);
    console.log(`- Seller ID attached: ${sellerUser._id}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();
