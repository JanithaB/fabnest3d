# API Routes Implementation Summary

All API routes have been implemented for Products, Orders, and Gallery.

## Products API

### GET `/api/products`
List all products with pagination and filtering.

**Query Parameters:**
- `category` - Filter by category
- `search` - Search in name, description, or tags
- `limit` - Number of results (default: 100)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "products": [...],
  "total": 50,
  "limit": 100,
  "offset": 0
}
```

### GET `/api/products/[id]`
Get a single product by ID.

**Response:**
```json
{
  "id": "...",
  "name": "...",
  "description": "...",
  "image": "/uploads/image/...",
  "images": [...],
  ...
}
```

### POST `/api/products` (Admin only)
Create a new product.

**Request:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "basePrice": 25.99,
  "category": "Home Decor",
  "tags": ["Popular", "New"],
  "printTime": "2 hours",
  "imageFileId": "file_id_from_upload"
}
```

### PUT `/api/products/[id]` (Admin only)
Update an existing product.

**Request:**
```json
{
  "name": "Updated Name",
  "basePrice": 29.99,
  "imageFileId": "new_file_id"
}
```

### DELETE `/api/products/[id]` (Admin only)
Delete a product.

## Orders API

### GET `/api/orders`
Get user's orders (or all orders if admin).

**Query Parameters:**
- `status` - Filter by status
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "orders": [...],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

### POST `/api/orders`
Create a new order.

**Request:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "productName": "Product Name",
      "material": "PLA",
      "size": "medium",
      "quantity": 2,
      "unitPrice": 25.00,
      "totalPrice": 50.00,
      "isCustom": false,
      "customFileId": null
    }
  ],
  "subtotal": 50.00,
  "shipping": 8.00,
  "tax": 5.80,
  "total": 63.80
}
```

### GET `/api/orders/[id]`
Get order details by ID.

**Response:**
```json
{
  "order": {
    "id": "...",
    "status": "pending",
    "items": [...],
    ...
  }
}
```

### PUT `/api/orders/[id]`
Update order (status, tracking, etc.).

**Request:**
```json
{
  "status": "processing",
  "trackingNumber": "TRK123456",
  "estimatedDelivery": "2024-01-15T00:00:00Z"
}
```

**Note:** Regular users can only cancel their own orders. Admins can update any field.

## Gallery API

### GET `/api/gallery`
List all gallery items.

**Query Parameters:**
- `search` - Search in title, description, or customer name
- `tag` - Filter by tag
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "items": [...],
  "total": 20,
  "limit": 50,
  "offset": 0
}
```

### GET `/api/gallery/[id]`
Get a single gallery item by ID.

### POST `/api/gallery` (Admin only)
Create a new gallery item.

**Request:**
```json
{
  "title": "Gallery Item Title",
  "description": "Description",
  "customerName": "Customer Name",
  "tags": ["Tag1", "Tag2"],
  "imageFileId": "file_id_from_upload"
}
```

### PUT `/api/gallery/[id]` (Admin only)
Update a gallery item.

**Request:**
```json
{
  "title": "Updated Title",
  "tags": ["New", "Tags"],
  "imageFileId": "new_file_id"
}
```

### DELETE `/api/gallery/[id]` (Admin only)
Delete a gallery item.

## Authentication

All routes (except public GET endpoints) require authentication:
- Include `Authorization: Bearer <token>` header
- Admin routes require `role: "admin"`

## Image Handling

For products and gallery items:
1. Upload image via `/api/upload` with `fileType: "image"`
2. Get the `file.id` from the response
3. Use `imageFileId` when creating/updating products or gallery items

## Next Steps

1. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```
   This will fix TypeScript errors in the API routes.

2. **Push Schema to Database:**
   ```bash
   npx prisma db push
   ```

3. **Test the API routes:**
   - Use Postman, Insomnia, or curl
   - Or update frontend components to use these endpoints

## Error Handling

All routes return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized/admin)
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message"
}
```

## Features

✅ Full CRUD operations for Products, Orders, and Gallery
✅ Authentication and authorization
✅ Image/file handling integration
✅ Pagination support
✅ Search and filtering
✅ Custom order support (3D model uploads)
✅ Admin-only operations properly protected
✅ User can only access their own orders
✅ Proper error handling and validation

