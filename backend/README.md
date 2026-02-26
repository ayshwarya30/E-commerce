# E-commerce Backend (Spring Boot + MongoDB + Gemini)

For complete full-stack setup and run guide, use the root README:
- `../README.md`

## Quick Backend Start

```powershell
cd backend
.\start-backend.cmd
```

## Quick Backend Stop

```powershell
powershell -ExecutionPolicy Bypass -File .\stop-backend.ps1
```

## Required Backend Env

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/ecommerce"
$env:GEMINI_API_KEY="your_api_key_here"
$env:GEMINI_MODEL="gemini-1.5-flash"
$env:FRONTEND_ORIGIN="http://localhost:5173"
$env:SERVER_PORT="8080"
```
