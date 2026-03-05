# 🔥 FIREBASE PROJECT MIGRATION GUIDE

## 📋 CURRENT SITUATION
- **Old Project**: `body-of-christ-254` ❌
- **New Project**: `children-welfare-project` ✅
- **Status**: Frontend updated, Backend needs new service account key

## 🎯 WHAT YOU NEED TO DO

### Step 1: Download New Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **children-welfare-project**
3. Go to **Project Settings** ⚙️ → **Service Accounts**
4. Click **"Generate new private key"**
5. Select **JSON** format
6. Download the file

### Step 2: Update Backend Environment
1. Open the downloaded JSON file
2. Copy these values to your backend `.env`:
   ```
   FIREBASE_PROJECT_ID=children-welfare-project
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@children-welfare-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nPASTE_YOUR_NEW_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   ```

### Step 3: Replace Service Account File
1. Replace the old service account file:
   - **Old**: `body-of-christ-254-firebase-adminsdk-fbsvc-3a6d96dd47.json`
   - **New**: `children-welfare-project-firebase-adminsdk-xxxxx.json`

### Step 4: Restart Backend
```bash
npm run dev
```

## 🔍 VERIFICATION CHECKLIST

After migration, verify:
- [ ] Backend starts without Firebase errors
- [ ] Frontend can authenticate with new project
- [ ] Admin user `ngureian64@gmail.com` can login
- [ ] Admin dashboard accessible
- [ ] All CRUD operations working

## ⚠️ IMPORTANT NOTES

1. **Admin User**: The admin user `ngureian64@gmail.com` needs to be created in the NEW Firebase project
2. **Custom Claims**: You may need to re-set admin custom claims in the new project
3. **Environment**: Make sure both frontend and backend use the same project ID

## 🚨 CURRENT ISSUE

Your frontend is configured for `children-welfare-project` but your backend still has the old service account key for `body-of-christ-254`.

**This mismatch will cause authentication failures!**

## 🎯 NEXT STEPS

1. **Download new service account key** from Firebase Console
2. **Update backend `.env`** with new credentials  
3. **Restart backend**
4. **Test authentication**

---

**📞 Need help? The service account key download is the critical missing piece!**
