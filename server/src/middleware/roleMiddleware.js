/**
 * Role-Based Access Control (RBAC) middleware
 * Allowed roles: 'owner', 'manager', 'staff'
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`
      });
    }

    next();
  };
}

/**
 * Branch access guard:
 * - 'owner' has universal access to all branches.
 * - 'manager' and 'staff' can only access resources belonging to their assigned branch.
 */
function requireBranchAccess(branchIdParamName = 'branchId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Owner has unrestricted global access across all branches
    if (req.user.role === 'owner') {
      return next();
    }

    const requestedBranchId = parseInt(
      req.params[branchIdParamName] || req.body[branchIdParamName] || req.query[branchIdParamName],
      10
    );

    if (requestedBranchId && req.user.branchId && requestedBranchId !== req.user.branchId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view or manage another branch.'
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireBranchAccess
};
