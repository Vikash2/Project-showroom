/**
 * Verify Booking to Sales Flow
 * 
 * This script verifies that:
 * 1. Sales records are created for all bookings
 * 2. Bookings with "Confirmed" status appear in sales processing
 * 3. Field mappings are correct
 */

const { supabase } = require('../src/config/supabase');

async function verifyBookingToSalesFlow() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     Booking to Sales Flow Verification Script         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Get all bookings
    console.log('Step 1: Fetching all bookings...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, customer_name, status, created_at')
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError.message);
      return false;
    }

    console.log(`✅ Found ${bookings.length} bookings\n`);

    if (bookings.length === 0) {
      console.log('⚠️  No bookings found in database');
      console.log('   Create a test booking to verify the flow\n');
      return true;
    }

    // Step 2: Check sales records for each booking
    console.log('Step 2: Checking sales records...\n');
    
    let bookingsWithSales = 0;
    let bookingsWithoutSales = [];
    let confirmedBookings = 0;

    for (const booking of bookings) {
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('id, status, booking_id')
        .eq('booking_id', booking.id)
        .single();

      if (saleError && saleError.code !== 'PGRST116') {
        console.error(`❌ Error checking sale for booking ${booking.id}:`, saleError.message);
        continue;
      }

      if (sale) {
        bookingsWithSales++;
        console.log(`✅ Booking ${booking.id.substring(0, 8)}... → Sale ${sale.id.substring(0, 8)}... (${sale.status})`);
      } else {
        bookingsWithoutSales.push(booking);
        console.log(`❌ Booking ${booking.id.substring(0, 8)}... → NO SALES RECORD`);
      }

      if (booking.status === 'Confirmed' || 
          booking.status === 'Sales Finalized' || 
          booking.status === 'Payment Complete' || 
          booking.status === 'Delivered') {
        confirmedBookings++;
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`Total Bookings: ${bookings.length}`);
    console.log(`Bookings with Sales Records: ${bookingsWithSales}`);
    console.log(`Bookings without Sales Records: ${bookingsWithoutSales.length}`);
    console.log(`Bookings visible in Sales Processing: ${confirmedBookings}`);
    console.log('─'.repeat(60) + '\n');

    // Step 3: Create missing sales records
    if (bookingsWithoutSales.length > 0) {
      console.log('Step 3: Creating missing sales records...\n');
      
      for (const booking of bookingsWithoutSales) {
        console.log(`Creating sales record for booking ${booking.id.substring(0, 8)}...`);
        
        // Get full booking details
        const { data: fullBooking, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', booking.id)
          .single();

        if (fetchError) {
          console.error(`  ❌ Error fetching booking details:`, fetchError.message);
          continue;
        }

        // Create sales record
        const { error: insertError } = await supabase
          .from('sales')
          .insert({
            booking_id: fullBooking.id,
            customer_name: fullBooking.customer_name,
            email: fullBooking.email,
            mobile: fullBooking.mobile,
            vehicle_id: fullBooking.vehicle_id,
            variant_id: fullBooking.variant_id,
            color_id: fullBooking.color_id,
            showroom_id: fullBooking.showroom_id,
            final_price: 0,
            status: 'Processing',
            sales_executive_id: fullBooking.sales_executive_id,
            base_pricing: {},
          });

        if (insertError) {
          console.error(`  ❌ Error creating sales record:`, insertError.message);
        } else {
          console.log(`  ✅ Sales record created successfully`);
        }
      }
      console.log();
    }

    // Step 4: Verify field mappings
    console.log('Step 4: Verifying field mappings...\n');
    
    const { data: sampleSale, error: sampleError } = await supabase
      .from('sales')
      .select('*')
      .limit(1)
      .single();

    if (sampleError && sampleError.code !== 'PGRST116') {
      console.error('❌ Error fetching sample sale:', sampleError.message);
      return false;
    }

    if (sampleSale) {
      const requiredFields = [
        'booking_id',
        'customer_name',
        'mobile',
        'vehicle_id',
        'variant_id',
        'color_id',
        'showroom_id',
        'status'
      ];

      let allFieldsPresent = true;
      for (const field of requiredFields) {
        if (field in sampleSale) {
          console.log(`✅ Field '${field}' exists`);
        } else {
          console.log(`❌ Field '${field}' missing`);
          allFieldsPresent = false;
        }
      }

      if (!allFieldsPresent) {
        console.log('\n⚠️  Some required fields are missing in sales table');
        return false;
      }
    }

    // Step 5: Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    VERIFICATION SUMMARY                ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    if (bookingsWithoutSales.length === 0) {
      console.log('✅ All bookings have corresponding sales records');
    } else {
      console.log(`⚠️  ${bookingsWithoutSales.length} bookings were missing sales records (now created)`);
    }

    if (confirmedBookings > 0) {
      console.log(`✅ ${confirmedBookings} bookings are visible in Sales Processing screen`);
    } else {
      console.log('⚠️  No bookings with "Confirmed" status found');
      console.log('   Update booking status to "Confirmed" to see them in Sales Processing');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Create a new booking via the UI or API');
    console.log('2. Verify sales record is automatically created');
    console.log('3. Update booking status to "Confirmed"');
    console.log('4. Check Sales Processing screen to see the booking');
    console.log('5. Complete the sales journey (documents → sales form → payment → delivery)\n');

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run verification
verifyBookingToSalesFlow()
  .then(success => {
    if (success) {
      console.log('🎉 Verification complete!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Verification completed with issues\n');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
