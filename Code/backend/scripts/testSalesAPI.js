require('dotenv').config();
const { supabase } = require('../src/config/supabase');

async function testSalesAPI() {
  console.log('🔍 Testing Sales API...');
  
  try {
    // Test 1: List all sales
    console.log('\n1. Testing list sales...');
    const { data: sales, error: listError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (listError) {
      console.error('❌ List sales error:', listError);
    } else {
      console.log('✅ List sales success:', sales.length, 'sales found');
      if (sales.length > 0) {
        console.log('   First sale:', {
          id: sales[0].id,
          status: sales[0].status,
          customer_name: sales[0].customer_name,
          created_at: sales[0].created_at
        });
      }
    }
    
    // Test 2: Check sales table structure
    console.log('\n2. Testing sales table structure...');
    if (sales && sales.length > 0) {
      const sampleSale = sales[0];
      console.log('   Sample sale columns:', Object.keys(sampleSale));
      console.log('   Sample sale data:', {
        id: sampleSale.id,
        booking_id: sampleSale.booking_id,
        customer_name: sampleSale.customer_name,
        mobile: sampleSale.mobile,
        status: sampleSale.status,
        payment_status: sampleSale.payment_status,
        final_price: sampleSale.final_price,
        other_charges: sampleSale.other_charges
      });
    }
    
    // Test 3: Check if there are any sales with specific statuses
    console.log('\n3. Testing sales by status...');
    const statuses = ['Draft', 'Sales Finalized', 'Payment Complete', 'Delivered'];
    
    for (const status of statuses) {
      const { data: statusSales, error: statusError } = await supabase
        .from('sales')
        .select('id, status, customer_name')
        .eq('status', status);
      
      if (statusError) {
        console.error(`❌ Error checking status ${status}:`, statusError);
      } else {
        console.log(`✅ Status "${status}": ${statusSales.length} sales`);
      }
    }
    
    // Test 4: Check bookings with sales
    console.log('\n4. Testing bookings with sales...');
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        status,
        customer_name,
        sales (*)
      `)
      .in('status', ['Confirmed', 'Sales Finalized', 'Payment Complete', 'Delivered'])
      .order('created_at', { ascending: false });
    
    if (bookingError) {
      console.error('❌ Bookings with sales error:', bookingError);
    } else {
      console.log('✅ Bookings with sales:', bookings.length, 'bookings found');
      const bookingsWithSales = bookings.filter(b => b.sales && b.sales.length > 0);
      console.log('   Bookings that have sales:', bookingsWithSales.length);
      
      if (bookingsWithSales.length > 0) {
        console.log('   Sample booking with sale:', {
          booking_id: bookingsWithSales[0].id,
          booking_status: bookingsWithSales[0].status,
          sale_id: bookingsWithSales[0].sales[0]?.id,
          sale_status: bookingsWithSales[0].sales[0]?.status
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSalesAPI().then(() => {
  console.log('\n🏁 Sales API test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});