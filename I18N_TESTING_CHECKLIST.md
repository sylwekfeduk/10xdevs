# i18n Testing Checklist

## Test Setup
Server is running on: **http://localhost:3001**

## Test 1: English Routes (No Authentication Required)
Visit these URLs and check if they work:

- [ ] http://localhost:3001/login
  - **Expected**: Login form in English
  - **Actual**: _____________________

- [ ] http://localhost:3001/register
  - **Expected**: Registration form in English
  - **Actual**: _____________________

## Test 2: Polish Routes (No Authentication Required)
Visit these URLs and check if they work:

- [ ] http://localhost:3001/pl/login
  - **Expected**: Login form in Polish (Polski)
  - **Actual**: _____________________

- [ ] http://localhost:3001/pl/register
  - **Expected**: Registration form in Polish
  - **Actual**: _____________________

## Test 3: Protected Routes (Requires Login)

### Step 1: Log in first
1. Go to http://localhost:3001/login
2. Log in with your credentials
3. You should be redirected to `/dashboard`

### Step 2: Test English protected routes
- [ ] http://localhost:3001/dashboard
  - **Expected**: Dashboard page in English
  - **Actual**: _____________________

- [ ] http://localhost:3001/recipes
  - **Expected**: Recipes page in English
  - **Actual**: _____________________

### Step 3: Test Polish protected routes
- [ ] http://localhost:3001/pl/dashboard
  - **Expected**: Dashboard page in Polish
  - **Actual**: _____________________

- [ ] http://localhost:3001/pl/recipes
  - **Expected**: Recipes page in Polish
  - **Actual**: _____________________

## Test 4: Language Switcher

### While logged in on English dashboard:
1. Visit http://localhost:3001/dashboard
2. Click the globe icon (🌐) in the header
3. Select "Polski"
   - **Expected**: Redirect to http://localhost:3001/pl/dashboard
   - **Actual**: _____________________

### While logged in on Polish dashboard:
1. Visit http://localhost:3001/pl/dashboard
2. Click the globe icon (🌐) in the header
3. Select "English"
   - **Expected**: Redirect to http://localhost:3001/dashboard
   - **Actual**: _____________________

## Test 5: Middleware Redirects

### Test unauthenticated access:
- [ ] Visit http://localhost:3001/dashboard (without logging in)
  - **Expected**: Redirect to `/login`
  - **Actual**: _____________________

- [ ] Visit http://localhost:3001/pl/dashboard (without logging in)
  - **Expected**: Redirect to `/pl/login`
  - **Actual**: _____________________

### Test authenticated access to auth pages:
- [ ] Visit http://localhost:3001/login (while logged in)
  - **Expected**: Redirect to `/dashboard`
  - **Actual**: _____________________

- [ ] Visit http://localhost:3001/pl/login (while logged in)
  - **Expected**: Redirect to `/pl/dashboard`
  - **Actual**: _____________________

## Common Issues & Solutions

### Issue: 404 Not Found on `/pl/dashboard`

**Possible causes:**
1. **Not logged in**: Middleware redirects to `/pl/login`
   - Solution: Log in first, then visit the page

2. **Astro routing not working**: Page doesn't exist
   - Check: Does `/dashboard` work in English?
   - If English works but Polish doesn't, it's a routing config issue

3. **Middleware blocking**: Check browser network tab
   - Look for redirects (302/301 responses)
   - See where the request is actually going

### Issue: Language switcher causes 404

**Solution**: Make sure you're logged in when accessing protected routes

### Issue: Translations not showing

**Solution**: Clear browser cache and reload

## Debug Commands

### Check if server is running:
```bash
curl http://localhost:3001/
```

### Check if English login works:
```bash
curl -I http://localhost:3001/login
```

### Check if Polish login works:
```bash
curl -I http://localhost:3001/pl/login
```

### Check browser console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Go to Network tab
5. Try visiting `/pl/dashboard`
6. Check what HTTP status code you get (200, 302, 404, etc.)

## Reporting Issues

If something doesn't work, please provide:
1. **URL you visited**: _____________________
2. **Are you logged in?**: Yes / No
3. **What you see**: _____________________
4. **HTTP status code** (from Network tab): _____________________
5. **Any console errors**: _____________________
6. **Screenshot** (if possible)

This will help diagnose the exact issue!