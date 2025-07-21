"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVotersByLocation = exports.deleteVoter = exports.updateVoter = exports.getAllVoters = exports.getFilteredVoters = exports.getVoterById = exports.createVoter = void 0;
const voter_model_1 = require("./voter.model");
const voter_validation_1 = require("./voter.validation");
const appError_1 = require("../../errors/appError");
const createVoter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, dob, state, district, constituency, division, location, img } = voter_validation_1.voterValidation.parse(req.body);
        const voter = new voter_model_1.Voter({
            name,
            dob: new Date(dob),
            location,
            state, district, constituency, division,
            img
        });
        yield voter.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Voter created successfully",
            data: voter,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createVoter = createVoter;
const getVoterById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const voter = yield voter_model_1.Voter.findById(req.params.id);
        if (!voter) {
            return next(new appError_1.appError("Voter not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Voter retrieved successfully",
            data: voter,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getVoterById = getVoterById;
const getFilteredVoters = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { state, district, constituency, division } = req.query;
        const filterQuery = { isDeleted: false };
        if (state)
            filterQuery.state = { $regex: state, $options: 'i' };
        if (district)
            filterQuery.district = { $regex: district, $options: 'i' };
        if (constituency)
            filterQuery.constituency = { $regex: constituency, $options: 'i' };
        if (division)
            filterQuery.division = { $regex: division, $options: 'i' };
        const voters = yield voter_model_1.Voter.find(filterQuery).sort({ createdAt: -1 });
        if (voters.length === 0) {
            return next(new appError_1.appError("No voters found with specified criteria", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Filtered voters retrieved successfully",
            data: voters,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getFilteredVoters = getFilteredVoters;
// export const getAllVoters = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const voters = await Voter.find({ isDeleted: false }).sort({ createdAt: -1 });
//     if (voters.length === 0) {
//       return next(new appError("No voters found", 404));
//     }
//     res.json({
//       success: true,
//       statusCode: 200,
//       message: "Voters retrieved successfully",
//       data: voters,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
const getAllVoters = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { state, district, constituency, division } = req.query;
        const filterQuery = { isDeleted: false };
        // Add filters only if they exist in query params
        if (state)
            filterQuery.state = { $regex: state, $options: 'i' };
        if (district)
            filterQuery.district = { $regex: district, $options: 'i' };
        if (constituency)
            filterQuery.constituency = { $regex: constituency, $options: 'i' };
        if (division)
            filterQuery.division = { $regex: division, $options: 'i' };
        const voters = yield voter_model_1.Voter.find(filterQuery).sort({ createdAt: -1 });
        if (voters.length === 0) {
            return next(new appError_1.appError("No voters found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Voters retrieved successfully",
            data: voters,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllVoters = getAllVoters;
const updateVoter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = req.body;
        const voter = yield voter_model_1.Voter.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });
        if (!voter) {
            return next(new appError_1.appError("Voter not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Voter updated successfully",
            data: voter,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateVoter = updateVoter;
const deleteVoter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const voter = yield voter_model_1.Voter.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!voter) {
            return next(new appError_1.appError("Voter not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Voter deleted successfully",
            data: voter,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteVoter = deleteVoter;
const getVotersByLocation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const location = req.params.location;
        const voters = yield voter_model_1.Voter.find({
            location: { $regex: location, $options: 'i' },
            isDeleted: false
        });
        if (voters.length === 0) {
            return next(new appError_1.appError("No voters found for this location", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Voters retrieved successfully",
            data: voters,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getVotersByLocation = getVotersByLocation;
