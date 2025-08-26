import { NextFunction, Request, Response } from 'express';
import { About } from './about.model';
import { aboutUpdateValidation } from './about.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

// Helper to safely parse JSON strings in multipart fields
function parseJSON<T>(str?: string): T | undefined {
  if (!str) return undefined;
  try {
    return JSON.parse(str) as T;
  } catch {
    return undefined;
  }
}

export const getAbout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let doc = await About.findOne();
    if (!doc) {
      doc = await About.create({});
    }
    res.json({ success: true, statusCode: 200, message: 'About content retrieved successfully', data: doc });
  } catch (error) {
    next(error);
  }
};

export const updateAbout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Accept nested sections either as JSON strings (recommended for multipart) or as direct fields
    const body: any = {};
    const aboutUs = parseJSON<any>(req.body.aboutUs) ?? req.body.aboutUs;
    const counter = parseJSON<any>(req.body.counter) ?? req.body.counter;
    const aboutInfo = parseJSON<any>(req.body.aboutInfo) ?? req.body.aboutInfo;
    const whyChooseUs = parseJSON<any>(req.body.whyChooseUs) ?? req.body.whyChooseUs;

    if (aboutUs) body.aboutUs = aboutUs;
    if (counter) body.counter = counter;
    if (aboutInfo) body.aboutInfo = aboutInfo;
    if (whyChooseUs) body.whyChooseUs = whyChooseUs;

    // Ensure a singleton document exists
    let doc = await About.findOne();
    if (!doc) {
      doc = await About.create({});
    }

    // Handle image uploads via named fields
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    // aboutUs.image
    const aboutUsImage = files?.aboutUsImage?.[0];
    if (aboutUsImage) {
      const newPath = aboutUsImage.path;
      body.aboutUs = body.aboutUs || {};
      body.aboutUs.image = newPath;
      if (doc.aboutUs?.image) {
        const publicId = doc.aboutUs.image.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`about/${publicId}`);
      }
    }

    // aboutInfo.image
    const aboutInfoImage = files?.aboutInfoImage?.[0];
    if (aboutInfoImage) {
      const newPath = aboutInfoImage.path;
      body.aboutInfo = body.aboutInfo || {};
      body.aboutInfo.image = newPath;
      if (doc.aboutInfo?.image) {
        const publicId = doc.aboutInfo.image.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`about/${publicId}`);
      }
    }

    // whyChooseUs images (indexes 0..2)
    const why1Image = files?.why1Image?.[0];
    const why2Image = files?.why2Image?.[0];
    const why3Image = files?.why3Image?.[0];

    const currentWhy = Array.isArray(doc.whyChooseUs) ? doc.whyChooseUs : [];
    const nextWhy = Array.isArray(body.whyChooseUs) ? body.whyChooseUs : [...currentWhy];

    if (why1Image) {
      nextWhy[0] = nextWhy[0] || {};
      nextWhy[0].image = why1Image.path;
      if (currentWhy[0]?.image) {
        const publicId = currentWhy[0].image.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`about/${publicId}`);
      }
    }
    if (why2Image) {
      nextWhy[1] = nextWhy[1] || {};
      nextWhy[1].image = why2Image.path;
      if (currentWhy[1]?.image) {
        const publicId = currentWhy[1].image.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`about/${publicId}`);
      }
    }
    if (why3Image) {
      nextWhy[2] = nextWhy[2] || {};
      nextWhy[2].image = why3Image.path;
      if (currentWhy[2]?.image) {
        const publicId = currentWhy[2].image.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`about/${publicId}`);
      }
    }

    if (why1Image || why2Image || why3Image) {
      body.whyChooseUs = nextWhy;
    }

    // Validate payload
    const validated = aboutUpdateValidation.parse(body);

    // Apply updates
    const updated = await About.findOneAndUpdate({}, validated, { new: true, upsert: true });

    res.json({ success: true, statusCode: 200, message: 'About content updated successfully', data: updated });
  } catch (error) {
    // No temp cleanup here since using Cloudinary direct upload via Multer storage (paths are remote)
    next(error);
  }
};
