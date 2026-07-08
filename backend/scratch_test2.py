import requests
import json

anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWN6endvYmR5cm9pbWt5Z2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzY0NjgsImV4cCI6MjA5NDc1MjQ2OH0.cUaEGClD7qwRMwtxi5B01uW5BJ0bE-EN-OLG5NnpldM"

print("Testing /rest/v1/")
r = requests.get("https://umyczzwobdyroimkygjc.supabase.co/rest/v1/", headers={"apikey": anon_key})
print(r.status_code, r.text[:200])

# Maybe there is no JWKS endpoint natively? Wait, there is no official Supabase JWKS endpoint for REST API.
# It is usually /auth/v1/jwks, let me try without any auth headers, maybe it just works now?
r2 = requests.get("https://umyczzwobdyroimkygjc.supabase.co/auth/v1/jwks")
print("/auth/v1/jwks status:", r2.status_code, r2.text[:200])

# Supabase JWK usually looks like this? Let's check Supabase docs or GitHub issues.
