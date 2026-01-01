# File Download Feature for Admins

Admins can now download uploaded files (including RAR files) from orders.

## Supported File Types

Users can now upload:
- **3D Models**: STL, OBJ, 3MF
- **Archives**: RAR, ZIP

All files are stored in `/public/uploads/model/` directory.

## Admin File Download

### API Endpoint

**GET `/api/admin/files/[id]/download`**

Downloads a file by its ID (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
- Returns the file as a download with appropriate headers
- Content-Type: Based on file's mimeType
- Content-Disposition: `attachment; filename="original-filename.ext"`

**Example:**
```bash
curl -X GET http://localhost:3000/api/admin/files/file_id/download \
  -H "Authorization: Bearer <admin_token>" \
  --output downloaded-file.rar
```

### Order API Response

When admins fetch orders, custom files now include download information:

```json
{
  "order": {
    "items": [
      {
        "customFile": {
          "id": "custom_file_id",
          "file": {
            "id": "file_id",
            "filename": "model.rar",
            "url": "/uploads/model/1234567890-abc123.rar",
            "size": 1024000,
            "downloadUrl": "/api/admin/files/file_id/download"
          }
        }
      }
    ]
  }
}
```

**Note:** `downloadUrl` is only included for admin users. Regular users will see `null` for this field.

## Frontend Integration

To add download functionality in the admin panel:

```typescript
// In your admin orders component
const handleDownloadFile = async (fileId: string, filename: string) => {
  const token = useAuth.getState().token
  
  try {
    const response = await fetch(`/api/admin/files/${fileId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Download failed')
    }
    
    // Create blob and download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Download error:', error)
    alert('Failed to download file')
  }
}
```

## Security

✅ **Admin Only**: Only admins can download files
✅ **File Validation**: Files are validated before upload
✅ **Path Security**: File paths are sanitized to prevent traversal
✅ **File Existence Check**: Verifies file exists on disk before download

## File Storage

Files are stored in:
```
public/uploads/model/[timestamp]-[random].[ext]
```

Example:
- `public/uploads/model/1704067200000-abc123def456.rar`
- `public/uploads/model/1704067200000-xyz789ghi012.stl`

## Usage Example

1. **User uploads RAR file** via `/shop/upload`
2. **File is stored** in `/public/uploads/model/`
3. **Order is created** with reference to the file
4. **Admin views order** via `/api/orders/[id]`
5. **Admin sees downloadUrl** in the response
6. **Admin downloads file** via `/api/admin/files/[id]/download`

## Notes

- RAR and ZIP files are treated as model files (stored in `model/` directory)
- File size limit: 100MB
- Files are permanently stored until manually deleted
- Consider implementing file cleanup for old/unused files in the future

