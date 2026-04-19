/**
 * Field Name Validation Script
 * 
 * This script validates that all field names are consistent across the codebase.
 * Run this after making changes to ensure no field name mismatches exist.
 */

const { supabase } = require('../src/config/supabase');

async function validateVehicleFields() {
  console.log('\n=== Validating Vehicle Fields ===\n');
  
  try {
    // Test 1: Verify vehicles table columns
    console.log('Test 1: Checking vehicles table structure...');
    const { data: vehicles, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, name, brand, category, image_url, base_price, showroom_id, is_active')
      .limit(1);
    
    if (vehicleError) {
      console.error('❌ FAILED: vehicles table query error:', vehicleError.message);
      return false;
    }
    console.log('✅ PASSED: vehicles table has correct columns');
    
    // Test 2: Verify vehicle_variants table columns
    console.log('\nTest 2: Checking vehicle_variants table structure...');
    const { data: variants, error: variantError } = await supabase
      .from('vehicle_variants')
      .select('id, vehicle_id, variant_name, price, specifications')
      .limit(1);
    
    if (variantError) {
      console.error('❌ FAILED: vehicle_variants table query error:', variantError.message);
      return false;
    }
    console.log('✅ PASSED: vehicle_variants table has correct columns');
    
    // Test 3: Verify vehicle_colors table columns
    console.log('\nTest 3: Checking vehicle_colors table structure...');
    const { data: colors, error: colorError } = await supabase
      .from('vehicle_colors')
      .select('id, variant_id, color_name, color_code, stock_qty, status')
      .limit(1);
    
    if (colorError) {
      console.error('❌ FAILED: vehicle_colors table query error:', colorError.message);
      return false;
    }
    console.log('✅ PASSED: vehicle_colors table has correct columns');
    
    return true;
  } catch (error) {
    console.error('❌ FAILED: Unexpected error:', error.message);
    return false;
  }
}

async function validateBookingFields() {
  console.log('\n=== Validating Booking Fields ===\n');
  
  try {
    // Test 1: Verify bookings table columns
    console.log('Test 1: Checking bookings table structure...');
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        customer_name,
        email,
        mobile,
        vehicle_id,
        variant_id,
        color_id,
        showroom_id,
        booking_amount,
        status,
        chassis_number,
        engine_number,
        sales_executive_id,
        payment_confirmed,
        delivery_date,
        notes
      `)
      .limit(1);
    
    if (bookingError) {
      console.error('❌ FAILED: bookings table query error:', bookingError.message);
      return false;
    }
    console.log('✅ PASSED: bookings table has correct columns');
    
    // Test 2: Verify booking with joined vehicle details
    console.log('\nTest 2: Checking booking with vehicle joins...');
    const { data: bookingWithVehicle, error: joinError } = await supabase
      .from('bookings')
      .select(`
        *,
        vehicles (id, brand, name, image_url),
        vehicle_variants (id, variant_name, price, specifications),
        vehicle_colors (id, color_name, color_code)
      `)
      .limit(1);
    
    if (joinError) {
      console.error('❌ FAILED: booking join query error:', joinError.message);
      return false;
    }
    console.log('✅ PASSED: booking joins work correctly');
    
    return true;
  } catch (error) {
    console.error('❌ FAILED: Unexpected error:', error.message);
    return false;
  }
}

async function validateFieldMapping() {
  console.log('\n=== Validating Field Mapping ===\n');
  
  try {
    // Get a sample vehicle with all details
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_variants (
          *,
          vehicle_colors (*)
        )
      `)
      .limit(1)
      .single();
    
    if (error) {
      console.error('❌ FAILED: Could not fetch sample vehicle:', error.message);
      return false;
    }
    
    if (!vehicle) {
      console.log('⚠️  WARNING: No vehicles in database to validate');
      return true;
    }
    
    // Validate field names
    console.log('Validating vehicle field names...');
    const requiredVehicleFields = ['id', 'name', 'brand', 'image_url', 'base_price'];
    const missingVehicleFields = requiredVehicleFields.filter(field => !(field in vehicle));
    
    if (missingVehicleFields.length > 0) {
      console.error('❌ FAILED: Missing vehicle fields:', missingVehicleFields);
      return false;
    }
    console.log('✅ PASSED: Vehicle has all required fields');
    
    if (vehicle.vehicle_variants && vehicle.vehicle_variants.length > 0) {
      const variant = vehicle.vehicle_variants[0];
      console.log('\nValidating variant field names...');
      const requiredVariantFields = ['id', 'variant_name', 'price'];
      const missingVariantFields = requiredVariantFields.filter(field => !(field in variant));
      
      if (missingVariantFields.length > 0) {
        console.error('❌ FAILED: Missing variant fields:', missingVariantFields);
        return false;
      }
      console.log('✅ PASSED: Variant has all required fields');
      
      if (variant.vehicle_colors && variant.vehicle_colors.length > 0) {
        const color = variant.vehicle_colors[0];
        console.log('\nValidating color field names...');
        const requiredColorFields = ['id', 'color_name', 'color_code', 'stock_qty'];
        const missingColorFields = requiredColorFields.filter(field => !(field in color));
        
        if (missingColorFields.length > 0) {
          console.error('❌ FAILED: Missing color fields:', missingColorFields);
          return false;
        }
        console.log('✅ PASSED: Color has all required fields');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ FAILED: Unexpected error:', error.message);
    return false;
  }
}

async function runAllValidations() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     Field Name Consistency Validation Script          ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = {
    vehicles: await validateVehicleFields(),
    bookings: await validateBookingFields(),
    mapping: await validateFieldMapping()
  };
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    VALIDATION SUMMARY                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log(`Vehicle Fields:  ${results.vehicles ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Booking Fields:  ${results.bookings ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Field Mapping:   ${results.mapping ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('\n🎉 All validations passed! Field names are consistent.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some validations failed. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run validations
runAllValidations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
