require("dotenv").config();
const { supabase } = require("../src/config/supabase");
const axios = require("axios");

async function testLoginFlow() {
  const testEmail = "test@vehiclezo.com";
  const testPassword = "Test@123";
  
  console.log("🔐 Testing complete login flow...\n");
  console.log(`Testing with: ${testEmail}\n`);

  try {
    // Step 1: Test Supabase Auth login
    console.log("1. Testing Supabase Auth login...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error("❌ Supabase Auth failed:", authError.message);
      console.log("\n💡 Possible issues:");
      console.log("   - Wrong password");
      console.log("   - User not created in Supabase Auth");
      console.log("   - Email not confirmed (if required)");
      process.exit(1);
    }

    console.log("✅ Supabase Auth successful");
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Token: ${authData.session.access_token.substring(0, 20)}...`);

    // Step 2: Test backend /api/auth/me endpoint
    console.log("\n2. Testing backend /api/auth/me endpoint...");
    
    try {
      const response = await axios.get("http://localhost:3001/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });

      console.log("✅ Backend endpoint successful");
      console.log(`   User: ${response.data.user.name}`);
      console.log(`   Role: ${response.data.user.role}`);
      console.log(`   Email: ${response.data.user.email}`);

      console.log("\n🎉 Login flow is working correctly!");
      console.log("\n📝 You can login with:");
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      
    } catch (backendError) {
      console.error("❌ Backend endpoint failed:", backendError.response?.data || backendError.message);
      console.log("\n💡 Possible issues:");
      console.log("   - Backend server not running");
      console.log("   - User not in users table");
      console.log("   - Token validation issue");
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }

  // Cleanup
  await supabase.auth.signOut();
  process.exit(0);
}

testLoginFlow();
