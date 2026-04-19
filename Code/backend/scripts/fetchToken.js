require("dotenv").config();
const axios = require("axios");

/**
 * Script to fetch a Firebase ID token for testing
 * Usage: node scripts/fetchToken.js [email] [password]
 */
async function fetchToken() {
  const isRaw = process.argv.includes("--raw");
  const args = process.argv.filter(arg => !arg.startsWith("-") && !arg.includes("node") && !arg.includes("scripts/fetchToken.js"));
  
  const email = args[0] || process.env.SUPER_ADMIN_EMAIL || "admin@sandhyahonda.com";
  const password = args[1] || process.env.SUPER_ADMIN_PASSWORD || "Admin@123";
  const apiKey = process.env.FIREBASE_API_KEY;

  if (!apiKey) {
    if (!isRaw) console.error("❌ Error: FIREBASE_API_KEY is not defined in .env");
    process.exit(1);
  }

  try {
    if (!isRaw) console.log(`🔄 Fetching token for: ${email}...`);

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken } = response.data;

    if (isRaw) {
      process.stdout.write(idToken);
    } else {
      console.log("\n" + "=".repeat(50));
      console.log("✅ Token fetched successfully!");
      console.log("=".repeat(50));
      console.log("\nBearer " + idToken + "\n");
      console.log("=".repeat(50));
      console.log("\nYou can copy the token above for your Authorization header.");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error fetching token:");
    if (error.response && error.response.data && error.response.data.error) {
      const { message, code } = error.response.data.error;
      console.error(`Message: ${message}`);
      
      if (message === "EMAIL_NOT_FOUND") {
        console.error("👉 Tip: Run 'npm run create-admin' to create the default admin user first.");
      } else if (message === "INVALID_PASSWORD") {
        console.error("👉 Tip: Check your password in the .env file.");
      } else if (message === "INVALID_KEY") {
        console.error("👉 Tip: Check your FIREBASE_API_KEY in the .env file.");
      }
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

fetchToken();
