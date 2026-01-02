# Quote Request System

The system now uses a quote request workflow instead of automatic price estimation. Users upload files and request quotes, then admins calculate prices and send Proforma Invoices (PI) via email.

## Workflow

### User Flow

1. **Upload File**: User uploads 3D model file (STL, OBJ, 3MF, RAR, ZIP)
2. **Configure Options**: User selects material and quality preferences
3. **Request Quote**: User submits quote request
4. **Wait for Review**: Admin reviews the file and calculates price
5. **Receive PI**: Admin sends Proforma Invoice via email
6. **Accept/Reject**: User can accept or reject the quote

### Admin Flow

1. **View Quote Requests**: Admin sees all pending quote requests
2. **Download File**: Admin downloads the uploaded file for review
3. **Calculate Price**: Admin calculates price based on file complexity, material, quality
4. **Set Price & Notes**: Admin enters the price and any notes
5. **Send PI**: Admin sends Proforma Invoice to customer via email
6. **Track Status**: Admin can track quote status (pending → quoted → accepted/rejected)

## Database Schema

### QuoteRequest Model

```prisma
model QuoteRequest {
  id            String   @id @default(cuid())
  userId        String
  customFileId  String   @unique
  status        String   @default("pending") // pending | quoted | accepted | rejected
  requestedPrice Float?
  adminNotes    String?
  piSent        Boolean  @default(false)
  piSentAt      DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User
  customFile    CustomOrderFile
}
```

## API Endpoints

### Quote Requests

#### GET `/api/quote-requests`
Get quote requests (user's own or all if admin)

**Query Parameters:**
- `status` - Filter by status (pending, quoted, accepted, rejected)
- `limit` - Number of results (default: 50, max: 100)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "quoteRequests": [
    {
      "id": "quote_id",
      "status": "pending",
      "requestedPrice": null,
      "adminNotes": null,
      "piSent": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "customFile": {
        "id": "custom_file_id",
        "material": "pla",
        "quality": "standard",
        "file": {
          "id": "file_id",
          "filename": "model.stl",
          "url": "/uploads/model/...",
          "size": 1024000
        }
      }
    }
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

#### POST `/api/quote-requests`
Create a new quote request

**Body:**
```json
{
  "customFileId": "custom_file_id"
}
```

**Response:**
```json
{
  "success": true,
  "quoteRequest": { ... }
}
```

#### GET `/api/quote-requests/[id]`
Get a single quote request (admin only)

**Response:**
```json
{
  "quoteRequest": {
    "id": "quote_id",
    "status": "pending",
    "user": { ... },
    "customFile": {
      "file": {
        "downloadUrl": "/api/admin/files/file_id/download"
      }
    }
  }
}
```

#### PUT `/api/quote-requests/[id]`
Update quote request (admin only) - set price, send PI

**Body:**
```json
{
  "requestedPrice": 125.50,
  "adminNotes": "Complex model, requires support material",
  "status": "quoted",
  "sendPI": true
}
```

**Response:**
```json
{
  "success": true,
  "quoteRequest": { ... }
}
```

## Email Integration

### Proforma Invoice Email

When an admin sets a price and sends a PI, the system sends an email to the customer with:

- Customer name and email
- File name
- Material and quality selected
- Quoted price
- Admin notes (if any)
- Instructions to accept/reject

### Email Service Setup

The email service is currently a placeholder. To enable actual email sending:

1. **Choose an email service:**
   - SendGrid
   - Resend
   - AWS SES
   - Nodemailer (SMTP)

2. **Update `lib/email.ts`:**
   - Implement `sendPIEmail()` function
   - Configure email service credentials
   - Use the provided HTML template or create your own

3. **Environment Variables:**
   ```env
   EMAIL_SERVICE_API_KEY=your_api_key
   EMAIL_FROM=noreply@fabnest3d.com
   ```

## Frontend Integration

### Upload Page Changes

- Removed price estimation display
- Changed "Proceed to Checkout" to "Request Price Quote"
- Shows material and quality selection (no price calculation)
- After submission, redirects to account/orders page

### Admin Panel (TODO)

Create admin pages to:
- List all quote requests
- Filter by status
- View quote request details
- Download uploaded files
- Set price and send PI
- Track PI status

## Status Flow

```
pending → quoted → accepted
                ↓
            rejected
```

- **pending**: Quote request created, waiting for admin review
- **quoted**: Admin has set a price and sent PI
- **accepted**: Customer accepted the quote (can proceed to order)
- **rejected**: Quote was rejected (by admin or customer)

## Security

✅ **Authentication Required**: All endpoints require authentication
✅ **Authorization**: Only admins can view all requests and update quotes
✅ **File Access**: Only admins can download files
✅ **User Isolation**: Users can only see their own quote requests

## Next Steps

1. **Create Admin UI**: Build admin pages for managing quote requests
2. **Email Integration**: Set up actual email service
3. **Order Creation**: Allow users to create orders from accepted quotes
4. **Notifications**: Add email notifications for status changes
5. **File Analysis**: Integrate 3D file analysis tools for automatic price estimation (optional)

