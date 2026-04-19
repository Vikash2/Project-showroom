// Debug script to test authentication flow
// Run this in the browser console

console.log('🔍 Starting auth flow debug...');

async function debugAuthFlow() {
  try {
    // Import supabase
    const { supabase } = await import('./src/config/supabase.js');
    
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }
    
    console.log('📋 Session info:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      userEmail: session?.user?.email,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null,
      tokenPreview: session?.access_token ? session.access_token.substring(0, 20) + '...' : null
    });
    
    if (!session?.access_token) {
      console.error('❌ No access token available');
      return;
    }
    
    console.log('2. Testing manual API call...');
    
    try {
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📋 Manual API response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      const data = await response.json();
      console.log('📋 Response data:', data);
      
      if (response.ok) {
        console.log('✅ Manual API call successful');
      } else {
        console.error('❌ Manual API call failed:', data);
      }
      
    } catch (apiError) {
      console.error('❌ Manual API call error:', apiError);
    }
    
    console.log('3. Testing axios API call...');
    
    try {
      // Import api
      const api = (await import('./src/services/api.js')).default;
      
      const axiosResponse = await api.get('/api/bookings');
      console.log('✅ Axios API call successful:', axiosResponse.data);
      
    } catch (axiosError) {
      console.error('❌ Axios API call failed:', axiosError);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Export for manual execution
window.debugAuthFlow = debugAuthFlow;

console.log('🔍 Debug script loaded. Run window.debugAuthFlow() to start diagnostics');