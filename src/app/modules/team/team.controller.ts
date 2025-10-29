import { NextFunction, Request, Response } from 'express';
import { Team } from './team.model';
import { teamValidation, updateTeamValidation } from './team.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

export const getTeams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;
    const query: any = { isDeleted: false };
    if (status === 'active') {
      query.status = 'Active';
    } else if (status === 'inactive') {
      query.status = 'Inactive';
    }

    const teams = await Team.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      statusCode: 200,
      message: 'Teams retrieved successfully',
      data: teams,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const team = await Team.findOne({ _id: id, isDeleted: false });
    if (!team) {
      next(new appError('Team not found', 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Team retrieved successfully',
      data: team,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, designation, status } = req.body;

    const existing = await Team.findOne({ name, isDeleted: false });
    if (existing) {
      next(new appError('Team member with this name already exists', 400));
      return;
    }

    if (!req.file) {
      next(new appError('Image is required', 400));
      return;
    }

    const image = req.file.path;
    const validated = teamValidation.parse({
      name,
      designation,
      image,
      status: status === 'Active' || status === true || status === 'true' ? 'Active' : 'Inactive',
    });

    const team = new Team(validated);
    await team.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Team created successfully',
      data: team,
    });
    return;
  } catch (error) {
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-teams/${publicId}`);
      }
    }
    next(error);
  }
};

export const updateTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, designation, status } = req.body;

    const team = await Team.findOne({ _id: id, isDeleted: false });
    if (!team) {
      next(new appError('Team not found', 404));
      return;
    }

    if (name && name !== team.name) {
      const existing = await Team.findOne({ name, isDeleted: false });
      if (existing) {
        next(new appError('Team member with this name already exists', 400));
        return;
      }
    }

    const updateData: any = {
      name: name || team.name,
      designation: designation || team.designation,
      status: status === 'Active' || status === true || status === 'true' ? 'Active' : 'Inactive',
    };

    if (req.file) {
      const oldImagePublicId = team.image.split('/').pop()?.split('.')[0];
      if (oldImagePublicId) {
        await cloudinary.uploader.destroy(`restaurant-teams/${oldImagePublicId}`);
      }
      updateData.image = req.file.path;
    }

    const validated = updateTeamValidation.parse(updateData);
    const updated = await Team.findByIdAndUpdate(id, validated, { new: true });

    res.json({
      success: true,
      statusCode: 200,
      message: 'Team updated successfully',
      data: updated,
    });
    return;
  } catch (error) {
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-teams/${publicId}`);
      }
    }
    next(error);
  }
};

export const deleteTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const team = await Team.findOne({ _id: id, isDeleted: false });
    if (!team) {
      next(new appError('Team not found', 404));
      return;
    }

    team.isDeleted = true;
    await team.save();

    res.json({
      success: true,
      statusCode: 200,
      message: 'Team deleted successfully',
      data: team,
    });
    return;
  } catch (error) {
    next(error);
  }
};
