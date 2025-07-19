/**
 * Login Helper Functions
 * Utility functions for login validation and authentication
 */

/**
 * Validates email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && emailRegex.test(email);
  };
  
  /**
   * Validates if the selected role matches available roles
   * @param {string} role - Role to validate
   * @returns {boolean} - True if valid role
   */
  export const isValidRole = (role) => {
    const validRoles = ['client', 'qa-qc-vendor', 'preprocessing-vendor', 'admin'];
    return validRoles.includes(role);
  };
  
  /**
   * Checks if user account status allows login
   * @param {string} status - User account status
   * @returns {object} - Object with isValid boolean and message string
   */
  export const validateAccountStatus = (status) => {
    switch (status) {
      case 'approved':
        return { isValid: true, message: 'Account approved' };
      case 'pending':
        return { 
          isValid: false, 
          message: 'Your account is pending approval. Please contact administrator' 
        };
      case 'rejected':
        return { 
          isValid: false, 
          message: 'Your account has been rejected. Please contact administrator' 
        };
      default:
        return { 
          isValid: false, 
          message: 'Your account is pending approval. Please contact administrator' 
        };
    }
  };
  
  /**
   * Validates role match between frontend selection and database
   * @param {string} selectedRole - Role selected in frontend
   * @param {string} userRole - Role stored in database
   * @returns {boolean} - True if roles match
   */
  export const validateRoleMatch = (selectedRole, userRole) => {
    return selectedRole === userRole;
  };
  
  /**
   * Comprehensive login validation
   * @param {object} loginData - Object containing email, password, selectedRole
   * @param {object} user - User object from database
   * @returns {object} - Validation result with success boolean and message
   */
  export const validateLoginCredentials = async (loginData, user) => {
    const { email, password, selectedRole } = loginData;
  
    // Step 1: Email validation
    if (!isValidEmail(email)) {
      return { success: false, message: 'Invalid email address', statusCode: 400 };
    }
  
    // Step 2: User existence check
    if (!user) {
      return { success: false, message: 'Invalid email address', statusCode: 400 };
    }
  
    // Step 3: Password validation
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password', statusCode: 401 };
    }
  
    // Step 4: Role validation
    if (!selectedRole) {
      return { success: false, message: 'Role selection is required', statusCode: 400 };
    }
  
    if (!isValidRole(selectedRole)) {
      return { success: false, message: 'Invalid role selected', statusCode: 400 };
    }
  
    if (!validateRoleMatch(selectedRole, user.role)) {
      return { 
        success: false, 
        message: 'Role mismatch. Please select the correct role for your account', 
        statusCode: 400 
      };
    }
  
    // Step 5: Account status validation
    const statusValidation = validateAccountStatus(user.status);
    if (!statusValidation.isValid) {
      return { 
        success: false, 
        message: statusValidation.message, 
        statusCode: 401 
      };
    }
  
    return { success: true, message: 'All validations passed' };
  };