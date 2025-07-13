# ECHO App Setup Guide

## Resolving the Timeout Error

The timeout error you're experiencing is likely due to the backend server not running or network connectivity issues. Here's how to fix it:

### 1. Backend Setup

First, make sure your backend server is running:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/echo_app
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ARCJET_KEY=your_arcjet_key
```

Start the backend server:

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server is running on PORT: 5001
📱 API URL: http://localhost:5001/api
```

### 2. Mobile App Setup

In the mobile directory, update the API URL in `mobile/utils/api.ts`:

For development on simulator/emulator:
```typescript
const API_BASE_URL = "http://localhost:5001/api";
```

For development on physical device, use your computer's IP address:
```typescript
const API_BASE_URL = "http://YOUR_COMPUTER_IP:5001/api";
```

To find your computer's IP:
- **Mac/Linux**: `ifconfig` or `ip addr`
- **Windows**: `ipconfig`

### 3. Environment Variables

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:5001/api
```

### 4. Start the Mobile App

```bash
cd mobile
npm install
npx expo start
```

### 5. Troubleshooting

If you still get timeout errors:

1. **Check if backend is running**: Visit `http://localhost:5001` in your browser
2. **Check network connectivity**: Make sure your device can reach the backend
3. **Check firewall settings**: Ensure port 5001 is not blocked
4. **Use ngrok for testing**: If local network doesn't work, use ngrok to expose your local server

### 6. Using ngrok (Alternative)

If local network doesn't work, you can use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 5001

# Use the ngrok URL in your mobile app
const API_BASE_URL = "https://your-ngrok-url.ngrok.io/api";
```

### 7. Database Setup

Make sure MongoDB is running locally or use MongoDB Atlas:

```bash
# Install MongoDB locally
brew install mongodb-community  # Mac
# or download from mongodb.com

# Start MongoDB
mongod
```

The timeout error should be resolved once the backend is properly running and accessible from your mobile app. 