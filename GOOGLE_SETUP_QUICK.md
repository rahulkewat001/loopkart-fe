# Quick Google OAuth Setup

## Error: "The OAuth client was not found" - How to Fix

### Step 1: Create Google OAuth Credentials (5 minutes)

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project:**
   - Click "Select a project" at the top
   - Click "NEW PROJECT"
   - Name it "LoopKart" (or any name)
   - Click "CREATE"

3. **Enable Google+ API:**
   - In the left menu, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "ENABLE"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "CREATE CREDENTIALS" > "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - Choose "External"
     - Fill in App name: "LoopKart"
     - Add your email
     - Click "SAVE AND CONTINUE" through all steps
   
5. **Configure OAuth Client:**
   - Application type: "Web application"
   - Name: "LoopKart Web Client"
   - Authorized JavaScript origins:
     - Click "ADD URI"
     - Add: `http://localhost:5173`
     - Click "ADD URI" again
     - Add your production URL (if you have one)
   - Authorized redirect URIs:
     - Click "ADD URI"
     - Add: `http://localhost:5173`
   - Click "CREATE"

6. **Copy Your Client ID:**
   - A popup will show your credentials
   - Copy the "Client ID" (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
   - Click "OK"

### Step 2: Add Client ID to Your Project

1. **Open your `.env` file:**
   - Location: `frontend/.env`

2. **Add your Client ID:**
   ```
   VITE_API_URL=https://loopkart-be.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   ```
   Replace `YOUR_CLIENT_ID_HERE` with the actual Client ID you copied

3. **Save the file**

### Step 3: Restart Your Development Server

1. **Stop the frontend server** (Ctrl+C in terminal)

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Test Google Login:**
   - Go to login page
   - Click "Continue with Google"
   - Should work now! ✅

## Important Notes

- ⚠️ **Never commit your `.env` file** to Git (it's already in .gitignore)
- 🔒 Keep your Client ID secure
- 🌐 For production, add your production domain to authorized origins
- 🔄 Always restart the dev server after changing `.env` files

## Troubleshooting

### Still getting "invalid_client" error?
- Make sure you copied the entire Client ID
- Check that there are no extra spaces in the `.env` file
- Restart the dev server

### "Redirect URI mismatch" error?
- Make sure `http://localhost:5173` is in authorized JavaScript origins
- Check the port number matches your dev server

### Google button not showing?
- Check browser console for errors
- Make sure the Client ID is set in `.env`
- Verify the dev server restarted after adding the Client ID

## Need Help?

If you're still having issues:
1. Check the browser console (F12) for error messages
2. Verify your Client ID is correct in Google Cloud Console
3. Make sure the Google+ API is enabled
4. Confirm authorized origins include your exact URL
