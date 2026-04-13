# vezura E-commerce Database Migrations

This directory contains SQL migration files for setting up the vezura jewelry e-commerce database.

## Migration Files

### 1. `001_initial_schema.sql`
Creates all the core tables for the e-commerce system:
- **products** - Product catalog
- **customers** - Customer information
- **addresses** - Customer addresses
- **shipping_zones** - Geographic zones for delivery
- **shipping_carriers** - Shipping providers (Delhivery, Bluedart, etc.)
- **shipping_methods** - Delivery methods (Standard, Express)
- **delivery_charge_rules** - Dynamic delivery pricing rules
- **pincode_serviceability** - Pincode-wise delivery availability
- **orders** - Customer orders
- **order_items** - Items in each order
- **categories** - Product categories
- **carts** - Persistent cart (optional)
- **wishlist** - Persistent wishlist (optional)

### 2. `002_seed_data.sql`
Populates the database with initial data:
- Shipping zones (Metro, Tier 2, Rest of India)
- Shipping carriers and methods
- Delivery charge rules with zone-based pricing
- Major pincodes for metro cities (Mumbai, Delhi, Bangalore, Hyderabad, Pune)
- Product categories

## How to Use

### For SQLite (Development)

```bash
# Create a new database
sqlite3 database/vezura.db

# Run migrations
sqlite3 database/vezura.db < database/migrations/001_initial_schema.sql
sqlite3 database/vezura.db < database/migrations/002_seed_data.sql

# Or run from SQLite CLI
sqlite> .read database/migrations/001_initial_schema.sql
sqlite> .read database/migrations/002_seed_data.sql
```

### For MySQL (Production)

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE vezura_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations (convert AUTOINCREMENT to AUTO_INCREMENT)
mysql -u root -p vezura_db < database/migrations/001_initial_schema.sql
mysql -u root -p vezura_db < database/migrations/002_seed_data.sql
```

**Note for MySQL:** Replace `AUTOINCREMENT` with `AUTO_INCREMENT` and `BOOLEAN` with `TINYINT(1)`.

### For PostgreSQL (Production)

```bash
# Create database
createdb vezura_db

# Run migrations (convert syntax)
psql vezura_db < database/migrations/001_initial_schema.sql
psql vezura_db < database/migrations/002_seed_data.sql
```

**Note for PostgreSQL:**
- Replace `AUTOINCREMENT` with `SERIAL`
- Replace `BOOLEAN` with `BOOLEAN` (works)
- Replace `TIMESTAMP` with `TIMESTAMPTZ`
- Use `$$` for JSON strings or `::jsonb` cast

## Delivery Charge Structure

### Metro Zone (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune)
- **Standard Delivery**: ₹49 (Free above ₹699)
- **Express Delivery**: ₹79 (Free above ₹999)
- **COD**: No extra charge
- **Delivery Time**: 2-3 days

### Tier 2 Zone (Ahmedabad, Surat, Jaipur, Lucknow, etc.)
- **Standard Delivery**: ₹69 (Free above ₹999)
- **Express Delivery**: ₹99 (Free above ₹1499)
- **COD**: No extra charge
- **Delivery Time**: 3-5 days

### Rest of India
- **Standard Delivery**: ₹89 (Free above ₹1499)
- **Express Delivery**: ₹129 (Free above ₹1999)
- **COD**: No extra charge
- **Delivery Time**: 5-7 days

## Pincode Coverage

The seed data includes major pincodes for:
- Mumbai (400xxx): 20+ pincodes
- Delhi (110xxx): 20+ pincodes
- Bangalore (560xxx): 100+ pincodes
- Hyderabad (500xxx): 100+ pincodes
- Pune (411xxx): 100+ pincodes

**To add more pincodes:**
1. Import from Indian Postal Service data
2. Buy pincode database from vendors
3. Use shipping carrier APIs for real-time checking

## Database Schema Overview

```
customers (1) ----< (N) orders (1) ----< (N) order_items
    |                    |
    |                    |
    v                    v
addresses          products (lookup)

shipping_zones (1) ----< (N) delivery_charge_rules
shipping_carriers (1) ----< (N) shipping_methods (1) ----< (N) delivery_charge_rules

pincode_serviceability (N) ---- (1) shipping_zones
```

## Next Steps

1. **Set up your database** using the migration files above
2. **Configure database connection** in your Next.js app
3. **Create API routes** for:
   - Delivery charge calculation
   - Pincode serviceability check
   - Order placement
   - Order management

## Recommended Node.js Libraries

- **SQLite**: `better-sqlite3` (development)
- **MySQL**: `mysql2` or `sequelize`
- **PostgreSQL**: `pg` or `prisma`
- **Query Builder**: `knex.js` (works with all databases)

## API Integration (Future)

For production, consider integrating:
- **Shiprocket API**: https://apiv2.shiprocket.in
- **Delhivery API**: https://track.delhivery.com/api
- **Bluedart API**: https://api.bluedart.com

These provide:
- Real-time shipping rates
- Courier recommendation
- Shipment tracking
- Automated NDR handling

---

For questions or issues, contact the development team.
