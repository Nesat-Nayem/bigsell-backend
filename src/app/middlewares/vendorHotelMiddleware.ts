// import { Response, NextFunction } from 'express';
// import { userInterface } from './userInterface';
// import { appError } from '../errors/appError';
// import { Hotel } from '../modules/hotel/hotel.model';
// import { User } from '../modules/auth/auth.model';

// export const vendorHotelMiddleware = async (
//   req: userInterface,
//   res: Response,
//   next: NextFunction,
// ) => {
  
  
//   try {
//     if (!req.user) {
//       return next(new appError('Authentication required', 401));
//     }

//     // If the user is an admin, they can proceed.
//     if (req.user.role === 'admin') {
//       return next();
//     }

//     // If the user is a vendor, find their hotel and attach it.
//     if (req.user.role === 'vendor') {
//       const hotel = await Hotel.findOne({ vendorId: req.user._id, isDeleted: false });
      
//       // We don't block if they don't have a hotel yet, 
//       // as they might be in the process of creating one.
//       // The controller logic will handle authorization.
//       if (hotel) {
//         (req.user as any).vendorDetails = { hotel: hotel._id };
//       }
//       return next();
//     }

//     // If the user is a staff, find their hotel and attach it.
//     if (req.user.role === 'staff') {
//       if (req.user.hotelId) {
//          (req.user as any).vendorDetails = { hotel: req.user.hotelId };
//       }
//       return next();
//     }

//     // For any other role, deny access if the route is vendor-specific.
//     return next(new appError('You do not have permission to perform this action', 403));

//   } catch (error) {
//     next(error);
//   }
// };