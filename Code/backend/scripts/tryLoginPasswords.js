require("dotenv").config();
const { supabase } = require("../src/config/supabase");

async function tryPasswords() {
  const testEmail = "admin@vehiclezo.com";
  const passwords = [
    "admin123",
    "Admin@123",
    "password",
    "Password123",
    "vehiclezo123",
    "Vehiclezo@123",
    "admin",
    "Admin123",
  ];

  console.log(`🔐 Trying common passwords for: ${testEmail}\n`);

  for (const password of passwords) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: password,
      });

      if (!error && data.session) {
        console.log(`✅ SUCCESS! Password is: "${password}"`);
        await supabase.auth.signOut();
        process.exit(0);
      }
    } catch (e) {
      // Continue trying
    }
    console.log(`❌ Not: "${password}"`);
  }

  console.log("\n⚠️  None of the common passwords worked.");
  console.log("💡 You may need to reset the password in Supabase dashboard or create a new user.");
  process.exit(1);
}

tryPasswords();
