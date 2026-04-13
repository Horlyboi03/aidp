# Test Auto-Navigation Feature

## Quick Test (2 minutes)

### Step 1: Login to Admin Dashboard
1. Go to https://aidpprogramapply.vercel.app/admin
2. Enter credentials:
   - Username: `horlyboi`
   - Password: `horlyboi03!`
3. Click "Sign In"

### Step 2: Navigate to Applications
1. Click "Application" tab
2. Wait for applications to load
3. You should see a list of applications

### Step 3: Test Message Button
1. Click "View" on any application
2. Application details modal opens
3. Scroll down to find "💬 Message Applicant" button
4. Click the button

### Step 4: Verify Auto-Navigation
✅ **Expected Behavior**:
- Toast shows: "💬 Opening conversation..."
- Auto-switches to "Messages" tab
- Conversation opens immediately
- You can see the applicant's name
- Message input field is ready
- No "go to messages tab" message

❌ **If Not Working**:
- Check browser console (F12 → Console)
- Look for error messages
- Check network tab for failed requests
- Refresh page and try again

---

## Detailed Test (5 minutes)

### Test 1: Basic Auto-Navigation
1. Login to admin dashboard
2. Go to Applications tab
3. Click "View" on first application
4. Click "💬 Message Applicant"
5. Verify auto-navigation works

### Test 2: Multiple Conversations
1. Go back to Applications tab
2. Click "View" on different application
3. Click "💬 Message Applicant"
4. Verify it opens the correct conversation
5. Go back and test with another application

### Test 3: Message Sending
1. After auto-navigation, type a message
2. Click "Send" button
3. Verify message appears in conversation
4. Check that message is sent to applicant

### Test 4: Responsive Design
1. Test on mobile (< 640px)
   - Verify layout is stacked
   - Verify message button works
   - Verify auto-navigation works

2. Test on tablet (640px - 1024px)
   - Verify layout is side-by-side
   - Verify message button works
   - Verify auto-navigation works

3. Test on desktop (> 1024px)
   - Verify full layout
   - Verify message button works
   - Verify auto-navigation works

---

## Console Debugging

### Open Browser Console
1. Press F12
2. Click "Console" tab
3. Look for these logs:

```
Registered navigateToMessages listener
Registered selectConversation listener
Dispatched navigateToMessages event: { conversationId: "...", applicantName: "...", applicantEmail: "..." }
Received navigateToMessages event: { conversationId: "...", applicantName: "...", applicantEmail: "..." }
Dispatched selectConversation event: { conversationId: "...", applicantName: "...", applicantEmail: "..." }
Received selectConversation event: { conversationId: "...", applicantName: "...", applicantEmail: "..." }
Found conversation, selecting it: conv-...
```

### If You See Errors
1. Note the error message
2. Check the Network tab (F12 → Network)
3. Look for failed API requests
4. Check if database is connected
5. Verify environment variables are set

---

## Expected Results

### ✅ Success Indicators
- Toast message appears: "💬 Opening conversation..."
- Tab automatically switches to "Messages"
- Conversation opens immediately
- Applicant name is displayed
- Message input field is active
- No console errors
- No "go to messages tab" message

### ❌ Failure Indicators
- Toast shows "Conversation started, go to messages tab to chat"
- Tab doesn't switch automatically
- Conversation doesn't open
- Console shows errors
- Network requests fail

---

## Troubleshooting

### Issue: Auto-navigation not working
**Solution**:
1. Refresh the page
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try in incognito mode
4. Check browser console for errors
5. Verify database connection

### Issue: Conversation doesn't open
**Solution**:
1. Check if conversation was created (check Messages tab)
2. Verify applicant email is correct
3. Check database for conversation record
4. Try creating a new conversation manually

### Issue: Message button not visible
**Solution**:
1. Scroll down in application details modal
2. Verify modal is fully loaded
3. Try refreshing the page
4. Check browser console for errors

### Issue: Console shows errors
**Solution**:
1. Note the exact error message
2. Check if it's a network error
3. Verify environment variables
4. Check database connection
5. Review Vercel deployment logs

---

## Performance Metrics

### Expected Performance
- Auto-navigation delay: < 500ms
- Conversation load time: < 1 second
- Message send time: < 2 seconds
- Page load time: < 2 seconds

### If Performance is Slow
1. Check network connection
2. Check browser performance (F12 → Performance)
3. Check Vercel deployment status
4. Check database performance
5. Monitor server logs

---

## Test Checklist

- [ ] Login successful
- [ ] Applications load
- [ ] Application details modal opens
- [ ] Message button visible
- [ ] Message button clickable
- [ ] Toast message appears
- [ ] Tab switches to Messages
- [ ] Conversation opens
- [ ] Applicant name displayed
- [ ] Message input ready
- [ ] Can send message
- [ ] Message appears in conversation
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

---

## Report Results

If testing is successful:
✅ Feature is working correctly

If testing fails:
❌ Check console logs
❌ Review error messages
❌ Check network requests
❌ Verify database connection
❌ Contact support if needed

---

**Test Date**: April 13, 2026
**Feature**: Auto-Navigation to Messages Tab
**Status**: Ready for Testing
