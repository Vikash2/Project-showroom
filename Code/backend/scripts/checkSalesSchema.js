require('dotenv').config();
const { supabase } = require('../src/config/supabase');

async function checkSchema() {
  try {
    // Try to get a sample record to see the structure
    const { data: sample, error: sampleError } = await supabase
      .from('sales')
      .select('*')
      .limit(1);

    if (sampleError) throw sampleError;

    if (sample && sample.length > 0) {
      console.log('\n📊 Sample sales record structure:');
      console.log(JSON.stringify(sample[0], null, 2));
      
      console.log('\n🔍 Column types (inferred from sample):');
      Object.entries(sample[0]).forEach(([key, value]) => {
        const type = typeof value;
        const isArray = Array.isArray(value);
        const isObject = type === 'object' && !isArray && value !== null;
        console.log(`  ${key}: ${type} ${isArray ? '(array)' : ''} ${isObject ? '(object/jsonb)' : ''}`);
      });
      
      console.log('\n🔍 Checking other_charges column specifically:');
      console.log(`  Type: ${typeof sample[0].other_charges}`);
      console.log(`  Value: ${JSON.stringify(sample[0].other_charges)}`);
    } else {
      console.log('No sales records found in database');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema().then(() => process.exit(0));
