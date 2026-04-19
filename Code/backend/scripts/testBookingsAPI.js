require("dotenv").config();
const { supabase } = require("../src/config/supabase");
const axios = require("axios");

async function testBookingsAPI() {
  console.log("🔄 Testing bookings API...\n");

  try {
    // Step 1: Login to get token
    console.log("1. Logging in to get auth token...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "test@vehiclezo.com",
      password: "Test@123",
    });

    if (authError) {
      console.error("❌ Login failed:", authError.message);
      process.exit(1);
    }

    console.log("✅ Login successful");
    const token = authData.session.access_token;
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Step 2: Test bookings API
    console.log("\n2. Testing bookings API...");
    
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log("✅ Bookings API successful");
      console.log(`   Status: ${response.status}`);
      console.log(`   Bookings count: ${response.data.bookings?.length || 0}`);
      
      if (response.data.bookings && response.data.bookings.length > 0) {
        console.log("   Sample booking:", {
          id: response.data.bookings[0].id,
          customerName: response.data.bookings[0].customerName,
          status: response.data.bookings[0].status
        });
      }

    } catch (apiError) {
      console.error("❌ Bookings API failed:");
      
      if (apiError.response) {
        console.error(`   Status: ${apiError.response.status}`);
        console.error(`   Error: ${JSON.stringify(apiError.response.data, null, 2)}`);
      } else if (apiError.request) {
        console.error("   No response received - server may be down");
        console.error(`   Request timeout or connection refused`);
      } else {
        console.error(`   Request setup error: ${apiError.message}`);
      }
      
      process.exit(1);
    }

    // Step 3: Test health endpoint
    console.log("\n3. Testing health endpoint...");
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      console.log("✅ Health endpoint successful");
      console.log(`   Status: ${healthResponse.data.status}`);
      console.log(`   Phase: ${healthResponse.data.phase}`);
    } catch (healthError) {
      console.error("❌ Health endpoint failed:", healthError.message);
    }

    console.log("\n🎉 All tests completed successfully!");

  } catch (error) {
    console.error("\n❌ Unexpected error:", error.message);
    process.exit(1);
  }
}

testBookingsAPI();