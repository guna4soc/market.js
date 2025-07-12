# MongoDB Notification Document Examples

You can copy and paste these documents directly into your MongoDB database to add notifications that will appear in the React frontend.

## Database: mydb
## Collection: notifications

### Example 1: Complete notification with all fields
```json
{
  "message": "New customer order received",
  "type": "order",
  "read": false,
  "icon": "📦",
  "text": "New customer order received",
  "time": "2 min ago",
  "createdAt": new Date()
}
```

### Example 2: Minimal notification (will use defaults)
```json
{
  "message": "Low stock alert for Fresh Vegetables",
  "type": "stock",
  "read": false,
  "createdAt": new Date()
}
```

### Example 3: Payment notification
```json
{
  "message": "Payment processed successfully",
  "type": "payment",
  "read": false,
  "icon": "💰",
  "text": "Payment processed successfully",
  "time": "5 min ago",
  "createdAt": new Date()
}
```

### Example 4: User registration
```json
{
  "message": "New user registered: john@example.com",
  "type": "user",
  "read": false,
  "icon": "👤",
  "text": "New user registered: john@example.com",
  "time": "10 min ago",
  "createdAt": new Date()
}
```

### Example 5: System notification
```json
{
  "message": "System backup completed",
  "type": "system",
  "read": false,
  "icon": "💾",
  "text": "System backup completed",
  "time": "15 min ago",
  "createdAt": new Date()
}
```

### Example 6: Feedback notification
```json
{
  "message": "Customer left 5-star review",
  "type": "feedback",
  "read": false,
  "icon": "⭐",
  "text": "Customer left 5-star review",
  "time": "20 min ago",
  "createdAt": new Date()
}
```

## How to add these in MongoDB Compass:

1. Open MongoDB Compass
2. Connect to your database: `mongodb+srv://user_guna:cyber4guna@cluster0.xbxjlxf.mongodb.net/mydb`
3. Navigate to the `notifications` collection
4. Click "Add Data" → "Insert Document"
5. Copy and paste any of the JSON examples above
6. Click "Insert"

## How to add via MongoDB Shell:

```javascript
// Connect to your database
use mydb

// Insert a notification
db.notifications.insertOne({
  "message": "New order received",
  "type": "order",
  "read": false,
  "icon": "📦",
  "text": "New order received",
  "time": "1 min ago",
  "createdAt": new Date()
})
```

## Notes:

- The `icon`, `text`, and `time` fields are optional. If not provided, the backend will use defaults:
  - `icon`: "🔔"
  - `text`: same as `message`
  - `time`: "Just now"
- The frontend will automatically refresh every 30 seconds to show new notifications
- Notifications appear in both the main dashboard and sales dashboard
- The `read` field controls whether the notification is marked as read
- The `type` field can be: "order", "stock", "payment", "user", "system", "feedback", etc. 