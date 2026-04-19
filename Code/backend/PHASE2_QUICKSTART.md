# 🚀 Phase 2 Quick Start

## What's New in Phase 2

Phase 2 adds the complete catalog management system:
- Showroom management
- Vehicle catalog with variants and colors
- Stock tracking
- Accessories with vehicle compatibility
- Image upload to Firebase Storage

## Server Status

The server should already be running from Phase 1. If not:
```bash
cd Code/backend
npm run dev
```

Check health:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-29T...",
  "environment": "development",
  "phase": "Phase 2 - Showroom & Vehicle Catalog"
}
```

## Quick Test Flow

### 1. Login and Get Token
Use your frontend or Firebase Auth to get an ID token for a Super Admin user.

### 2. Create a Showroom
```bash
curl -X POST http://localhost:3001/api/showrooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sandhya Honda Patna",
    "location": {
      "address": "Bailey Road, Patna",
      "city": "Patna",
      "state": "Bihar",
      "pincode": "800001"
    },
    "contact": {
      "phone": "9876543210",
      "email": "patna@sandhyahonda.com"
    }
  }'
```

### 3. List Showrooms
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/showrooms
```

### 4. Create a Vehicle (Public can view, but auth required to create)
```bash
curl -X POST http://localhost:3001/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Honda",
    "model": "Activa 6G",
    "category": "Scooter",
    "specs": {
      "mileage": "50 kmpl",
      "engine": "109.51cc"
    },
    "variants": {
      "STD": {
        "name": "Standard",
        "pricing": {
          "exShowroom": 78900,
          "rto": 4200,
          "insurance": 3800,
          "onRoadPrice": 86900
        },
        "colors": {
          "Black": {
            "name": "Black",
            "hexCode": "#000000",
            "stockQty": 10,
            "status": "In Stock"
          }
        }
      }
    }
  }'
```

### 5. List Vehicles (No Auth Required - Public)
```bash
curl http://localhost:3001/api/vehicles
```

### 6. Update Stock
```bash
# Get vehicle ID from previous response, then:
curl -X PATCH "http://localhost:3001/api/vehicles/VEHICLE_ID/variants/STD/stock?colorName=Black" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stockQty": 5}'
```

### 7. Create an Accessory
```bash
curl -X POST http://localhost:3001/api/accessories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Body Cover",
    "category": "Protection",
    "price": 1200,
    "stockQty": 50
  }'
```

### 8. Upload an Image
```bash
curl -X POST http://localhost:3001/api/uploads/direct \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "folder=vehicles"
```

## API Endpoints Summary

### Showrooms (Auth Required)
- `GET /api/showrooms` - List all
- `GET /api/showrooms/:id` - Get one
- `POST /api/showrooms` - Create (Super Admin)
- `PATCH /api/showrooms/:id` - Update
- `DELETE /api/showrooms/:id` - Delete (Super Admin)

### Vehicles (Public Read, Auth Write)
- `GET /api/vehicles` - List all (PUBLIC)
- `GET /api/vehicles/:id` - Get one (PUBLIC)
- `POST /api/vehicles` - Create (Manager+)
- `PATCH /api/vehicles/:id` - Update (Manager+)
- `PATCH /api/vehicles/:id/variants/:variantId/stock?colorName=X` - Update stock
- `DELETE /api/vehicles/:id` - Delete (Manager+)

### Accessories (Public Read, Auth Write)
- `GET /api/accessories` - List all (PUBLIC)
- `GET /api/accessories?vehicleId=X` - Filter by vehicle (PUBLIC)
- `GET /api/accessories/:id` - Get one (PUBLIC)
- `POST /api/accessories` - Create (Manager+)
- `PATCH /api/accessories/:id` - Update (Manager+)
- `DELETE /api/accessories/:id` - Delete (Manager+)

### Uploads (Auth Required)
- `POST /api/uploads/presigned` - Get presigned URL
- `POST /api/uploads/direct` - Direct upload
- `DELETE /api/uploads/:folder/:filename` - Delete file

## Frontend Integration Tips

### 1. Vehicle Catalog Page (Public)
No authentication needed for viewing:
```typescript
const vehicles = await axios.get("/api/vehicles");
// Display to customers
```

### 2. Admin Vehicle Management
Requires authentication:
```typescript
const createVehicle = async (data) => {
  const response = await axios.post("/api/vehicles", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.vehicle;
};
```

### 3. Image Upload in Forms
```typescript
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "vehicles");
  
  const response = await axios.post("/api/uploads/direct", formData);
  return response.data.url; // Save this URL in vehicle data
};
```

### 4. Stock Management
```typescript
const updateStock = async (vehicleId, variantId, color, qty) => {
  await axios.patch(
    `/api/vehicles/${vehicleId}/variants/${variantId}/stock?colorName=${color}`,
    { stockQty: qty }
  );
};
```

## Common Issues

### ❌ "Access denied" when creating vehicle
→ Make sure you're logged in as Super Admin or Showroom Manager

### ❌ "File too large" on upload
→ Max file size is 10MB. Compress images before uploading.

### ❌ "Invalid file type"
→ Only JPEG, PNG, GIF, WEBP, and PDF are allowed

### ❌ Stock status not updating
→ Status is auto-calculated: 0 = Out of Stock, 1-3 = Low Stock, 4+ = In Stock

## Next Steps

Once Phase 2 is tested:
1. Migrate frontend ShowroomContext to use API
2. Migrate VehicleContext to use API
3. Migrate AccessoryContext to use API
4. Update image upload components
5. Test public vehicle catalog page
6. Test admin vehicle management page

Then proceed to **Phase 3: Inquiry & Lead Management**

## Need Help?

Check `PHASE2_COMPLETE.md` for detailed documentation and examples.
