/**
 * Role-based access control middleware factory
 * Usage: roleGuard("Super Admin", "Showroom Manager")
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (!role) {
      return res.status(403).json({ 
        error: "No role assigned to user",
        code: "ROLE_MISSING" 
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
        code: "ACCESS_DENIED",
        requiredRoles: allowedRoles,
        userRole: role
      });
    }

    next();
  };
};

module.exports = roleGuard;
