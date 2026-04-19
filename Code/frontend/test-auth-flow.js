// Simple test to verify authentication flow
// Run this in browser console at http://localhost:5174/login

const testAuthFlow = async () => {
  console.log('🧪 Testing Authentication Flow...');
  
  // Test credentials
  const email = 'test@vehiclezo.com';
  const password = 'Test@123';
  
  try {
    // Fill in the form
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (!emailInput || !passwordInput || !submitButton) {
      console.error('❌ Could not find form elements');
      return;
    }
    
    console.log('📝 Filling form...');
    emailInput.value = email;
    passwordInput.value = password;
    
    // Trigger change events
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('🚀 Submitting form...');
    submitButton.click();
    
    console.log('⏳ Watch the console for authentication flow logs...');
    console.log('✅ Expected: Login → Auth State Change → Redirect to /admin');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Export for manual testing
window.testAuthFlow = testAuthFlow;

console.log('🧪 Auth flow test loaded. Run testAuthFlow() to test.');