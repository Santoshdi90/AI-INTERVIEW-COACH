# 14. Backup & Disaster Recovery

## 1. Database Backup & Restore (Neon PostgreSQL)

### Automated Backups
- Neon Serverless PostgreSQL automatically takes point-in-time state snapshots and branch restore points.

### Manual SQL Dump Backup
Export full schema and data using `pg_dump`:
```bash
pg_dump "postgresql://neondb_owner:npg_8gMef2YxzRQl@ep-restless-forest-a79skh4c-pooler.ap-southeast-2.aws.neon.tech/Aicoach?sslmode=require" \
  --format=custom \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump
```

### Manual Database Restoration
Restore from custom dump file:
```bash
pg_restore --clean --no-owner --dbname="<DATABASE_URL>" backup_20260804_120000.dump
```

---

## 2. Accidental Data Loss Recovery

If candidate data or tables are accidentally corrupted:
1. Access [Neon Console Dashboard](https://console.neon.tech/).
2. Create a new **Database Branch** from a snapshot timestamp prior to data loss.
3. Update `DATABASE_URL` in Render environment variables to point to the restored branch.
4. Verify backend health endpoint (`GET /health`).

---

## 3. Storage Recovery
- Resumes uploaded in local mode persist in `backend/uploads/resumes/`.
- Resumes uploaded in Cloudinary mode are stored redundantly across Cloudinary's multi-region CDN.
