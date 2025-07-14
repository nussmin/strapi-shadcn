
```bash
curl -i -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
        "identifier": "user@gmail.com",
        "password": "ABC@112358"
      }' \
  -c cookiejar.txt
```