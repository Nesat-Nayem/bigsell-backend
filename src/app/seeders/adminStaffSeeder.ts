// import { AdminStaff } from '../modules/admin-staff/admin-staff.model';
// import { User } from '../modules/auth/auth.model';

// export const seedAdminStaff = async () => {
//   try {
//     // Check if admin staff already exists
//     const existingAdminStaff = await AdminStaff.findOne({ email: 'staff@airmenu.com' });
//     if (existingAdminStaff) {
//       console.log('Admin staff already exists');
//       return;
//     }

//     // Find the main admin to set as creator
//     const mainAdmin = await User.findOne({ role: 'admin' });
//     if (!mainAdmin) {
//       console.log('Main admin not found. Please create admin first.');
//       return;
//     }

//     // Create sample admin staff with different permission levels
//     const adminStaffMembers = [
//       {
//         name: 'John Manager',
//         email: 'manager@airmenu.com',
//         password: 'password123',
//         phone: '9876543210',
//         permissions: {
//           dashboard: true,
//           orders: true,
//           restaurants: true,
//           tableBookings: true,
//           vendorKyc: true,
//           categories: true,
//           banners: true,
//           exclusiveOffers: true,
//           featureOffers: true,
//           contacts: true,
//           pricing: true,
//           blog: true,
//           qrCodes: true,
//           faq: true,
//           privacyPolicy: true,
//           termsConditions: true,
//           helpSupport: true,
//         },
//         createdBy: mainAdmin._id,
//         status: 'active'
//       },
//       {
//         name: 'Sarah Orders',
//         email: 'orders@airmenu.com',
//         password: 'password123',
//         phone: '9876543211',
//         permissions: {
//           dashboard: true,
//           orders: true,
//           restaurants: true,
//           tableBookings: true,
//           vendorKyc: false,
//           categories: false,
//           banners: false,
//           exclusiveOffers: false,
//           featureOffers: false,
//           contacts: false,
//           pricing: false,
//           blog: false,
//           qrCodes: false,
//           faq: false,
//           privacyPolicy: false,
//           termsConditions: false,
//           helpSupport: false,
//         },
//         createdBy: mainAdmin._id,
//         status: 'active'
//       },
//       {
//         name: 'Mike Content',
//         email: 'content@airmenu.com',
//         password: 'password123',
//         phone: '9876543212',
//         permissions: {
//           dashboard: true,
//           orders: false,
//           restaurants: false,
//           tableBookings: false,
//           vendorKyc: false,
//           categories: true,
//           banners: true,
//           exclusiveOffers: true,
//           featureOffers: true,
//           contacts: true,
//           pricing: false,
//           blog: true,
//           qrCodes: false,
//           faq: true,
//           privacyPolicy: true,
//           termsConditions: true,
//           helpSupport: true,
//         },
//         createdBy: mainAdmin._id,
//         status: 'active'
//       }
//     ];

//     await AdminStaff.insertMany(adminStaffMembers);
//     console.log('Admin staff seeded successfully');

//   } catch (error) {
//     console.error('Error seeding admin staff:', error);
//   }
// };