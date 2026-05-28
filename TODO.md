# Admin Page Enhancements TODO

## Step 1: Install Dependencies
- [x] Add multer to package.json for image uploads

## Step 2: Server Side Updates
- [x] Create server/models/Promotion.ts
- [x] Update server/routes/admin.ts:
  - [x] Add multer middleware
  - [x] Add GET /products
  - [x] Update POST /products to handle FormData and image upload
  - [x] Add combined GET /analytics with query params for filters
  - [x] Add GET /orders
  - [x] Add PUT /orders/:id/status
  - [x] Add POST /promotions
  - [x] Add GET /promotions

## Step 3: Client Side Updates
- [ ] Update client/pages/Admin.tsx:
  - [ ] Update Product interface (add category, inStock, remove stock)
  - [ ] Remove stock from add product form, add category select, add inStock toggle
  - [ ] Add edit product modal/form
  - [ ] Update analytics tab with filters (year, month, overall) and chart type switch (sales, popular products, user gain)
  - [ ] Add Orders tab to view and update order status
  - [ ] Add Promotions tab to add and view promo codes
  - [ ] Update tabs to include Orders and Promotions

## Step 4: Testing
- [ ] Test image upload and display
- [ ] Test product add/edit with category and inStock
- [ ] Test analytics filters
- [ ] Test order processing
- [ ] Test promotions
