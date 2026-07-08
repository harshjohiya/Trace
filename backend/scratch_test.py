import jwt
from jwt import PyJWKClient
import sys
import os
import requests

anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWN6endvYmR5cm9pbWt5Z2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzY0NjgsImV4cCI6MjA5NDc1MjQ2OH0.cUaEGClD7qwRMwtxi5B01uW5BJ0bE-EN-OLG5NnpldM"
url = "https://umyczzwobdyroimkygjc.supabase.co/rest/v1/" # or /auth/v1/jwks ? Let's check with requests

print("Testing /auth/v1/jwks")
r1 = requests.get("https://umyczzwobdyroimkygjc.supabase.co/auth/v1/jwks", headers={"apikey": anon_key})
print(r1.status_code, r1.text[:200])

print("Testing /rest/v1/")
r2 = requests.get("https://umyczzwobdyroimkygjc.supabase.co/rest/v1/", headers={"apikey": anon_key})
print(r2.status_code, r2.text[:200])
