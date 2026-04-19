-- =====================================================
-- SEED DATA: VEHICLES AND ACCESSORIES
-- Vehicle Showroom Management System
-- =====================================================
-- Run this AFTER running all migration scripts
-- This will populate the database with sample vehicles and accessories
-- =====================================================

-- =====================================================
-- 1. CREATE DEFAULT SHOWROOM (if not exists)
-- =====================================================

INSERT INTO public.showrooms (id, name, location, address, contact_number, email, manager_name, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Honda Showroom - Main Branch',
  'Mumbai',
  '123 Main Street, Mumbai, Maharashtra 400001',
  '+91-9876543210',
  'manager@hondashowroom.com',
  'Rajesh Kumar',
  true
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. INSERT VEHICLES
-- =====================================================

-- Vehicle 1: Honda Activa 6G
INSERT INTO public.vehicles (id, name, brand, category, description, base_price, showroom_id, image_url, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Activa 6G',
  'Honda',
  'Scooter',
  'The reliable family scooter with advanced features and excellent mileage.',
  74216.00,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Vehicle 2: Honda SP 125
INSERT INTO public.vehicles (id, name, brand, category, description, base_price, showroom_id, image_url, is_active)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'SP 125',
  'Honda',
  'Motorcycle',
  'Sporty 125cc motorcycle with LED lights and digital console.',
  86017.00,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Vehicle 3: Honda Shine 100
INSERT INTO public.vehicles (id, name, brand, category, description, base_price, showroom_id, image_url, is_active)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Shine 100',
  'Honda',
  'Motorcycle',
  'Economical 100cc motorcycle with excellent fuel efficiency.',
  64900.00,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Vehicle 4: Honda Unicorn
INSERT INTO public.vehicles (id, name, brand, category, description, base_price, showroom_id, image_url, is_active)
VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Unicorn',
  'Honda',
  'Motorcycle',
  'Premium 162cc motorcycle with ABS and LED lights.',
  109126.00,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
  true
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. INSERT VEHICLE VARIANTS
-- =====================================================

-- Activa 6G - Deluxe Variant
INSERT INTO public.vehicle_variants (id, vehicle_id, variant_name, price, specifications)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Deluxe',
  74216.00,
  '{
    "engine": "109.51 cc",
    "maxPower": "5.73 kW @ 8000 rpm",
    "maxTorque": "8.90 Nm @ 5500 rpm",
    "transmission": "CVT",
    "mileage": "60 kmpl",
    "fuelCapacity": "5.3 Liters",
    "brakeType": "Drum",
    "wheelType": "Steel",
    "weight": "107 kg",
    "features": ["LED Headlamp", "Smart Key"],
    "pricing": {
      "exShowroomPrice": 74216,
      "rtoCharges": {
        "registrationFee": 300,
        "roadTax": 4200,
        "smartCard": 200,
        "numberPlate": 400,
        "hypothecation": 0,
        "total": 5100
      },
      "insurance": {
        "thirdParty": 1500,
        "comprehensive": 2800,
        "personalAccident": 750,
        "zeroDepreciation": 1200,
        "total": 6250
      },
      "otherCharges": {
        "fastag": 200,
        "extendedWarranty": 2500,
        "amc": 3000,
        "documentationCharges": 500,
        "total": 1200
      },
      "onRoadPrice": 86766
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- SP 125 - Disc Variant
INSERT INTO public.vehicle_variants (id, vehicle_id, variant_name, price, specifications)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Disc',
  86017.00,
  '{
    "engine": "124 cc",
    "mileage": "65 kmpl",
    "weight": "116 kg",
    "brakeType": "Disc",
    "wheelType": "Alloy",
    "features": ["LED Lights", "CBS", "Digital Console"],
    "pricing": {
      "exShowroomPrice": 86017,
      "rtoCharges": {
        "registrationFee": 300,
        "roadTax": 4200,
        "smartCard": 200,
        "numberPlate": 400,
        "hypothecation": 0,
        "total": 5100
      },
      "insurance": {
        "thirdParty": 1500,
        "comprehensive": 2800,
        "personalAccident": 750,
        "zeroDepreciation": 1200,
        "total": 6250
      },
      "otherCharges": {
        "fastag": 200,
        "extendedWarranty": 2500,
        "amc": 3000,
        "documentationCharges": 500,
        "total": 1200
      },
      "onRoadPrice": 98017
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Shine 100 - Standard Variant
INSERT INTO public.vehicle_variants (id, vehicle_id, variant_name, price, specifications)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Standard',
  64900.00,
  '{
    "engine": "100 cc",
    "mileage": "70 kmpl",
    "weight": "99 kg",
    "features": ["CBS"],
    "pricing": {
      "exShowroomPrice": 64900,
      "rtoCharges": {
        "registrationFee": 300,
        "roadTax": 4200,
        "smartCard": 200,
        "numberPlate": 400,
        "hypothecation": 0,
        "total": 5100
      },
      "insurance": {
        "thirdParty": 1500,
        "comprehensive": 2800,
        "personalAccident": 750,
        "zeroDepreciation": 1200,
        "total": 6250
      },
      "otherCharges": {
        "fastag": 200,
        "extendedWarranty": 2500,
        "amc": 3000,
        "documentationCharges": 500,
        "total": 1200
      },
      "onRoadPrice": 76900
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Unicorn - Standard Variant
INSERT INTO public.vehicle_variants (id, vehicle_id, variant_name, price, specifications)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Standard',
  109126.00,
  '{
    "engine": "162 cc",
    "mileage": "55 kmpl",
    "weight": "140 kg",
    "features": ["ABS", "LED Lights"],
    "pricing": {
      "exShowroomPrice": 109126,
      "rtoCharges": {
        "registrationFee": 300,
        "roadTax": 4200,
        "smartCard": 200,
        "numberPlate": 400,
        "hypothecation": 0,
        "total": 5100
      },
      "insurance": {
        "thirdParty": 1500,
        "comprehensive": 2800,
        "personalAccident": 750,
        "zeroDepreciation": 1200,
        "total": 6250
      },
      "otherCharges": {
        "fastag": 200,
        "extendedWarranty": 2500,
        "amc": 3000,
        "documentationCharges": 500,
        "total": 1200
      },
      "onRoadPrice": 121126
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. INSERT VEHICLE COLORS
-- =====================================================

-- Activa 6G Deluxe - Colors
INSERT INTO public.vehicle_colors (id, variant_id, color_name, color_code, stock_qty, status)
VALUES 
  ('c1111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Pearl Precious White', '#FFFFFF', 5, 'In Stock'),
  ('c1111111-1111-1111-1111-111111111112'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Matte Axis Grey', '#555555', 2, 'In Stock')
ON CONFLICT (id) DO NOTHING;

-- SP 125 Disc - Colors
INSERT INTO public.vehicle_colors (id, variant_id, color_name, color_code, stock_qty, status)
VALUES 
  ('c2222222-2222-2222-2222-222222222222'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Striking Green', '#00FF00', 0, 'Out of Stock')
ON CONFLICT (id) DO NOTHING;

-- Shine 100 Standard - Colors
INSERT INTO public.vehicle_colors (id, variant_id, color_name, color_code, stock_qty, status)
VALUES 
  ('c3333333-3333-3333-3333-333333333333'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Red', '#FF0000', 10, 'In Stock')
ON CONFLICT (id) DO NOTHING;

-- Unicorn Standard - Colors
INSERT INTO public.vehicle_colors (id, variant_id, color_name, color_code, stock_qty, status)
VALUES 
  ('c4444444-4444-4444-4444-444444444444'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'Black', '#000000', 3, 'In Stock')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. INSERT ACCESSORIES
-- =====================================================

-- Safety Accessories
INSERT INTO public.accessories (id, name, category, description, price, showroom_id, compatible_vehicles, stock_qty, is_active)
VALUES 
  ('acc11111-1111-1111-1111-111111111111'::uuid, 'Helmet - Full Face', 'Safety', 'ISI certified full face helmet with anti-fog visor', 2500.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 50, true),
  ('acc11111-1111-1111-1111-111111111112'::uuid, 'Knee Guards', 'Safety', 'Protective knee guards for rider safety', 800.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 30, true),
  ('acc11111-1111-1111-1111-111111111113'::uuid, 'Riding Gloves', 'Safety', 'Weather-resistant riding gloves with grip', 600.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 40, true)
ON CONFLICT (id) DO NOTHING;

-- Convenience Accessories
INSERT INTO public.accessories (id, name, category, description, price, showroom_id, compatible_vehicles, stock_qty, is_active)
VALUES 
  ('acc22222-2222-2222-2222-222222222221'::uuid, 'Mobile Holder', 'Convenience', 'Universal mobile holder with 360° rotation', 350.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 60, true),
  ('acc22222-2222-2222-2222-222222222222'::uuid, 'USB Charger', 'Convenience', 'Waterproof USB charger with dual ports', 450.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 45, true),
  ('acc22222-2222-2222-2222-222222222223'::uuid, 'Rear View Mirror', 'Convenience', 'Wide-angle rear view mirror set', 500.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 35, true)
ON CONFLICT (id) DO NOTHING;

-- Protection Accessories
INSERT INTO public.accessories (id, name, category, description, price, showroom_id, compatible_vehicles, stock_qty, is_active)
VALUES 
  ('acc33333-3333-3333-3333-333333333331'::uuid, 'Body Cover', 'Protection', 'Waterproof body cover with UV protection', 800.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 25, true),
  ('acc33333-3333-3333-3333-333333333332'::uuid, 'Tank Pad', 'Protection', 'Anti-scratch tank pad with 3D design', 300.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 50, true),
  ('acc33333-3333-3333-3333-333333333333'::uuid, 'Leg Guard', 'Protection', 'Chrome-plated leg guard for scooters', 1200.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['11111111-1111-1111-1111-111111111111'::uuid], 20, true)
ON CONFLICT (id) DO NOTHING;

-- Aesthetics Accessories
INSERT INTO public.accessories (id, name, category, description, price, showroom_id, compatible_vehicles, stock_qty, is_active)
VALUES 
  ('acc44444-4444-4444-4444-444444444441'::uuid, 'LED Fog Lights', 'Aesthetics', 'High-intensity LED fog lights (pair)', 1500.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 30, true),
  ('acc44444-4444-4444-4444-444444444442'::uuid, 'Chrome Silencer', 'Aesthetics', 'Premium chrome-plated silencer', 2000.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 15, true),
  ('acc44444-4444-4444-4444-444444444443'::uuid, 'Seat Cover', 'Aesthetics', 'Premium leather seat cover', 1000.00, '00000000-0000-0000-0000-000000000001'::uuid, ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 40, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Display summary counts
SELECT 
  'SEED DATA INSERTED SUCCESSFULLY!' AS status,
  (SELECT COUNT(*) FROM public.vehicles) AS vehicles_count,
  (SELECT COUNT(*) FROM public.vehicle_variants) AS variants_count,
  (SELECT COUNT(*) FROM public.vehicle_colors) AS colors_count,
  (SELECT COUNT(*) FROM public.accessories) AS accessories_count;

-- Display sample data
SELECT 
  v.name AS vehicle,
  vv.variant_name AS variant,
  vc.color_name AS color,
  vc.stock_qty AS stock,
  vc.status
FROM public.vehicles v
JOIN public.vehicle_variants vv ON v.id = vv.vehicle_id
JOIN public.vehicle_colors vc ON vv.id = vc.variant_id
ORDER BY v.name, vv.variant_name, vc.color_name;

-- Display accessories
SELECT 
  name,
  category,
  price,
  stock_qty,
  is_active
FROM public.accessories
ORDER BY category, name;
