# 13. Maintenance & Developer Guide

Guidelines for future developers maintaining or extending the codebase.

---

## 1. Adding a New API Endpoint

1. **Define Validation Rules**: Add Zod or `express-validator` middleware rules in `src/routes/`.
2. **Define Controller Handler**: Add standard handler in `src/controllers/`:
   ```typescript
   export const newFeatureController = {
     async execute(req: Request, res: Response, next: NextFunction) {
       try {
         const result = await newFeatureService.execute(req.body);
         res.json({ success: true, message: 'Success', data: result });
       } catch (err) { next(err); }
     }
   };
   ```
3. **Implement Service Logic**: Add business logic in `src/services/`.
4. **Implement Repository Query**: Add Prisma query method in `src/repositories/`.
5. **Register Route**: Add route in `src/routes/` and attach to Express in `src/index.ts`.

---

## 2. Modifying Database Schema

1. Edit `backend/prisma/schema.prisma`.
2. Update repository interfaces if models change.
3. Test locally against Neon PostgreSQL:
   ```bash
   cd backend
   npx prisma db push
   npx prisma generate
   ```
4. Commit updated `schema.prisma`. Production builds on Render automatically execute `prisma generate && tsc`.

---

## 3. Adding a New Frontend Page

1. Create React page component in `frontend/src/pages/NewPage.tsx`.
2. Add API method to `frontend/src/services/api.service.ts`.
3. Register route in `frontend/src/App.tsx` inside `<ProtectedRoute>` if authentication is required.
4. Add navigation link to `frontend/src/components/layout/Navbar.tsx` or `Sidebar.tsx`.

---

## 4. Upgrading Dependencies

1. Test frontend build: `cd frontend && npm install && npm run build`.
2. Test backend build & test suite: `cd backend && npm install && npm run build && npm test`.
3. Verify Prisma compatibility before upgrading `@prisma/client` across major versions.
