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
exports.updateAbout = exports.getAbout = void 0;
const about_model_1 = require("./about.model");
const about_validation_1 = require("./about.validation");
const cloudinary_1 = require("../../config/cloudinary");
// Helper to safely parse JSON strings in multipart fields
function parseJSON(str) {
    if (!str)
        return undefined;
    try {
        return JSON.parse(str);
    }
    catch (_a) {
        return undefined;
    }
}
const getAbout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let doc = yield about_model_1.About.findOne();
        if (!doc) {
            doc = yield about_model_1.About.create({});
        }
        res.json({ success: true, statusCode: 200, message: 'About content retrieved successfully', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.getAbout = getAbout;
const updateAbout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    try {
        // Accept nested sections either as JSON strings (recommended for multipart) or as direct fields
        const body = {};
        const aboutUs = (_a = parseJSON(req.body.aboutUs)) !== null && _a !== void 0 ? _a : req.body.aboutUs;
        const counter = (_b = parseJSON(req.body.counter)) !== null && _b !== void 0 ? _b : req.body.counter;
        const aboutInfo = (_c = parseJSON(req.body.aboutInfo)) !== null && _c !== void 0 ? _c : req.body.aboutInfo;
        const whyChooseUs = (_d = parseJSON(req.body.whyChooseUs)) !== null && _d !== void 0 ? _d : req.body.whyChooseUs;
        if (aboutUs)
            body.aboutUs = aboutUs;
        if (counter)
            body.counter = counter;
        if (aboutInfo)
            body.aboutInfo = aboutInfo;
        if (whyChooseUs)
            body.whyChooseUs = whyChooseUs;
        // Ensure a singleton document exists
        let doc = yield about_model_1.About.findOne();
        if (!doc) {
            doc = yield about_model_1.About.create({});
        }
        // Handle image uploads via named fields
        const files = req.files;
        // aboutUs.image
        const aboutUsImage = (_e = files === null || files === void 0 ? void 0 : files.aboutUsImage) === null || _e === void 0 ? void 0 : _e[0];
        if (aboutUsImage) {
            const newPath = aboutUsImage.path;
            body.aboutUs = body.aboutUs || {};
            body.aboutUs.image = newPath;
            if ((_f = doc.aboutUs) === null || _f === void 0 ? void 0 : _f.image) {
                const publicId = (_g = doc.aboutUs.image.split('/').pop()) === null || _g === void 0 ? void 0 : _g.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`about/${publicId}`);
            }
        }
        // aboutInfo.image
        const aboutInfoImage = (_h = files === null || files === void 0 ? void 0 : files.aboutInfoImage) === null || _h === void 0 ? void 0 : _h[0];
        if (aboutInfoImage) {
            const newPath = aboutInfoImage.path;
            body.aboutInfo = body.aboutInfo || {};
            body.aboutInfo.image = newPath;
            if ((_j = doc.aboutInfo) === null || _j === void 0 ? void 0 : _j.image) {
                const publicId = (_k = doc.aboutInfo.image.split('/').pop()) === null || _k === void 0 ? void 0 : _k.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`about/${publicId}`);
            }
        }
        // whyChooseUs images (indexes 0..2)
        const why1Image = (_l = files === null || files === void 0 ? void 0 : files.why1Image) === null || _l === void 0 ? void 0 : _l[0];
        const why2Image = (_m = files === null || files === void 0 ? void 0 : files.why2Image) === null || _m === void 0 ? void 0 : _m[0];
        const why3Image = (_o = files === null || files === void 0 ? void 0 : files.why3Image) === null || _o === void 0 ? void 0 : _o[0];
        const currentWhy = Array.isArray(doc.whyChooseUs) ? doc.whyChooseUs : [];
        const nextWhy = Array.isArray(body.whyChooseUs) ? body.whyChooseUs : [...currentWhy];
        if (why1Image) {
            nextWhy[0] = nextWhy[0] || {};
            nextWhy[0].image = why1Image.path;
            if ((_p = currentWhy[0]) === null || _p === void 0 ? void 0 : _p.image) {
                const publicId = (_q = currentWhy[0].image.split('/').pop()) === null || _q === void 0 ? void 0 : _q.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`about/${publicId}`);
            }
        }
        if (why2Image) {
            nextWhy[1] = nextWhy[1] || {};
            nextWhy[1].image = why2Image.path;
            if ((_r = currentWhy[1]) === null || _r === void 0 ? void 0 : _r.image) {
                const publicId = (_s = currentWhy[1].image.split('/').pop()) === null || _s === void 0 ? void 0 : _s.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`about/${publicId}`);
            }
        }
        if (why3Image) {
            nextWhy[2] = nextWhy[2] || {};
            nextWhy[2].image = why3Image.path;
            if ((_t = currentWhy[2]) === null || _t === void 0 ? void 0 : _t.image) {
                const publicId = (_u = currentWhy[2].image.split('/').pop()) === null || _u === void 0 ? void 0 : _u.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`about/${publicId}`);
            }
        }
        if (why1Image || why2Image || why3Image) {
            body.whyChooseUs = nextWhy;
        }
        // Validate payload
        const validated = about_validation_1.aboutUpdateValidation.parse(body);
        // Apply updates
        const updated = yield about_model_1.About.findOneAndUpdate({}, validated, { new: true, upsert: true });
        res.json({ success: true, statusCode: 200, message: 'About content updated successfully', data: updated });
    }
    catch (error) {
        // No temp cleanup here since using Cloudinary direct upload via Multer storage (paths are remote)
        next(error);
    }
});
exports.updateAbout = updateAbout;
