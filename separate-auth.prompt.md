# Separate Authentication for Farmers, Customers, and Admin

A prompt to implement separate login authentication systems for farmers, customers, and admin users in the Organic Life application, using a single login page with role selection.

## Overview

The current authentication system supports 'user' and 'admin' roles. This prompt guides implementing separate authentication flows for three distinct user types:
- **Farmers**: Producers/suppliers who manage their products (with additional profile fields: farm name, location)
- **Customers**: Buyers who purchase products (existing 'user' role users)
- **Admin**: System administrators with full access

Existing users can choose to be either customers or farmers during login/registration.

## Requirements

- Maintain backward compatibility with existing users
- Use a single login page with role selection for all user types
- Create separate registration and login endpoints that handle role-specific logic
- Implement role-based access control (RBAC) throughout the application
- Update client-side authentication context to handle all three roles
- Ensure secure separation between user types
- Add farmer-specific profile fields: farm name, location

## Implementation Steps

### 1. Update User Model
- Modify `server/models/User.ts` to include 'farmer' in the role enum alongside 'user' (customer) and 'admin'
- Add farmer-specific fields: `farmName`, `farmLocation`
- Ensure existing 'user' role users can be treated as customers
- Allow users to switch between customer and farmer roles if needed

### 2. Update Authentication Routes
- Modify `server/routes/auth.ts` to handle role selection during registration/login
- Update registration schema to include optional farmer fields (farmName, farmLocation) when role is 'farmer'
- Update JWT token generation to include the specific role
- Ensure password hashing and verification work for all roles
- Allow existing users to login and specify their role (customer or farmer)

### 3. Update Client-Side Authentication
- Modify `client/contexts/AuthContext.tsx` to support 'farmer' role alongside 'user' and 'admin'
- Update User interface to include farmer-specific fields
- Ensure login/register functions can specify the desired role
- Update token verification to handle all roles
- Modify login forms to include role selection (customer/farmer/admin)

### 4. Implement Role-Based Routing
- Update `AdminRoute.tsx` and `ProtectedRoute.tsx` to handle farmer routes
- Create separate protected routes for farmer-specific pages (e.g., product management)
- Ensure customers cannot access admin or farmer areas, and farmers cannot access admin areas

### 5. Update UI Components
- Modify login/registration forms to include role selection dropdown
- Add conditional fields for farmers (farm name, location) during registration
- Update navigation and menus based on user role
- Create farmer-specific pages (dashboard, product management, etc.)

### 6. Database Migration
- Existing 'user' role users remain as 'user' (customers) by default
- Allow users to update their role to 'farmer' through profile settings
- Ensure backward compatibility with existing authentication

## Security Considerations

- Ensure farmers cannot access admin functions
- Customers should only access customer-specific features
- Farmers should only access farmer-specific features plus customer features
- Implement proper authorization checks on all API endpoints
- Use role-based middleware for route protection

## Testing

- Test registration and login for each user type with role selection
- Verify role-based access control works correctly
- Test farmer-specific profile fields
- Test token verification and session management
- Ensure backward compatibility with existing users
- Test role switching for existing users

## Files to Modify

- `server/models/User.ts`
- `server/routes/auth.ts`
- `client/contexts/AuthContext.tsx`
- `client/components/AdminRoute.tsx`
- `client/components/ProtectedRoute.tsx`
- `client/pages/Login.tsx` (and related auth pages)
- `shared/api.ts` (update types if needed)
- New farmer-specific pages and components

## Arguments

- `user_type`: The specific user type to focus on ('farmer', 'customer', or 'admin')
- `current_role`: The current role in the codebase ('user' or 'admin')