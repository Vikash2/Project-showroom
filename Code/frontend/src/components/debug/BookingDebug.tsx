import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import * as bookingService from '../../services/bookingService';

export default function BookingDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const info: any = {};

    try {
      // Check auth session
      console.log('🔍 Checking auth session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      info.hasSession = !!session;
      info.hasToken = !!session?.access_token;
      info.userEmail = session?.user?.email;
      info.tokenExpiry = session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null;
      info.sessionError = sessionError?.message;

      // Test API connectivity
      console.log('🔍 Testing API connectivity...');
      try {
        const response = await fetch('http://localhost:3001/health');
        const healthData = await response.json();
        info.apiHealth = {
          status: response.status,
          data: healthData
        };
      } catch (err: any) {
        info.apiHealth = {
          error: err.message
        };
      }

      // Test manual API call with token
      if (session?.access_token) {
        console.log('🔍 Testing manual bookings API call...');
        try {
          const response = await fetch('http://localhost:3001/api/bookings', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          info.manualAPI = {
            status: response.status,
            ok: response.ok,
            data: data,
            count: data.bookings?.length || 0
          };
        } catch (err: any) {
          info.manualAPI = {
            error: err.message
          };
        }
      }

      // Test bookings API through service
      console.log('🔍 Testing bookings API through service...');
      try {
        const result = await bookingService.listBookings();
        info.bookingsAPI = {
          success: result.success,
          count: result.bookings?.length || 0,
          error: result.error
        };
      } catch (err: any) {
        info.bookingsAPI = {
          error: err.message
        };
      }

      setDebugInfo(info);
    } catch (err: any) {
      console.error('Debug error:', err);
      info.error = err.message;
      setDebugInfo(info);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">Booking Debug</h3>
        <button 
          onClick={runDiagnostics}
          disabled={isRunning}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Auth:</strong> {debugInfo.hasSession ? '✅' : '❌'} 
          {debugInfo.hasToken && ' (Token: ✅)'}
          {debugInfo.sessionError && ` (Error: ${debugInfo.sessionError})`}
        </div>
        
        <div>
          <strong>User:</strong> {debugInfo.userEmail || 'None'}
        </div>
        
        <div>
          <strong>Token Expiry:</strong> {debugInfo.tokenExpiry || 'N/A'}
        </div>
        
        <div>
          <strong>API Health:</strong> {
            debugInfo.apiHealth?.status === 200 ? '✅' : 
            debugInfo.apiHealth?.error ? `❌ ${debugInfo.apiHealth.error}` : '⏳'
          }
        </div>
        
        <div>
          <strong>Manual API:</strong> {
            debugInfo.manualAPI?.ok ? `✅ (${debugInfo.manualAPI.count} bookings)` :
            debugInfo.manualAPI?.status ? `❌ ${debugInfo.manualAPI.status}` :
            debugInfo.manualAPI?.error ? `❌ ${debugInfo.manualAPI.error}` : '⏳'
          }
        </div>
        
        <div>
          <strong>Service API:</strong> {
            debugInfo.bookingsAPI?.success ? `✅ (${debugInfo.bookingsAPI.count} bookings)` :
            debugInfo.bookingsAPI?.error ? `❌ ${debugInfo.bookingsAPI.error}` : '⏳'
          }
        </div>
        
        {debugInfo.error && (
          <div className="text-red-600">
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}
        
        {debugInfo.manualAPI?.data && (
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-600">Raw API Response</summary>
            <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.manualAPI.data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}