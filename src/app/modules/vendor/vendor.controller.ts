// import { Request, Response, NextFunction, RequestHandler } from 'express'
// import { VendorApplication } from './vendor.model'
// import { vendorApplyValidation, vendorUpdateStatusValidation, vendorUpdateValidation } from './vendor.validation'
// import { appError } from '../../errors/appError'
// import { Subscription } from '../subscription/subscription.model'
// import { User } from '../auth/auth.model'
// import crypto from 'crypto'
// import { sendMail } from '../../services/mailService'

// export const applyVendor: RequestHandler = async (req, res, next) => {
//   try {
//     const parsed = vendorApplyValidation.parse(req.body)

//     // Pull plan details from subscription if id provided
//     let planName = parsed.planName
//     let planPrice = parsed.planPrice
//     let planBillingCycle = parsed.planBillingCycle
//     let planColor = parsed.planColor
//     let subscriptionId = parsed.subscriptionId

//     if (subscriptionId) {
//       const sub = await Subscription.findOne({ _id: subscriptionId, isDeleted: false })
//         planName = sub.name
//         planPrice = sub.price
//         planBillingCycle = sub.billingCycle as any
//         planColor = sub.color
//       }
//     }
//       planColor,
//       aadharUrl: parsed.aadharUrl,
//       panUrl: parsed.panUrl,
//       paymentStatus: parsed.paymentStatus ?? 'pending',
//       paymentAmount: parsed.paymentAmount,
//       kycStatus: 'pending',
//     })

//     res.json({ success: true, statusCode: 200, message: 'Application submitted', data: doc })
//   } catch (error) {
//     next(error)
//   }
// }

// export const getVendors: RequestHandler = async (req, res, next) => {
//   try {
//     const { search, page, limit, kycStatus } = req.query as { search?: string; page?: string; limit?: string; kycStatus?: 'pending' | 'approved' | 'rejected' }

//     const filter: any = { isDeleted: false }
//     if (kycStatus) filter.kycStatus = kycStatus
//     if (search) {
//       const s = String(search)
//       filter.$or = [
//         { vendorName: { $regex: s, $options: 'i' } },
//         { email: { $regex: s, $options: 'i' } },
//         { phone: { $regex: s, $options: 'i' } },
//         { gstNo: { $regex: s, $options: 'i' } },
//       ]
//     }

//     const sort: any = { createdAt: -1 as any }
//     const limitNum = limit ? parseInt(limit) : undefined
//     const pageNum = page ? parseInt(page) : undefined

//     if (pageNum && limitNum) {
//       const skip = (Math.max(1, pageNum) - 1) * Math.max(1, limitNum)
//       const [items, total] = await Promise.all([
//         VendorApplication.find(filter).sort(sort as any).skip(skip).limit(limitNum),
//         VendorApplication.countDocuments(filter),
//       ])

//       return res.json({
//         success: true,
//         statusCode: 200,
//         message: 'Vendors retrieved',
//         data: items,
//         meta: {
//           total,
//           page: Math.max(1, pageNum),
//           limit: Math.max(1, limitNum),
//           totalPages: Math.ceil(total / Math.max(1, limitNum)) || 1,
//         },
//       })
//     }

//     const items = await VendorApplication.find(filter).sort(sort as any)
//     return res.json({ success: true, statusCode: 200, message: 'Vendors retrieved', data: items })
//   } catch (error) {
//     next(error)
//   }
// }

// export const getVendorById: RequestHandler = async (req, res, next) => {
//   try {
//     const doc = await VendorApplication.findOne({ _id: req.params.id, isDeleted: false })
//     if (!doc) return next(new appError('Vendor application not found', 404))
//     res.json({ success: true, statusCode: 200, message: 'Vendor retrieved', data: doc })
//   } catch (error) {
//     next(error)
//   }
// }

// export const updateVendor: RequestHandler = async (req, res, next) => {
//   try {
//     const parsed = vendorUpdateValidation.parse(req.body)
//     const doc = await VendorApplication.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, parsed, { new: true })
//     if (!doc) return next(new appError('Vendor application not found', 404))
//     res.json({ success: true, statusCode: 200, message: 'Vendor updated', data: doc })
//   } catch (error) {
//     next(error)
//   }
// }

// export const updateKycStatus: RequestHandler = async (req, res, next) => {
//   try {
//     const parsed = vendorUpdateStatusValidation.parse(req.body)
//     const doc = await VendorApplication.findOne({ _id: req.params.id, isDeleted: false })
//     if (!doc) return next(new appError('Vendor application not found', 404))

//     doc.kycStatus = parsed.kycStatus

//     // On approval, create vendor user and send credentials if not already sent
//     let generatedPassword = ''
//     if (parsed.kycStatus === 'approved' && !doc.credentialSent) {
//       generatedPassword = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)

//       // Ensure user uniqueness by email; if exists, update role/password
//       let user = await User.findOne({ email: doc.email })
//       if (!user) {
//         user = new User({
//           name: doc.vendorName,
//           email: doc.email,
//           phone: doc.phone,
//           password: generatedPassword,
//           role: 'vendor',
//           status: 'active',
//         } as any)
//       } else {
//         ;(user as any).role = 'vendor'
//         user.password = generatedPassword
//         ;(user as any).status = 'active'
//       }
//       await user.save()
//       ;(doc as any).vendorUserId = user._id

//       try {
//         await sendMail({
//           to: doc.email,
//           subject: 'Your Vendor Account has been approved',
//           html: `<p>Dear ${doc.vendorName},</p>
// <p>Your KYC has been approved. You can now login using the following credentials:</p>
// <p><strong>Email:</strong> ${doc.email}<br/>
// <strong>Password:</strong> ${generatedPassword}</p>
// <p>Please login and change your password immediately.</p>
// <p>Regards,<br/>Support Team</p>`,
//         })
//         doc.credentialSent = true
//       } catch (mailErr) {
//         console.error('Email send failed:', mailErr)
//       }
//     }

//     await doc.save()

//     res.json({ success: true, statusCode: 200, message: 'KYC status updated', data: doc })
//   } catch (error) {
//     next(error)
//   }
// }

// export const deleteVendor: RequestHandler = async (req, res, next) => {
//   try {
//     const doc = await VendorApplication.findOne({ _id: req.params.id, isDeleted: false })
//     if (!doc) return next(new appError('Vendor application not found', 404))
//     doc.isDeleted = true
//     await doc.save()
//     res.json({ success: true, statusCode: 200, message: 'Vendor deleted', data: doc })
//   } catch (error) {
//     next(error)
//   }
// }
