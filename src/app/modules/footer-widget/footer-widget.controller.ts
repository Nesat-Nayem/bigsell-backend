import { NextFunction, Request, Response } from 'express';
import { FooterWidget } from './footer-widget.model';
import { footerWidgetCreateValidation, footerWidgetUpdateValidation } from './footer-widget.validation';
import { appError } from '../../errors/appError';

export const createFooterWidget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = footerWidgetCreateValidation.parse(req.body);
    const doc = await FooterWidget.create(validated);
    res.status(201).json({ success: true, statusCode: 201, message: 'Footer widget created successfully', data: doc });
  } catch (error) {
    next(error);
  }
};

export const getAllFooterWidgets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await FooterWidget.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, statusCode: 200, message: 'Footer widgets retrieved successfully', data: docs });
  } catch (error) {
    next(error);
  }
};

export const getFooterWidgetById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await FooterWidget.findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return next(new appError('Footer widget not found', 404));
    res.json({ success: true, statusCode: 200, message: 'Footer widget retrieved successfully', data: doc });
  } catch (error) {
    next(error);
  }
};

export const updateFooterWidgetById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = footerWidgetUpdateValidation.parse(req.body);

    const updated = await FooterWidget.findOneAndUpdate({ _id: id, isDeleted: false }, payload, { new: true });
    if (!updated) return next(new appError('Footer widget not found', 404));

    res.json({ success: true, statusCode: 200, message: 'Footer widget updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteFooterWidgetById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await FooterWidget.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
    if (!updated) return next(new appError('Footer widget not found', 404));

    res.json({ success: true, statusCode: 200, message: 'Footer widget deleted successfully', data: updated });
  } catch (error) {
    next(error);
  }
};
