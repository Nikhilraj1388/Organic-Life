# Connecting to MongoDB with MongoDB Compass

This guide explains how to connect MongoDB Compass to your database using the same connection string as your application.

## Connection String

Your MongoDB connection string is configured in the `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/organic-life
```

**Copy this connection string** (without the `MONGODB_URI=` part):
```
mongodb://localhost:27017/organic-life
```

## Steps to Connect with MongoDB Compass

1. **Open MongoDB Compass**
   - If you don't have MongoDB Compass installed, download it from: https://www.mongodb.com/try/download/compass

2. **Enter Connection String**
   - In MongoDB Compass, you'll see a connection string input field
   - Paste the connection string: `mongodb://localhost:27017/organic-life`
   - Or click "Fill in connection fields individually" and enter:
     - Host: `localhost`
     - Port: `27017`
     - Authentication: None (if using local MongoDB without auth)
     - Database: `organic-life`

3. **Connect**
   - Click the "Connect" button
   - If successful, you'll see your database and collections

## Database Name

The database name is: **`organic-life`**

This matches the database name in your connection string.

## Collections in Your Database

Once connected, you should see collections such as:
- `users` - User accounts and authentication data
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Order history
- `carts` - Shopping carts
- `profiles` - User profiles
- `promotions` - Promotional offers

## Local MongoDB Setup

If you don't have MongoDB installed locally:

### Windows
```bash
# Using Chocolatey
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community
```

### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Alternative Connection Strings

### MongoDB Atlas (Cloud)
If you're using MongoDB Atlas, update your `.env` file with:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/organic-life?retryWrites=true&w=majority
```

### With Authentication
If your local MongoDB requires authentication:
```
MONGODB_URI=mongodb://username:password@localhost:27017/organic-life?authSource=admin
```

## Testing the Connection

### Test from Application
Start your development server:
```bash
pnpm dev
```

Look for this message in the console:
```
✅ Connected to MongoDB: mongodb://localhost:27017/organic-life
```

### Test with MongoDB Compass
1. Open MongoDB Compass
2. Enter the connection string
3. Click "Connect"
4. You should see your database and collections

## Troubleshooting

### Connection Failed / Connection Error

**Common Error Messages and Solutions:**

1. **"ECONNREFUSED" or "connect ECONNREFUSED"**
   - **Cause**: MongoDB is not running
   - **Solution**:
     - Windows: Check services: `Get-Service "*mongo*"`
     - Start MongoDB service if installed
     - If not installed, install MongoDB Community Edition
     - Verify MongoDB is listening on port 27017

2. **"Connection timeout" or "Server selection timeout"**
   - **Cause**: MongoDB is not responding
   - **Solution**:
     - Check if MongoDB service is running
     - Verify firewall is not blocking port 27017
     - Check if another application is using port 27017
     - Try using `127.0.0.1` instead of `localhost`

3. **"Authentication failed"**
   - **Cause**: Wrong username/password or authSource
   - **Solution**:
     - Verify credentials in connection string
     - Check `authSource` parameter (usually `admin`)
     - Ensure user has permissions for the database

4. **"No connection string provided" or "Missing MongoDB connection URL"**
   - **Cause**: `.env` file not loaded or missing variable
   - **Solution**:
     - Ensure `.env` file exists in project root
     - Check `MONGODB_URI` is set correctly
     - Restart your development server after changing `.env`

### Check Your Connection

Use the diagnostic script to check your connection:

```bash
npm run check:db
# or
tsx scripts/check-mongo-connection.ts
```

This will:
- ✅ Check environment variables
- ✅ Parse connection URL
- ✅ Test connection
- ✅ Show connection state
- ✅ List collections if connected

### Can't See Collections
- Collections are created when you first insert data
- If your application hasn't created any data yet, collections may not appear
- Try creating a user or product through your application first

### MongoDB Not Installed

If MongoDB is not installed on your system:

**Windows:**
```bash
# Using Chocolatey
choco install mongodb

# Or download installer from:
# https://www.mongodb.com/try/download/community
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Alternative: Use MongoDB Atlas (Cloud)

If you don't want to install MongoDB locally, you can use MongoDB Atlas (free tier available):

1. Sign up at: https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get your connection string
4. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/organic-life?retryWrites=true&w=majority
   ```
5. Use the same connection string in MongoDB Compass

## Using the Same Connection String

**Important**: The connection string in your `.env` file is the **exact same** connection string you use in MongoDB Compass. This ensures both your application and Compass connect to the same database.

Example:
- `.env` file: `MONGODB_URI=mongodb://localhost:27017/organic-life`
- MongoDB Compass: `mongodb://localhost:27017/organic-life` (same string)

