# Farmer/Seller Features Documentation

## Overview
Comprehensive seller management system for farmers to manage their products, orders, promotions, and view analytics.

## Backend Features (API Routes: `/api/farmer/*`)

### 1. Dashboard Statistics
- **Endpoint**: `GET /api/farmer/dashboard`
- **Features**:
  - Total products count
  - Active products count
  - Pending products (awaiting admin approval)
  - Total orders received
  - Total revenue earned
  - Low stock alerts

### 2. Product Management
- **List Products**: `GET /api/farmer/products`
  - Filter by status (pending/approved/removed)
  - Filter by stock availability
  - Search by name/description
  
- **Get Single Product**: `GET /api/farmer/products/:id`
  
- **Add Product**: `POST /api/farmer/products`
  - Upload product images
  - Set price, category, description
  - Manage inventory quantity
  - Products require admin approval before going live
  
- **Update Product**: `PUT /api/farmer/products/:id`
  - Update all product details
  - Replace product images
  - Modify inventory
  
- **Delete Product**: `DELETE /api/farmer/products/:id`
  - Permanently remove products
  - Automatically deletes associated images
  
- **Toggle Stock**: `PUT /api/farmer/products/:id/toggle-stock`
  - Quick in-stock/out-of-stock toggle
  
- **Update Inventory**: `PUT /api/farmer/products/:id/inventory`
  - Update quantity and stock status

### 3. Order Management
- **List Orders**: `GET /api/farmer/orders`
  - View all orders containing farmer's products
  - Filter by status (pending/confirmed/processing/shipped/delivered/cancelled)
  - Filter by date range
  - Shows customer details
  
- **Get Single Order**: `GET /api/farmer/orders/:id`
  - Detailed order information
  - Customer contact details
  - Delivery address

### 4. Promotions/Offers Management
- **List Promotions**: `GET /api/farmer/promotions`
  - View all active and inactive promotions
  
- **Create Promotion**: `POST /api/farmer/promotions`
  - Create discount codes
  - Set discount percentage (0-100%)
  - Apply to specific products or all products
  - Set start and end dates
  - Add description
  
- **Update Promotion**: `PUT /api/farmer/promotions/:id`
  - Modify discount percentage
  - Change dates
  - Update status (active/inactive)
  
- **Delete Promotion**: `DELETE /api/farmer/promotions/:id`
  - Remove promotions

### 5. Analytics
- **Sales Analytics**: `GET /api/farmer/analytics/sales`
  - Daily sales data
  - Revenue trends
  - Order counts by date
  - Customizable time period (default: 30 days)
  
- **Product Performance**: `GET /api/farmer/analytics/products`
  - Top 10 best-selling products
  - Total units sold per product
  - Revenue per product
  - Number of orders per product

### 6. Categories
- **List Categories**: `GET /api/farmer/categories`
  - View all available product categories

## Frontend Features

### Farmer Dashboard (`/farmer-dashboard`)

#### 1. Overview Cards
- Total Products
- Active Products
- Total Orders
- Total Revenue

#### 2. Products Tab
- **Product List Table**:
  - Name, Price, Category
  - Stock status badge
  - Approval status badge
  - Action buttons (Edit, Toggle Stock, Delete)
  
- **Add/Edit Product Dialog**:
  - Name (required)
  - Price (required)
  - Category dropdown (required)
  - Quantity
  - Description
  - Image upload
  - In Stock checkbox
  
- **Features**:
  - Real-time product search
  - Filter by status
  - Quick stock toggle
  - Image upload with preview
  - Validation for required fields

#### 3. Orders Tab
- **Order List Table**:
  - Order ID (last 8 characters)
  - Customer name
  - Number of items
  - Total amount
  - Status badge
  - Order date
  
- **Features**:
  - View only orders containing farmer's products
  - Sorted by most recent first
  - Customer contact information

#### 4. Promotions Tab
- **Promotion List Table**:
  - Promo code
  - Discount percentage
  - Applicable product
  - Start and end dates
  - Status badge
  - Action buttons (Edit, Delete)
  
- **Add/Edit Promotion Dialog**:
  - Promo code (required, unique)
  - Discount percentage (0-100%)
  - Product selection (optional - applies to all if not selected)
  - Start date (required)
  - End date (required)
  - Description
  
- **Features**:
  - Create time-limited offers
  - Product-specific or store-wide discounts
  - Active/inactive status management

## Security Features

1. **Authentication Required**: All farmer routes require valid JWT token
2. **Role-Based Access**: Only users with role="farmer" can access farmer routes
3. **Data Isolation**: Farmers can only view/edit their own products and orders
4. **Admin Approval**: New products require admin approval before going live
5. **Image Validation**: File upload validation and secure storage

## Real-World Features Inspired By

1. **Amazon Seller Central**:
   - Product management dashboard
   - Inventory tracking
   - Order management
   - Sales analytics

2. **Shopify**:
   - Promotion/discount code system
   - Product status workflow (pending/approved)
   - Revenue tracking

3. **Etsy**:
   - Simple product listing interface
   - Category management
   - Order fulfillment tracking

4. **BigCommerce**:
   - Low stock alerts
   - Bulk product operations
   - Performance analytics

## Database Models Updated

### Product Model
- Added `farmerId` field to track product owner
- Added `status` field for approval workflow
- Added `published` field for visibility control

### Order Model
- Added `farmerId` to order items to track which farmer's product was ordered

### Promotion Model
- Added `farmerId` field to track promotion owner
- Supports product-specific and store-wide promotions

## Login System Updates

1. **Role Selection**: Users can choose to login/register as:
   - Customer
   - Farmer (Seller)

2. **Smart Redirects**:
   - Customers → `/dashboard`
   - Farmers → `/farmer-dashboard`
   - Admins → `/admin`

3. **Unified Login**: Same login page for all user types with role selection

## API Endpoints Summary

```
GET    /api/farmer/dashboard              - Dashboard stats
GET    /api/farmer/products               - List products
GET    /api/farmer/products/:id           - Get product
POST   /api/farmer/products               - Add product
PUT    /api/farmer/products/:id           - Update product
DELETE /api/farmer/products/:id           - Delete product
PUT    /api/farmer/products/:id/toggle-stock - Toggle stock
PUT    /api/farmer/products/:id/inventory - Update inventory
GET    /api/farmer/orders                 - List orders
GET    /api/farmer/orders/:id             - Get order
GET    /api/farmer/promotions             - List promotions
POST   /api/farmer/promotions             - Create promotion
PUT    /api/farmer/promotions/:id         - Update promotion
DELETE /api/farmer/promotions/:id         - Delete promotion
GET    /api/farmer/analytics/sales        - Sales analytics
GET    /api/farmer/analytics/products     - Product performance
GET    /api/farmer/categories             - List categories
```

## Future Enhancements

1. Bulk product upload (CSV import)
2. Product variants (size, color, etc.)
3. Shipping management
4. Customer reviews and ratings management
5. Automated low stock notifications
6. Sales forecasting
7. Export reports (PDF/Excel)
8. Multi-language support
9. Mobile app for farmers
10. Real-time order notifications
