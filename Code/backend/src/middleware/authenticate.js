const { supabase } = require("../config/supabase");

/**
 * Authentication middleware - verifies Supabase JWT token
 * Attaches decoded user info to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        error: "No token provided",
        code: "AUTH_TOKEN_MISSING" 
      });
    }

    const token = authHeader.split("Bearer ")[1];

    try {
      // Verify the Supabase JWT token
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error("Token verification failed:", authError?.message);
        return res.status(401).json({ 
          error: "Invalid or expired token",
          code: "AUTH_TOKEN_INVALID" 
        });
      }

      // Get user profile from database to get role and showroom info
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, name, email, mobile, role, showroom_id")
        .eq("id", user.id)
        .single();

      if (dbError || !userData) {
        console.error("User profile not found:", dbError?.message);
        return res.status(401).json({ 
          error: "User profile not found",
          code: "USER_NOT_FOUND" 
        });
      }

      // Attach user info to request (using uid for backward compatibility)
      req.user = {
        uid: userData.id,
        id: userData.id,
        email: userData.email,
        name: userData.name,
        mobile: userData.mobile,
        role: userData.role || "Sales Executive",
        showroomId: userData.showroom_id || null,
      };

      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ 
        error: "Invalid or expired token",
        code: "AUTH_TOKEN_INVALID" 
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ 
      error: "Authentication failed",
      code: "AUTH_ERROR" 
    });
  }
}

module.exports = authenticate;
