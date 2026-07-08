import requests

url = "https://umyczzwobdyroimkygjc.supabase.co/auth/v1/.well-known/jwks.json"

r = requests.get(url)
print("Status:", r.status_code)
print("Response:", r.text[:200])
