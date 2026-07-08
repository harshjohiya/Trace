import requests

url = "https://umyczzwobdyroimkygjc.supabase.co/rest/v1/jwks"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWN6endvYmR5cm9pbWt5Z2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzY0NjgsImV4cCI6MjA5NDc1MjQ2OH0.cUaEGClD7qwRMwtxi5B01uW5BJ0bE-EN-OLG5NnpldM"

r = requests.get(url, headers={"apikey": anon_key})
print("Status:", r.status_code)
print("Response:", r.text[:200])
