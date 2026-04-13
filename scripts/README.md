# ARAK Admin — Data Seeder

Seeds production data from `db.backup.json` into the .NET backend via the REST API.

## Prerequisites

- ✅ Backend running on `http://localhost:7000/api`
- ✅ Admin account exists (`admin@arak.com` / `Admin@123`)
- ✅ Node.js 18+ (for native `fetch`)

## Usage

```bash
# Full seed (all entities)
npm run seed

# Dry run — shows what would be seeded without writing
npm run seed:dry

# Skip user accounts (seed only academic data)
npm run seed:skip-users

# Custom admin credentials
ADMIN_EMAIL=super@arak.com ADMIN_PASSWORD=Super@123 npm run seed

# Custom API URL
API_BASE_URL=http://192.168.1.100:7000/api npm run seed
```

## Seed Order

1. **Subjects** — lookup table (Math, Arabic, English, etc.)
2. **Classes** — Grade 4-A, 4-B, etc.
3. **Users** — admin/teacher/parent accounts
4. **Teachers** — teacher profiles (skipped if user already exists)
5. **Parents** — parent profiles
6. **Students** — student records
7. **Schedules** — timetable entries
8. **Evaluations** — grades/assessments (~50,000+ records)
9. **Events** — school calendar
10. **Tasks** — homework assignments

## Error Handling

- **409 Conflict** → record already exists, skipped
- **400 Unique violation** → duplicate email/ID, skipped
- **Connection refused** → fatal, backend not running
- **Login failure** → fatal, check admin credentials

## Stats

After completion, the script prints:
```
✓ Created : 1,234
⚠ Skipped : 567
✗ Errors  : 0
```

## Troubleshooting

| Issue | Fix |
|---|---|
| `Cannot connect to http://localhost:7000/api` | Start backend: `cd arak-backend\Arak.PLL && dotnet run` |
| `Login failed — no token returned` | Verify admin account exists in database |
| `ECONNREFUSED` | Backend is not running |
| `401 Unauthorized` | Admin credentials wrong — set `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars |
