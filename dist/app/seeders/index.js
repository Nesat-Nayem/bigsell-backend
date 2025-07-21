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
exports.runSeeders = void 0;
const adminStaffSeeder_1 = require("./adminStaffSeeder");
// ... other imports
const runSeeders = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Running seeders...');
        // Run existing seeders first
        // await seedAdmin();
        // await seedCategories();
        // ... other seeders
        // Run admin staff seeder
        yield (0, adminStaffSeeder_1.seedAdminStaff)();
        console.log('All seeders completed successfully');
    }
    catch (error) {
        console.error('Error running seeders:', error);
    }
});
exports.runSeeders = runSeeders;
