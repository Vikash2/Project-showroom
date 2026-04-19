// Debug script to test booking API connectivity
// Run this in the browser console to diagnose the issue

console.log('🔍 Starting booking API debug...');

// Check if we're authenticated
async function checkAuth() {
  try {
    const { supabase } = await import('./src/config/supabase.js');
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('🔐 Auth Status:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      user: session?.user?.email,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null
    });
    
    return session;
  } catch (error) {
    console.error('🔐 Auth check failed:', error);
    return null;
  }
}

// Test API connectivity
async function testAPI() {
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    console.log('🏥 Backend Health:', data);
    return true;
  } catch (error) {
    console.error('🏥 Backend unreachable:', error);
    return false;
  }
}

// Test bookings endpoint with auth
async function testBookingsAPI() {
  try {
    const session = await checkAuth();
    
    if (!session?.access_token) {
      console.error('❌ No access token available');
      return;
    }
    
    const response = await fetch('http://localhost:3001/api/bookings', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('📋 Bookings API Response:', {
      status: response.status,
      ok: response.ok,
      data: data
    });
    
    if (!response.ok) {
      console.error('❌ Bookings API failed:', data);
    } else {
      console.log('✅ Bookings API success:', data.bookings?.length || 0, 'bookings');
    }
    
  } catch (error) {
    console.error('📋 Bookings API error:', error);
  }
}

// Run all tests
async function runDiagnostics() {
  console.log('🔍 Running diagnostics...');
  
  await checkAuth();
  await testAPI();
  await testBookingsAPI();
  
  console.log('🔍 Diagnostics complete');
}

// Export for manual execution
window.debugBookings = runDiagnostics;

console.log('🔍 Debug script loaded. Run window.debugBookings() to start diagnostics');