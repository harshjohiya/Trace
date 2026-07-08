import requests

url = "https://umyczzwobdyroimkygjc.supabase.co/auth/v1/user"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWN6endvYmR5cm9pbWt5Z2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzY0NjgsImV4cCI6MjA5NDc1MjQ2OH0.cUaEGClD7qwRMwtxi5B01uW5BJ0bE-EN-OLG5NnpldM"

# Provide a dummy token just to see the format of the response
dummy_token = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.x"

r = requests.get(url, headers={
    "apikey": anon_key,
    "Authorization": f"Bearer {dummy_token}"
})
print("Status:", r.status_code)
print("Response:", r.text)
