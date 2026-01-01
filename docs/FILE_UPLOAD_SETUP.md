# File Upload System Setup

This document explains the file upload system implementation for storing images and 3D model files in `/public/uploads`.

## Database Schema

The system uses the following Prisma models:

- **File**: Tracks all uploaded files (images and 3D models)
- **ProductImage**: Links products to their image files
- **GalleryImage**: Links gallery items to their images  
- **CustomOrderFile**: Stores user-uploaded 3D model files for custom orders

## File Storage Structure

Files are stored in `/public/uploads/` with the following structure:

```
public/
  uploads/
    image/          # Product and gallery images
      [timestamp]-[random].jpg
      [timestamp]-[random].png
    model/          # User-uploaded 3D models
      [timestamp]-[random].stl
      [timestamp]-[random].obj
      [timestamp]-[random].3mf
```

## API Endpoints

### POST `/api/upload`

Uploads a file (image or 3D model) to the server.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Headers: `Authorization: Bearer <token>`
- Body:
  - `file`: File object
  - `fileType`: "image" | "model"

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file_id",
    "url": "/uploads/model/1234567890-abc123.stl",
    "filename": "model.stl",
    "size": 1024000,
    "fileType": "model"
  }
}
```

### POST `/api/upload/custom-order`

Creates a custom order file record for a user-uploaded 3D model.

**Request:**
- Method: POST
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- Body:
```json
{
  "fileId": "file_id",
  "material": "pla",
  "quality": "standard",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "customFile": {
    "id": "custom_file_id",
    "userId": "user_id",
    "fileId": "file_id",
    "material": "pla",
    "quality": "standard",
    "notes": "Optional notes",
    "status": "pending",
    "file": {
      "id": "file_id",
      "filename": "model.stl",
      "url": "/uploads/model/1234567890-abc123.stl",
      "size": 1024000
    }
  }
}
```

## Frontend Integration

The `FileUpload` component (`components/file-upload.tsx`) handles:
1. File selection (drag & drop or browse)
2. File validation (STL, OBJ, 3MF for models)
3. Upload to server
4. Creating custom order file record
5. Navigation to checkout

## Authentication

The upload endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

**Note:** You'll need to update your auth system (`lib/auth.ts`) to:
1. Store JWT tokens when users log in
2. Include tokens in API requests

## Installation Steps

1. **Install dependencies:**
   ```bash
   pnpm install jsonwebtoken @types/jsonwebtoken
   ```

2. **Update Prisma schema:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Create uploads directory:**
   ```bash
   mkdir -p public/uploads/image
   mkdir -p public/uploads/model
   ```

4. **Set JWT_SECRET in `.env`:**
   ```env
   JWT_SECRET=your-super-secret-key-min-32-chars
   ```

5. **Update auth system** to use JWT tokens (see `lib/auth-server.ts` for server-side verification)

## File Validation

- **Images**: JPEG, PNG, WebP (max 100MB)
- **Models**: STL, OBJ, 3MF (max 100MB)

## Security Considerations

1. **File size limits**: 100MB maximum
2. **File type validation**: Only allowed extensions accepted
3. **Authentication required**: All uploads require valid JWT token
4. **User ownership**: Users can only access their own files (unless admin)
5. **Unique filenames**: Timestamp + random string prevents collisions

## Next Steps

1. Update `lib/auth.ts` to store and use JWT tokens
2. Create API endpoints for products and gallery items to use the File model
3. Add file deletion endpoints
4. Consider adding image optimization/resizing for product images
5. For production, consider migrating to cloud storage (AWS S3, Cloudinary, etc.)

