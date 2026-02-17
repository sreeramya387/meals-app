# 🚀 Quick Start Guide

Get your Meal Prep app running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Setup Database (2 min)

1. **Create a free Neon database:**
   - Go to https://neon.tech
   - Sign up (free)
   - Create a new project
   - Copy your connection string

2. **Update `.env.local`:**
   ```env
   DATABASE_URL=your-neon-connection-string-here
   JWT_SECRET=any-random-secret-string-here
   ```

3. **Push schema to database:**
   ```bash
   npm run db:push
   ```

## Step 3: Seed Ingredients (30 sec)

```bash
npm run db:seed
```

## Step 4: Start the App (30 sec)

```bash
npm run dev
```

## Step 5: Use the App! 🎉

1. Open http://localhost:3000
2. Click "Get Started Free"
3. Register with your email
4. Start creating meals!

---

## 🎯 First Tasks to Try

### Create Your First Meal
1. Go to "My Meals"
2. Click "Create Meal"
3. Fill in details (e.g., "Grilled Chicken Salad")
4. Click "Create Meal"
5. Add ingredients (search for "chicken", "lettuce", etc.)
6. Watch nutrition calculate automatically!

### Plan Your Week
1. Go to "Weekly Planner"
2. Click on a meal slot (e.g., Monday Breakfast)
3. Select a meal from your list
4. Repeat for other days
5. See weekly nutrition summary update!

### Generate Grocery List
1. After planning your week
2. Go to "Grocery List"
3. Click "Generate from Plan"
4. See all ingredients organized by category
5. Check off items as you shop!

---

## 🐛 Troubleshooting

**Database connection error?**
- Check your DATABASE_URL in `.env.local`
- Make sure it includes `?sslmode=require`

**No ingredients showing up?**
- Run `npm run db:seed` again

**Port 3000 already in use?**
- Change port: `npm run dev -- -p 3001`

---

## 📚 Full Documentation

- **Setup Guide**: See `SETUP.md`
- **Feature List**: See `README.md`
- **Complete Summary**: See `PROJECT_SUMMARY.md`

---

**That's it! You're ready to start meal planning! 🍽️**
