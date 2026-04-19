require("dotenv").config();
const { supabase } = require("../src/config/supabase");

async function createTestUser() {
  const email = "test@vehiclezo.com";
  const password = "Test@123";
  const name = "Test Admin";
  const mobile = "1234567890";
  const role = "Super Admin";

  console.log("🔄 Creating test user for login...\n");

  try {
    // Step 1: Create auth user
    console.log("1. Creating Supabase Auth user...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name,
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log("⚠️  User already exists in Auth. Updating password...");
        
        // Get user by email
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === email);
        
        if (existingUser) {
          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password }
          );
          
          if (updateError) {
            console.error("❌ Failed to update password:", updateError.message);
            process.exit(1);
          }
          
          console.log("✅ Password updated successfully");
          
          // Check if user exists in users table
          const { data: dbUser } = await supabase
            .from("users")
            .select("*")
            .eq("id", existingUser.id)
            .single();
          
          if (dbUser) {
            console.log("✅ User already exists in database");
            console.log("\n🎉 Test user ready!");
            console.log("=" .repeat(50));
            console.log(`Email:    ${email}`);
            console.log(`Password: ${password}`);
            console.log(`Role:     ${dbUser.role}`);
            console.log("=".repeat(50));
            process.exit(0);
          }
          
          // Create database record
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              id: existingUser.id,
              email: email,
              name: name,
              mobile: mobile,
              role: role,
              is_active: true,
            });
          
          if (insertError) {
            console.error("❌ Failed to create database record:", insertError.message);
            process.exit(1);
          }
          
          console.log("✅ Database record created");
        }
      } else {
        console.error("❌ Auth user creation failed:", authError.message);
        process.exit(1);
      }
    } else {
      console.log("✅ Auth user created");
      console.log(`   User ID: ${authData.user.id}`);

      // Step 2: Create database record
      console.log("\n2. Creating database record...");
      const { error: dbError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: email,
          name: name,
          mobile: mobile,
          role: role,
          is_active: true,
        });

      if (dbError) {
        if (dbError.message.includes("duplicate key")) {
          console.log("⚠️  Database record already exists, updating...");
          const { error: updateError } = await supabase
            .from("users")
            .update({
              email: email,
              name: name,
              mobile: mobile,
              role: role,
              is_active: true,
            })
            .eq("id", authData.user.id);
          
          if (updateError) {
            console.error("❌ Database update failed:", updateError.message);
            process.exit(1);
          }
          console.log("✅ Database record updated");
        } else {
          console.error("❌ Database record creation failed:", dbError.message);
          console.log("   Cleaning up auth user...");
          await supabase.auth.admin.deleteUser(authData.user.id);
          process.exit(1);
        }
      } else {
        console.log("✅ Database record created");
      }
    }

    console.log("\n🎉 Test user created successfully!");
    console.log("=".repeat(50));
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     ${role}`);
    console.log("=".repeat(50));
    console.log("\n📝 You can now login at: http://localhost:5173/login");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

createTestUser();
