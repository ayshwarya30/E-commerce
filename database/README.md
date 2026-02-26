# Database Mock Data

This folder contains mock JSON data for MongoDB collections used by the backend.

## Files

- `mock/products.json`
- `mock/cart_items.json`
- `mock/wishlist_items.json`
- `mock/orders.json`

## One-command import (Windows CMD/PowerShell)

From project root:

```powershell
.\database\import-mock-data.cmd
```

With custom Mongo URI:

```powershell
.\database\import-mock-data.cmd "mongodb://localhost:27017/ecommerce"
```

## Notes

- Import command uses `--drop`, so each target collection is replaced.
- Default URI is `mongodb://localhost:27017/ecommerce`.
- Ensure MongoDB server is running before import.
- Script auto-detects `mongoimport` from Scoop MongoDB Database Tools.
