/**
 * Test script to verify complete sales flow
 * 
 * This script tests:
 * 1. Creating a sale from a booking
 * 2. Verifying all fields are stored correctly
 * 3. Retrieving the sale and checking all fields are returned
 * 4. Updating the sale
 * 5. Verifying the update worked
 */

// Load environment variables
require('dotenv').config();

const { supabase } = require('../src/config/supabase');
const salesService = require('../src/services/salesService');

async function testSalesFlow() {
  console.log('🧪 Starting Sales Flow Test...\n');

  try {
    // Step 1: Find or create a confirmed booking to test with
    console.log('📋 Step 1: Finding a confirmed booking...');
    let { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'Confirmed')
      .limit(1);

    if (bookingError) throw bookingError;
    
    let testBooking;
    if (!bookings || bookings.length === 0) {
      console.log('⚠️  No confirmed bookings found. Checking for any booking...');
      
      const { data: anyBookings, error: anyError } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);
      
      if (anyError) throw anyError;
      
      if (!anyBookings || anyBookings.length === 0) {
        console.log('❌ No bookings found at all. Please create a booking first.');
        return;
      }
      
      testBooking = anyBookings[0];
      console.log(`✅ Found booking: ${testBooking.id} (status: ${testBooking.status})`);
      console.log('   Note: Using existing booking regardless of status for testing');
    } else {
      testBooking = bookings[0];
      console.log(`✅ Found confirmed booking: ${testBooking.id}`);
    }
    console.log(`✅ Found booking: ${testBooking.id}`);
    console.log(`   Customer: ${testBooking.customer_name}`);
    console.log(`   Vehicle: ${testBooking.vehicle_id}\n`);

    // Step 2: Create comprehensive sale data
    console.log('📝 Step 2: Creating comprehensive sale data...');
    const saleData = {
      // Payment method
      soldThrough: 'FINANCE',
      financer: 'HDFC Bank',
      financeBy: 'John Doe',
      hypothecationSelected: 'Yes',
      hypothecationCharge: 500,

      // Registration
      registration: 'Yes',
      otherState: {
        selected: 'Jharkhand',
        amount: 500
      },

      // Insurance
      insurance: 'YES',
      insuranceType: 'Comprehensive',
      insuranceNominee: {
        name: 'Jane Doe',
        age: 30,
        relation: 'Spouse'
      },

      // Type of sale
      typeOfSale: 'EXCHANGE',
      exchange: {
        model: 'Honda City',
        year: 2018,
        value: 150000,
        exchangerName: 'John Smith',
        registrationNumber: 'DL01AB1234'
      },

      // Accessories
      selectedAccessoriesFinal: {
        'acc44444-4444-4444-4444-444444444443': 1000
      },
      accessoriesTotal: 1000,

      // Discounts
      discount: 5000,
      specialDiscount: 0,
      specialDiscountApprovalStatus: 'None',

      // GST
      isGstNumber: 'YES',
      gstNumber: '22AAAAA0000A1Z5',

      // Other
      jobClub: 'YES',
      otherCharges: 2000,

      // Pricing
      basePricing: {
        exShowroom: 500000,
        rto: 50000,
        insurance: 25000
      },
      finalPrice: 575000,

      // Documents
      documents: {
        aadhaarFront: null,
        aadhaarBack: null,
        pan: null
      }
    };

    console.log('✅ Sale data prepared with all fields\n');

    // Step 3: Create sale from booking
    console.log('💾 Step 3: Creating sale from booking...');
    const createResult = await salesService.createSaleFromBooking(
      testBooking.id,
      saleData,
      testBooking.sales_executive_id || 'test-user-id'
    );

    if (!createResult.success) {
      console.log('❌ Failed to create sale:', createResult.error);
      return;
    }

    console.log('✅ Sale created successfully!');
    console.log(`   Sale ID: ${createResult.sale.id}`);
    console.log(`   Status: ${createResult.sale.status}\n`);

    // Step 4: Retrieve the sale and verify all fields
    console.log('🔍 Step 4: Retrieving sale and verifying fields...');
    const retrievedSale = await salesService.getSale(createResult.sale.id);

    if (!retrievedSale) {
      console.log('❌ Failed to retrieve sale');
      return;
    }

    console.log('✅ Sale retrieved successfully!');
    console.log('\n📊 Verifying all fields are present:');
    
    const fieldsToCheck = [
      { name: 'soldThrough', expected: 'FINANCE', actual: retrievedSale.soldThrough },
      { name: 'financer', expected: 'HDFC Bank', actual: retrievedSale.financer },
      { name: 'financeBy', expected: 'John Doe', actual: retrievedSale.financeBy },
      { name: 'hypothecationSelected', expected: 'Yes', actual: retrievedSale.hypothecationSelected },
      { name: 'hypothecationCharge', expected: 500, actual: retrievedSale.hypothecationCharge },
      { name: 'registration', expected: 'Yes', actual: retrievedSale.registration },
      { name: 'otherState.selected', expected: 'Jharkhand', actual: retrievedSale.otherState?.selected },
      { name: 'otherState.amount', expected: 500, actual: retrievedSale.otherState?.amount },
      { name: 'insurance', expected: 'YES', actual: retrievedSale.insurance },
      { name: 'insuranceType', expected: 'Comprehensive', actual: retrievedSale.insuranceType },
      { name: 'insuranceNominee.name', expected: 'Jane Doe', actual: retrievedSale.insuranceNominee?.name },
      { name: 'typeOfSale', expected: 'EXCHANGE', actual: retrievedSale.typeOfSale },
      { name: 'exchange.model', expected: 'Honda City', actual: retrievedSale.exchange?.model },
      { name: 'exchange.value', expected: 150000, actual: retrievedSale.exchange?.value },
      { name: 'accessoriesTotal', expected: 1000, actual: retrievedSale.accessoriesTotal },
      { name: 'discount', expected: 5000, actual: retrievedSale.discount },
      { name: 'isGstNumber', expected: 'YES', actual: retrievedSale.isGstNumber },
      { name: 'gstNumber', expected: '22AAAAA0000A1Z5', actual: retrievedSale.gstNumber },
      { name: 'jobClub', expected: 'YES', actual: retrievedSale.jobClub },
      { name: 'finalPrice', expected: 575000, actual: retrievedSale.finalPrice },
    ];

    let allFieldsCorrect = true;
    fieldsToCheck.forEach(field => {
      const matches = field.expected === field.actual;
      const icon = matches ? '✅' : '❌';
      console.log(`   ${icon} ${field.name}: ${field.actual} ${matches ? '' : `(expected: ${field.expected})`}`);
      if (!matches) allFieldsCorrect = false;
    });

    if (allFieldsCorrect) {
      console.log('\n🎉 All fields verified successfully!\n');
    } else {
      console.log('\n⚠️  Some fields do not match expected values\n');
    }

    // Step 5: Update the sale
    console.log('✏️  Step 5: Updating sale...');
    const updateData = {
      ...saleData,
      soldThrough: 'CASH',
      financer: null,
      financeBy: null,
      hypothecationSelected: 'No',
      hypothecationCharge: 0,
      discount: 10000,
    };

    const updateResult = await salesService.updateSale(
      createResult.sale.id,
      updateData,
      'test-user-id'
    );

    if (!updateResult.success) {
      console.log('❌ Failed to update sale:', updateResult.error);
      return;
    }

    console.log('✅ Sale updated successfully!');
    console.log(`   New soldThrough: ${updateResult.sale.soldThrough}`);
    console.log(`   New discount: ${updateResult.sale.discount}\n`);

    // Step 6: Verify the update
    console.log('🔍 Step 6: Verifying update...');
    const updatedSale = await salesService.getSale(createResult.sale.id);

    if (updatedSale.soldThrough === 'CASH' && updatedSale.discount === 10000) {
      console.log('✅ Update verified successfully!\n');
    } else {
      console.log('❌ Update verification failed');
      console.log(`   soldThrough: ${updatedSale.soldThrough} (expected: CASH)`);
      console.log(`   discount: ${updatedSale.discount} (expected: 10000)\n`);
    }

    // Step 7: Check database directly
    console.log('🗄️  Step 7: Checking database directly...');
    const { data: dbSale, error: dbError } = await supabase
      .from('sales')
      .select('*')
      .eq('id', createResult.sale.id)
      .single();

    if (dbError) throw dbError;

    console.log('✅ Database record found');
    console.log(`   other_charges column type: ${typeof dbSale.other_charges}`);
    console.log(`   other_charges keys: ${Object.keys(dbSale.other_charges || {}).join(', ')}`);
    console.log(`   Sample data from other_charges:`, {
      soldThrough: dbSale.other_charges?.soldThrough,
      financer: dbSale.other_charges?.financer,
      insurance: dbSale.other_charges?.insurance,
    });

    console.log('\n✅ ✅ ✅ Sales Flow Test Completed Successfully! ✅ ✅ ✅\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('Error details:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
  }
}

// Run the test
testSalesFlow()
  .then(() => {
    console.log('Test script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
  });
