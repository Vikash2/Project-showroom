// Quick validation: check all requires resolve without errors
require("dotenv").config();

const checks = [
  ["./src/config/supabase", "supabase.js"],
  ["./src/middleware/authenticate", "authenticate.js"],
  ["./src/middleware/roleGuard", "roleGuard.js"],
  ["./src/middleware/errorHandler", "errorHandler.js"],
  ["./src/services/userService", "userService.js"],
  ["./src/services/showroomService", "showroomService.js"],
  ["./src/services/vehicleService", "vehicleService.js"],
  ["./src/services/accessoryService", "accessoryService.js"],
  ["./src/services/inquiryService", "inquiryService.js"],
  ["./src/services/bookingService", "bookingService.js"],
  ["./src/services/priceCalculationService", "priceCalculationService.js"],
  ["./src/validators/userValidator", "userValidator.js"],
  ["./src/validators/showroomValidator", "showroomValidator.js"],
  ["./src/validators/vehicleValidator", "vehicleValidator.js"],
  ["./src/validators/accessoryValidator", "accessoryValidator.js"],
  ["./src/validators/inquiryValidator", "inquiryValidator.js"],
  ["./src/validators/bookingValidator", "bookingValidator.js"],
  ["./src/utils/helpers", "helpers.js"],
  ["./src/routes/auth", "auth routes"],
  ["./src/routes/users", "users routes"],
  ["./src/routes/showrooms", "showrooms routes"],
  ["./src/routes/vehicles", "vehicles routes"],
  ["./src/routes/accessories", "accessories routes"],
  ["./src/routes/uploads", "uploads routes"],
  ["./src/routes/inquiries", "inquiries routes"],
  ["./src/routes/bookings", "bookings routes"],
];

let allPassed = true;

for (const [mod, name] of checks) {
  try {
    require(mod);
    console.log(`✅ ${name}`);
  } catch (e) {
    console.error(`❌ ${name}: ${e.message}`);
    allPassed = false;
  }
}

console.log(allPassed ? "\n🎉 All checks passed!" : "\n⚠️ Some checks failed");
process.exit(allPassed ? 0 : 1);
