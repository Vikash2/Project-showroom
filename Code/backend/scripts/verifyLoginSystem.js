require("dotenv").config();
const { supabase } = require("../src/config/supabase");
const axios = require("axios");

async function verifyLoginSystem() {
  console.log("🔍 Verifying Complete Login System\n");
  console.log("=".repeat(60));
  
  let allPassed = true;

  // Test 1: Supabase Connection
  console.log("\n✓ Test 1: Supabase Connection");
  try {
    const { data, error } = await supabase.from("users").select("count").single();
    if (error) throw error;
    console.log("  ✅ Connected to Supabase");
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
    allPassed = false;
  }

  // Test 2: Backend Server
  console.log("\n✓ Test 2: Backend Server");
  try {
    const response = await axios.get("http://localhost:3001/api/auth/me");
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("  ✅ Backend responding (401 expected without token)");
    } else {
      console.log("  ❌ Backend not responding:", error.message);
      allPassed = false;
    }
  }

  // Test 3: Test User Exists
  console.log("\n✓ Test 3: Test User Exists");
  try {
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUser = users.users.find(u => u.email === "test@vehiclezo.com");
    
    if (testUser) {
      console.log("  ✅ Test user found in Auth");
      
      // Check database
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", "test@vehiclezo.com")
        .single();
      
      if (dbUser) {
        console.log("  ✅ Test user found in database");
        console.log(`     Name: ${dbUser.name}`);
        console.log(`     Role: ${dbUser.role}`);
      } else {
        console.log("  ❌ Test user not in database");
        allPassed = false;
      }
    } else {
      console.log("  ❌ Test user not found");
      allPassed = false;
    }
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
    allPassed = false;
  }

  // Test 4: Complete Login Flow
  console.log("\n✓ Test 4: Complete Login Flow");
  try {
    // Step 1: Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "test@vehiclezo.com",
      password: "Test@123",
    });

    if (authError) throw authError;
    console.log("  ✅ Supabase authentication successful");

    // Step 2: Backend API
    const response = await axios.get("http://localhost:3001/api/auth/me", {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
      },
    });

    console.log("  ✅ Backend API authentication successful");
    console.log(`     User: ${response.data.user.name}`);
    console.log(`     Role: ${response.data.user.role}`);

    // Cleanup
    await supabase.auth.signOut();
  } catch (error) {
    console.log("  ❌ Failed:", error.response?.data?.error || error.message);
    allPassed = false;
  }

  // Test 5: Frontend Server
  console.log("\n✓ Test 5: Frontend Server");
  try {
    const response = await axios.get("http://localhost:5173", {
      timeout: 3000,
    });
    
    if (response.status === 200) {
      console.log("  ✅ Frontend server responding");
    }
  } catch (error) {
    console.log("  ❌ Frontend not responding:", error.message);
    console.log("     Run: cd Code/frontend && npm run dev");
    allPassed = false;
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  if (allPassed) {
    console.log("\n🎉 ALL TESTS PASSED! Login system is fully functional.\n");
    console.log("📝 Login Credentials:");
    console.log("   Email:    test@vehiclezo.com");
    console.log("   Password: Test@123");
    console.log("\n🌐 Open: http://localhost:5173/login");
    console.log("\n" + "=".repeat(60));
  } else {
    console.log("\n⚠️  SOME TESTS FAILED. Please check the errors above.\n");
    console.log("Common fixes:");
    console.log("  - Ensure backend is running: cd Code/backend && npm start");
    console.log("  - Ensure frontend is running: cd Code/frontend && npm run dev");
    console.log("  - Create test user: node scripts/createTestUser.js");
    console.log("\n" + "=".repeat(60));
  }

  process.exit(allPassed ? 0 : 1);
}

verifyLoginSystem();
