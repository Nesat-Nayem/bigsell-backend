import { NextFunction, Request, Response } from 'express';
import { GeneralSettings } from './general-settings.model';
import { generalSettingsUpdateValidation } from './general-settings.validation';
import { appError } from '../../errors/appError';

export const getGeneralSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let doc = await GeneralSettings.findOne();
    if (!doc) {
      doc = await GeneralSettings.create({});
    }
    res.json({ success: true, statusCode: 200, message: 'General settings retrieved successfully', data: doc });
  } catch (error) {
    next(error);
  }
};

export const updateGeneralSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const textPayload = generalSettingsUpdateValidation.parse(req.body);

    // Files: favicon, logo
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files?.favicon?.[0]?.path) {
      (textPayload as any).favicon = files.favicon[0].path;
    }
    if (files?.logo?.[0]?.path) {
      (textPayload as any).logo = files.logo[0].path;
    }

    let doc = await GeneralSettings.findOne();
    if (!doc) {
      doc = await GeneralSettings.create(textPayload);
    } else {
      doc = await GeneralSettings.findByIdAndUpdate(doc._id, textPayload, { new: true }) as any;
    }

    if (!doc) return next(new appError('Failed to update general settings', 400));

    res.json({ success: true, statusCode: 200, message: 'General settings updated successfully', data: doc });
  } catch (error) {
    next(error);
  }
};
