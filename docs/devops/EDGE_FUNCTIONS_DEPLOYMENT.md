# Edge Functions Deployment Guide

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Access to Supabase project: `<PROJECT_ID>`

## Deployment Commands

### 1. Link Project (First Time Only)
```bash
cd /home/hriday/skhyai-website/skhy-ai-website
npx supabase link --project-ref <PROJECT_ID>
```

### 2. Deploy Edge Functions
```bash
# Deploy verify-admin function
npx supabase functions deploy verify-admin --no-verify-jwt

# Deploy bank transfer details function  
npx supabase functions deploy get-bank-transfer-details --no-verify-jwt
```

> **Note:** The `--no-verify-jwt` flag is used because these functions handle their own authentication logic.

### 3. Verify Deployment
```bash
# List all deployed functions
npx supabase functions list

# Check function logs
npx supabase functions logs verify-admin
npx supabase functions logs get-bank-transfer-details
```

## Alternative: Manual Deployment via Dashboard

If CLI deployment fails:

1. Go to [Supabase Dashboard → Functions](https://supabase.com/dashboard/project/<PROJECT_ID>/functions)
2. Click "Create new function"
3. Name: `verify-admin`
4. Copy code from `supabase/functions/verify-admin/index.ts`
5. Deploy
6. Repeat for `get-bank-transfer-details`

## Testing Deployed Functions

### Test verify-admin
```bash
curl -i --location --request POST 'https://<PROJECT_ID>.functions.supabase.co/verify-admin' \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'Content-Type: application/json'
```

### Test get-bank-transfer-details
```bash
curl -i --location --request POST 'https://<PROJECT_ID>.functions.supabase.co/get-bank-transfer-details' \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'Content-Type: application/json'
```

## Environment Variables

Functions have access to:
- `SUPABASE_URL` (auto-injected)
- `SUPABASE_ANON_KEY` (auto-injected)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-injected)

No additional environment variables needed.

## Troubleshooting

### Function Not Found
- Ensure project is linked: `npx supabase link`
- Verify function directory structure

### Deployment Fails
- Check Supabase CLI version: `npx supabase --version`
- Update if needed: `npm install -g supabase@latest`

### Function Errors
- Check logs: `npx supabase functions logs <function-name>`
- Test locally: `npx supabase functions serve`
