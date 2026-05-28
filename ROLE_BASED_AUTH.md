# Role-Based Authentication System

## Overview
Implemented strict role-based authentication where users can only login with credentials matching their registered account type.

## Changes Made

### Backend Changes (server/routes/auth.ts)

#### 1. Login Validation
- **Role Matching**: Users must login with the role they registered with
- **Error Messages**:
  - If a Customer tries to login as Farmer: "This account is not registered as a Farmer. Please login as a Customer or register a new Farmer account."
  - If a Farmer tries to login as Customer: "This account is registered as a Farmer. Please login using the Farmer option."
  
#### 2. Registration Validation
- **Farmer Requirements**: Farm name and location are mandatory for farmer registration
- **Error Message**: "Farm name and location are required for farmer registration"
- **Email Uniqueness**: Better error message - "User already exists with this email"

#### 3. Security Improvements
- Removed ability to switch roles after registration
- Role is permanently set during registration
- JWT token includes the user's actual role from database

### Frontend Changes (client/pages/Login.tsx)

#### 1. Registration Form Updates
- **Dynamic Fields**: Farm name and location fields appear when "Farmer (Seller)" is selected
- **Validation**: Frontend validates farm fields before submission
- **State Management**: Added `registerFarmName` and `registerFarmLocation` state

#### 2. Smart Redirects
- **Customers** → `/dashboard`
- **Farmers** → `/farmer-dashboard`
- **Admins** → `/admin`

#### 3. Header Navigation (client/components/Header.tsx)
- **My Dashboard Link**: Visible only for logged-in farmers
- **Desktop Navigation**: Shows between Marketplace and About
- **Mobile Navigation**: Included in hamburger menu
- **User Dropdown**: Dashboard link redirects based on role

## User Flow

### Customer Registration
1. Select "Customer" from role dropdown
2. Enter: Name, Email, Password
3. Click "Create Account"
4. Redirected to `/dashboard`

### Farmer Registration
1. Select "Farmer (Seller)" from role dropdown
2. Enter: Name, Email, Password
3. **Additional Fields Appear**: Farm Name, Farm Location
4. Click "Create Account"
5. Redirected to `/farmer-dashboard`

### Customer Login
1. Select "Customer" from role dropdown
2. Enter: Email, Password
3. Click "Sign In"
4. ✅ Success if account is registered as Customer
5. ❌ Error if account is registered as Farmer

### Farmer Login
1. Select "Farmer (Seller)" from role dropdown
2. Enter: Email, Password
3. Click "Sign In"
4. ✅ Success if account is registered as Farmer
5. ❌ Error if account is registered as Customer

## Database Schema

### User Model Fields
```typescript
{
  email: String,
  password: String (hashed),
  name: String,
  role: 'user' | 'farmer' | 'admin',
  farmName: String (required for farmers),
  farmLocation: String (required for farmers),
  // ... other fields
}
```

## API Endpoints

### POST /api/auth/register
**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "password123",
  "name": "John Farmer",
  "role": "farmer",
  "farmName": "Green Valley Farm",
  "farmLocation": "California, USA",
  "remember": true
}
```

**Response (Success):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "farmer@example.com",
    "name": "John Farmer",
    "role": "farmer",
    "farmName": "Green Valley Farm",
    "farmLocation": "California, USA",
    "profileComplete": true
  }
}
```

**Response (Error - Missing Farm Details):**
```json
{
  "error": "Farm name and location are required for farmer registration"
}
```

### POST /api/auth/login
**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "password123",
  "role": "farmer",
  "remember": true
}
```

**Response (Success):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "farmer@example.com",
    "name": "John Farmer",
    "role": "farmer",
    "farmName": "Green Valley Farm",
    "farmLocation": "California, USA",
    "profileComplete": true
  }
}
```

**Response (Error - Role Mismatch):**
```json
{
  "error": "This account is registered as a Farmer. Please login using the Farmer option."
}
```

## Security Features

1. **Role Immutability**: Once registered, a user's role cannot be changed through login
2. **Credential Validation**: Password must match AND role must match
3. **Clear Error Messages**: Users know exactly why login failed
4. **JWT Security**: Token includes role for server-side validation
5. **Farm Data Protection**: Farm details only returned for farmer accounts

## Benefits

1. **Data Integrity**: Prevents accidental role switching
2. **Clear Separation**: Customers and farmers have distinct experiences
3. **Better UX**: Users see appropriate dashboards and features
4. **Security**: Role-based access control is enforced at authentication level
5. **Scalability**: Easy to add more roles (e.g., wholesaler, distributor)

## Testing Scenarios

### Scenario 1: Customer tries to login as Farmer
- **Setup**: Register as Customer with email `customer@test.com`
- **Action**: Try to login with role="farmer"
- **Expected**: Error message about account not being registered as Farmer

### Scenario 2: Farmer tries to login as Customer
- **Setup**: Register as Farmer with email `farmer@test.com`
- **Action**: Try to login with role="user"
- **Expected**: Error message about account being registered as Farmer

### Scenario 3: Farmer registration without farm details
- **Setup**: Select Farmer role in registration
- **Action**: Try to register without farm name/location
- **Expected**: Error message about required farm details

### Scenario 4: Successful Farmer login
- **Setup**: Register as Farmer with all details
- **Action**: Login with role="farmer"
- **Expected**: Success, redirected to `/farmer-dashboard`

### Scenario 5: Successful Customer login
- **Setup**: Register as Customer
- **Action**: Login with role="user"
- **Expected**: Success, redirected to `/dashboard`

## Future Enhancements

1. **Role Migration**: Admin feature to convert customer to farmer
2. **Multi-Role Support**: Users can have multiple roles
3. **Role Verification**: Email/document verification for farmers
4. **Role-Based Pricing**: Different pricing for different roles
5. **Role Analytics**: Track registration by role type
