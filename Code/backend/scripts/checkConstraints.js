require('dotenv').config();
const { supabase } = require('../src/config/supabase');

async function checkConstraints() {
  try {
    console.log('🔍 Checking existing sales records for valid status values...');
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('status')
      .limit(100);

    if (!salesError && sales) {
      const uniqueValues = [...new Set(sales.map(s => s.status))];
      console.log('Existing status values in database:', uniqueValues);
    }

    console.log('\n🔍 Testing allowed values for status...\n');

    const testValues = [
      'Processing', 
      'Pending Approval', 
      'Sales Finalized',
      'Ready for Payment',
      'Payment Complete',
      'Delivered',
      'Cancelled'
    ];

    for (const value of testValues) {
      const { error } = await supabase
        .from('sales')
        .insert({
          booking_id: '00000000-0000-0000-0000-000000000000',
          customer_name: 'Test',
          email: 'test@test.com',
          mobile: '1234567890',
          vehicle_id: '00000000-0000-0000-0000-000000000000',
          variant_id: '00000000-0000-0000-0000-000000000000',
          color_id: '00000000-0000-0000-0000-000000000000',
          showroom_id: '00000000-0000-0000-0000-000000000000',
          final_price: 100000,
          special_discount_status: 'None',
          payment_status: 'Pending',
          status: value,
        })
        .select();

      if (error) {
        if (error.code === '23514') {
          console.log(`❌ "${value}" - NOT ALLOWED (constraint violation)`);
        } else if (error.code === '23503') {
          console.log(`✅ "${value}" - ALLOWED (failed on foreign key, not constraint)`);
        } else {
          console.log(`⚠️  "${value}" - ${error.code}: ${error.message.substring(0, 80)}`);
        }
      } else {
        console.log(`✅ "${value}" - ALLOWED`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkConstraints().then(() => process.exit(0));
