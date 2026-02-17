# Meal Planner App - MVP Only Specification

## Executive Summary

This document contains **ONLY** the essential features needed for the Minimum Viable Product (MVP) launch. The goal is to deliver a functional meal planning application with core features that users need, while keeping complexity minimal for faster time-to-market.

---

## MVP Core Features (Must Have)

### 1. User Authentication (Simplified)
**Goal**: Allow users to create accounts and log in securely

**Features**:
- Email/password registration
- Email/password login
- Logout functionality
- Basic password reset (email link)
- Session management

**Out of Scope for MVP**:
- OAuth (Google, Facebook, Apple)
- Two-factor authentication
- Email verification (can be added post-launch)
- Advanced password requirements

---

### 2. Meal Management (Core CRUD)
**Goal**: Users can create, view, edit, and delete meals

**Features**:

#### 2.1 Create Meal
- Meal name (required)
- Meal description (optional, 500 chars max)
- Meal category (Breakfast, Lunch, Dinner, Snack)
- Preparation time (minutes)
- Cooking time (minutes)
- Servings (default: 2)
- Simple recipe instructions (plain text, not rich text for MVP)
- Dietary tags: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Paleo

#### 2.2 View Meals
- Grid view showing meal cards (name, category, total time, calories)
- Click to view full meal details
- Basic search by name
- Filter by category
- Filter by dietary tags

#### 2.3 Edit Meal
- Update any field from meal creation
- Last modified timestamp

#### 2.4 Delete Meal
- Simple delete with confirmation dialog
- Warning if meal is in current week's plan

**Out of Scope for MVP**:
- Image upload (use placeholder images)
- Cuisine types
- Difficulty levels
- Custom tags
- Rich text editor for instructions
- Recipe import from URLs
- Meal duplication
- Favorite/bookmark system
- Soft delete (just hard delete for MVP)

---

### 3. Ingredient Management (Simplified)
**Goal**: Add ingredients to meals with basic nutritional tracking

**Features**:

#### 3.1 Pre-populated Ingredient Database
- Database seeded with 500 most common ingredients
- Each ingredient has:
  - Name
  - Category (Protein, Carbs, Vegetables, Fruits, Dairy, Fats, Other)
  - Calories per 100g
  - Protein per 100g
  - Carbs per 100g
  - Fat per 100g

#### 3.2 Add Ingredients to Meal
- Search/autocomplete from ingredient database
- Quantity (numeric)
- Unit (grams, oz, cups, tbsp, tsp, pieces)
- Auto-calculate nutritional values

#### 3.3 View Ingredients in Meal
- List of all ingredients with quantities
- Total nutritional summary for the meal

#### 3.4 Edit/Remove Ingredients
- Update quantity/unit
- Remove ingredient from meal
- Nutrition auto-updates

**Out of Scope for MVP**:
- Custom ingredients (users must use database)
- Detailed micronutrients (vitamins, minerals)
- Ingredient substitutions
- Optional ingredients flag
- Allergen tracking
- Ingredient cost tracking
- Fiber, sugar, sodium tracking (focus on main macros only)

---

### 4. Weekly Meal Planner (Core Feature)
**Goal**: Visual calendar to plan meals for the week

**Features**:

#### 4.1 Weekly Calendar View
- 7-day view (Monday to Sunday)
- 3 meal slots per day: Breakfast, Lunch, Dinner
- Current week shown by default
- Navigate to previous/next week
- Current day highlighted

#### 4.2 Add Meals to Calendar
- Click on empty slot to see meal selector
- Search/filter meals
- Click meal to add to slot
- Display meal name and calories in slot

#### 4.3 Manage Planned Meals
- Click filled slot to view meal details
- Remove meal from slot
- No drag-and-drop for MVP (click-based interaction only)

#### 4.4 Weekly Nutritional Summary
- Daily calorie totals (simple bar chart)
- Weekly average calories
- Daily macros breakdown (Protein, Carbs, Fat in grams)
- Simple visual indicators (text-based, minimal charts)

#### 4.5 Save/Load Plans
- Auto-save current week plan
- Load plan for specific week
- Basic plan naming ("Week of Jan 15-21")

**Out of Scope for MVP**:
- Drag-and-drop functionality (too complex for MVP)
- Snack slots (focus on 3 main meals)
- Plan templates
- Duplicate day/week
- Share plans
- Export to PDF
- Meal prep tracking
- Custom servings per planned meal

---

### 5. Grocery List (Basic)
**Goal**: Generate shopping list from weekly meal plan

**Features**:

#### 5.1 Generate Grocery List
- Click button to generate list from current week
- Automatically aggregate all ingredients
- Combine duplicate ingredients (sum quantities)
- Group by category (Produce, Meat, Dairy, Pantry, Other)

#### 5.2 Manage Grocery List
- View list organized by category
- Check off items as purchased
- Simple print view (plain HTML, no fancy formatting)

**Out of Scope for MVP**:
- Add custom items to list
- Edit quantities manually
- Remove items from list
- Save multiple lists
- Export to other apps
- Share list
- Cost estimation
- Unit conversion (just show as-is from recipes)
- Pantry integration (exclude items you have)

---

### 6. User Profile (Minimal)
**Goal**: Basic user information and preferences

**Features**:

#### 6.1 Profile Information
- First name, Last name
- Email (read-only, set at registration)
- Preferred units (Metric or Imperial)

#### 6.2 Basic Settings
- Change password
- Notification preferences:
  - Weekly plan reminder (email, yes/no)
  - Marketing emails (yes/no)

**Out of Scope for MVP**:
- Profile picture
- Date of birth, gender, location
- Detailed dietary preferences (just use meal tags)
- Goal setting (weight loss, calories, etc.)
- Activity level
- Macro targets
- Account deletion

---

### 7. Dashboard/Home Page (Simple)
**Goal**: Landing page after login showing overview

**Features**:
- Welcome message with user's name
- Quick stats:
  - Number of meals created
  - Current week's total calories (if plan exists)
- Quick actions:
  - "Plan This Week" button → goes to planner
  - "Add New Meal" button → goes to create meal
  - "View Grocery List" button
- Recent meals (last 5 created)

**Out of Scope for MVP**:
- Charts and graphs
- Progress tracking
- Meal recommendations
- Tips and suggestions

---

## MVP Database Schema (Simplified)

### Tables Needed for MVP:

#### 1. users
```typescript
{
  id: uuid (primary key),
  email: string (unique, required),
  password_hash: string (required),
  first_name: string (optional),
  last_name: string (optional),
  preferred_units: enum ['metric', 'imperial'] (default: 'imperial'),
  email_notifications: boolean (default: true),
  marketing_emails: boolean (default: false),
  created_at: timestamp,
  updated_at: timestamp
}
```

#### 2. meals
```typescript
{
  id: uuid (primary key),
  user_id: uuid (foreign key -> users.id),
  name: string (required, max 100 chars),
  description: text (optional, max 500 chars),
  category: enum ['breakfast', 'lunch', 'dinner', 'snack'],
  preparation_time_minutes: integer,
  cooking_time_minutes: integer,
  servings: integer (default: 2),
  instructions: text,
  dietary_tags: string[] (array),
  
  // Auto-calculated from ingredients
  calories: decimal,
  protein_g: decimal,
  carbs_g: decimal,
  fat_g: decimal,
  
  created_at: timestamp,
  updated_at: timestamp
}
```

#### 3. ingredients
```typescript
{
  id: uuid (primary key),
  name: string (unique, required),
  category: enum ['protein', 'carbs', 'vegetables', 'fruits', 'dairy', 'fats', 'other'],
  
  // Per 100g
  calories_per_100g: decimal,
  protein_per_100g: decimal,
  carbs_per_100g: decimal,
  fat_per_100g: decimal,
  
  created_at: timestamp
}
```

#### 4. meal_ingredients
```typescript
{
  id: uuid (primary key),
  meal_id: uuid (foreign key -> meals.id, cascade delete),
  ingredient_id: uuid (foreign key -> ingredients.id),
  quantity: decimal,
  unit: enum ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'piece'],
  
  created_at: timestamp
}
```

#### 5. meal_plans
```typescript
{
  id: uuid (primary key),
  user_id: uuid (foreign key -> users.id),
  week_start_date: date (Monday of the week),
  name: string,
  
  created_at: timestamp,
  updated_at: timestamp
}
```

#### 6. planned_meals
```typescript
{
  id: uuid (primary key),
  meal_plan_id: uuid (foreign key -> meal_plans.id, cascade delete),
  meal_id: uuid (foreign key -> meals.id),
  date: date,
  meal_slot: enum ['breakfast', 'lunch', 'dinner'],
  
  created_at: timestamp
}
```

#### 7. grocery_lists
```typescript
{
  id: uuid (primary key),
  user_id: uuid (foreign key -> users.id),
  meal_plan_id: uuid (foreign key -> meal_plans.id),
  name: string,
  created_at: timestamp
}
```

#### 8. grocery_items
```typescript
{
  id: uuid (primary key),
  grocery_list_id: uuid (foreign key -> grocery_lists.id, cascade delete),
  item_name: string,
  quantity: decimal,
  unit: string,
  category: enum ['produce', 'meat', 'dairy', 'pantry', 'other'],
  is_checked: boolean (default: false),
  
  created_at: timestamp
}
```

#### 9. sessions (for authentication)
```typescript
{
  id: uuid (primary key),
  user_id: uuid (foreign key -> users.id, cascade delete),
  token: string (unique),
  expires_at: timestamp,
  created_at: timestamp
}
```

**Total Tables: 9** (down from 13 in full plan)

---

## MVP API Endpoints (Simplified)

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Log in
- `POST /api/auth/logout` - Log out
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password-confirm` - Complete password reset

### Meals
- `GET /api/meals` - List all user's meals (with pagination, search, filters)
- `POST /api/meals` - Create new meal
- `GET /api/meals/:id` - Get meal details with ingredients
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal

### Ingredients
- `GET /api/ingredients/search?q=chicken` - Search ingredients (autocomplete)
- `GET /api/ingredients` - Get all ingredients (for reference)

### Meal Ingredients
- `POST /api/meals/:mealId/ingredients` - Add ingredient to meal
- `PUT /api/meals/:mealId/ingredients/:id` - Update ingredient quantity
- `DELETE /api/meals/:mealId/ingredients/:id` - Remove ingredient from meal

### Meal Planner
- `GET /api/planner?week=2024-01-15` - Get plan for specific week
- `POST /api/planner/meals` - Add meal to plan slot
- `DELETE /api/planner/meals/:id` - Remove meal from slot
- `GET /api/planner/nutrition?week=2024-01-15` - Get weekly nutrition summary

### Grocery List
- `POST /api/grocery/generate` - Generate list from current week
- `GET /api/grocery/:id` - Get grocery list
- `PUT /api/grocery/:id/items/:itemId` - Check/uncheck item

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/password` - Change password

**Total Endpoints: ~20** (down from 50+ in full plan)

---

## MVP Project Structure (Simplified)

```
meal-planner-app/
├── frontend/
│   ├── public/
│   │   └── images/
│   │       └── meal-placeholder.png
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/page.tsx         # Home/dashboard
│   │   │   │   ├── meals/
│   │   │   │   │   ├── page.tsx               # List meals
│   │   │   │   │   ├── new/page.tsx           # Create meal
│   │   │   │   │   └── [id]/page.tsx          # Edit meal
│   │   │   │   ├── planner/page.tsx           # Weekly planner
│   │   │   │   ├── grocery/page.tsx           # Grocery list
│   │   │   │   └── profile/page.tsx           # User profile
│   │   │   │   └── layout.tsx                 # Dashboard layout
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                       # Landing page
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   └── Badge.tsx
│   │   │   ├── meals/
│   │   │   │   ├── MealCard.tsx
│   │   │   │   ├── MealForm.tsx
│   │   │   │   ├── MealList.tsx
│   │   │   │   └── IngredientInput.tsx
│   │   │   ├── planner/
│   │   │   │   ├── WeeklyCalendar.tsx
│   │   │   │   ├── DayColumn.tsx
│   │   │   │   ├── MealSlot.tsx
│   │   │   │   └── NutritionSummary.tsx
│   │   │   ├── grocery/
│   │   │   │   ├── GroceryList.tsx
│   │   │   │   └── GroceryItem.tsx
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Navigation.tsx
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── meals.ts
│   │   │   │   ├── ingredients.ts
│   │   │   │   ├── planner.ts
│   │   │   │   ├── grocery.ts
│   │   │   │   └── auth.ts
│   │   │   ├── utils/
│   │   │   │   ├── nutrition.ts
│   │   │   │   └── date.ts
│   │   │   └── hooks/
│   │   │       ├── useMeals.ts
│   │   │       ├── usePlanner.ts
│   │   │       └── useAuth.ts
│   │   ├── types/
│   │   │   ├── meal.ts
│   │   │   ├── ingredient.ts
│   │   │   ├── planner.ts
│   │   │   └── user.ts
│   │   └── store/
│   │       └── authStore.ts
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── reset-password/route.ts
│   │   │   ├── meals/
│   │   │   │   ├── route.ts                   # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts               # GET, PUT, DELETE
│   │   │   │       └── ingredients/route.ts
│   │   │   ├── ingredients/
│   │   │   │   └── search/route.ts
│   │   │   ├── planner/
│   │   │   │   ├── route.ts
│   │   │   │   ├── meals/route.ts
│   │   │   │   └── nutrition/route.ts
│   │   │   ├── grocery/
│   │   │   │   ├── generate/route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── profile/route.ts
│   │   ├── db/
│   │   │   ├── schema/
│   │   │   │   ├── users.ts
│   │   │   │   ├── meals.ts
│   │   │   │   ├── ingredients.ts
│   │   │   │   ├── meal-ingredients.ts
│   │   │   │   ├── meal-plans.ts
│   │   │   │   ├── planned-meals.ts
│   │   │   │   ├── grocery-lists.ts
│   │   │   │   └── sessions.ts
│   │   │   ├── migrations/
│   │   │   ├── seed/
│   │   │   │   └── ingredients.sql
│   │   │   └── index.ts
│   │   ├── lib/
│   │   │   ├── auth/
│   │   │   │   ├── session.ts
│   │   │   │   └── password.ts
│   │   │   ├── nutrition/
│   │   │   │   └── calculator.ts
│   │   │   └── validation/
│   │   │       ├── meal.ts
│   │   │       └── auth.ts
│   │   └── middleware/
│   │       ├── auth.ts
│   │       └── error-handler.ts
│   ├── .env
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

---

## MVP Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand (simple global state)
- **Forms**: React Hook Form
- **Validation**: Zod
- **HTTP Client**: Fetch API (native)
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js 20+
- **API**: Next.js API Routes
- **Database**: Neon Postgres
- **ORM**: Drizzle ORM
- **Auth**: Custom JWT-based (bcrypt for passwords)
- **Validation**: Zod

### Deployment
- **Hosting**: Vercel
- **Database**: Neon Postgres (serverless)
- **Environment**: Production + Staging

### NOT Included in MVP
- React Query (just use basic state)
- Drag-and-drop libraries
- Chart libraries (use simple CSS bars)
- Rich text editors
- Image upload services
- Email services (Telnyx)
- Background jobs (Trigger.dev)
- Stripe/AuthorizeNet
- Shopify integration

---

## MVP Development Timeline

### Week 1: Foundation
- ✅ Project setup (Next.js, TypeScript, Tailwind)
- ✅ Database schema creation
- ✅ Drizzle ORM setup
- ✅ Basic layout (header, sidebar, navigation)
- ✅ Authentication UI (login, register)

### Week 2: Authentication & Database
- ✅ User registration backend
- ✅ Login/logout functionality
- ✅ Session management
- ✅ Password hashing
- ✅ Seed ingredient database (500 items)
- ✅ Protected routes setup

### Week 3: Meal Management
- ✅ Create meal form
- ✅ Add ingredients to meal
- ✅ Ingredient search/autocomplete
- ✅ Nutritional calculation
- ✅ Save meal to database

### Week 4: Meal Management (cont.)
- ✅ List all meals (grid view)
- ✅ View meal details
- ✅ Edit meal
- ✅ Delete meal
- ✅ Basic search and filters

### Week 5: Weekly Planner
- ✅ Weekly calendar UI (7 days × 3 meals)
- ✅ Add meal to slot (click-based)
- ✅ Remove meal from slot
- ✅ Week navigation (prev/next)
- ✅ Save/load plans

### Week 6: Weekly Planner (cont.)
- ✅ View meal details from slot
- ✅ Daily nutrition display
- ✅ Weekly nutrition summary
- ✅ Simple calorie bar charts

### Week 7: Grocery List
- ✅ Generate grocery list button
- ✅ Aggregate ingredients algorithm
- ✅ Display list by category
- ✅ Check/uncheck items
- ✅ Print view

### Week 8: Profile & Polish
- ✅ User profile page
- ✅ Change password
- ✅ Notification preferences
- ✅ Dashboard page with stats
- ✅ Responsive design tweaks

### Week 9: Testing & Bug Fixes
- ✅ Test all user flows
- ✅ Fix bugs
- ✅ Add loading states
- ✅ Error handling
- ✅ Form validation improvements

### Week 10: Launch Preparation
- ✅ Performance optimization
- ✅ Security audit
- ✅ Write basic documentation
- ✅ Deploy to production (Vercel)
- ✅ Beta user testing
- ✅ Final polish

**Total Timeline: 10 weeks**

---

## MVP Must-Have vs. Nice-to-Have

### ✅ Must Have (Core MVP)
1. User registration and login
2. Create/edit/delete meals
3. Add ingredients to meals with nutrition
4. Weekly meal planner (3 meals/day)
5. Generate grocery list
6. Basic profile settings

### ❌ Nice-to-Have (Post-MVP)
1. Drag-and-drop planner
2. Meal images
3. Recipe import
4. Pantry management
5. Goal setting and tracking
6. Social features
7. Mobile apps
8. Advanced charts
9. Meal recommendations
10. Email notifications
11. OAuth login
12. Snack slots
13. Meal prep tracking
14. Plan templates
15. Export features

---

## MVP User Flows

### Flow 1: New User Registration
1. Visit landing page
2. Click "Sign Up"
3. Enter email, password, name
4. Click "Create Account"
5. Redirect to dashboard
6. See welcome message and quick actions

### Flow 2: Create First Meal
1. Click "Add New Meal" from dashboard
2. Fill in meal details (name, category, times, servings)
3. Add instructions
4. Search and add ingredients one by one
5. See nutrition auto-calculate
6. Click "Save Meal"
7. Redirect to meal list showing new meal

### Flow 3: Plan Weekly Meals
1. Click "Plan This Week" from dashboard
2. See 7-day calendar with empty slots
3. Click on Monday Breakfast slot
4. Search/filter meals
5. Click meal to add it
6. Repeat for other slots
7. See daily calorie totals update
8. Plan auto-saves

### Flow 4: Generate Grocery List
1. After planning week, click "View Grocery List"
2. System generates list from all planned meals
3. See items organized by category
4. Check off items while shopping
5. Click "Print" for paper list

### Flow 5: Edit Existing Meal
1. Go to "My Meals"
2. Click on meal card
3. Update any details
4. Add/remove/edit ingredients
5. See nutrition update in real-time
6. Click "Save Changes"
7. If meal is in current plan, see updated info there

---

## MVP Success Criteria

### Technical Success
- ✅ All core features working without major bugs
- ✅ Page load time < 3 seconds
- ✅ Mobile responsive design
- ✅ No data loss (database stability)
- ✅ Secure authentication (no vulnerabilities)

### User Success
- ✅ User can create account in < 2 minutes
- ✅ User can create first meal in < 5 minutes
- ✅ User can plan full week in < 10 minutes
- ✅ User can generate grocery list in < 1 minute
- ✅ 80%+ user satisfaction (via feedback)

### Business Success
- 🎯 100 beta users signed up
- 🎯 50+ active users (using app weekly)
- 🎯 20+ meals created per user (on average)
- 🎯 Positive feedback on core features
- 🎯 Clear path to monetization identified

---

## MVP Constraints & Limitations

### Technical Constraints
- No image uploads (use placeholders)
- No drag-and-drop (click-based only)
- No real-time collaboration
- No offline support
- No mobile apps (web only)
- Limited to 500 pre-populated ingredients
- No custom ingredients

### Feature Constraints
- 3 meals per day maximum (no snacks)
- 1 week planning at a time
- No meal history/analytics
- No meal sharing
- No social features
- No recommendations
- No integrations

### Scale Constraints
- Designed for 1,000 users max initially
- No performance optimization beyond basics
- Simple database queries (no complex optimization)

### Business Constraints
- Free product only (no payment processing)
- No customer support system
- Manual user feedback collection
- No analytics dashboard

---

## Post-MVP Roadmap (Not for Initial Build)

### Version 1.1 (2 weeks after MVP)
- Add meal images (upload functionality)
- Drag-and-drop in planner
- Snack slots (4-6 meals per day)
- Meal favorites
- Duplicate meals

### Version 1.2 (1 month after MVP)
- Pantry management
- Custom ingredients
- Recipe import from URLs
- Meal templates
- Export grocery list to PDF

### Version 1.3 (2 months after MVP)
- Goal setting (calories, weight)
- Macro targets
- Progress tracking
- Advanced charts
- Email notifications

### Version 2.0 (3 months after MVP)
- Premium subscription
- AI meal recommendations
- Social features (share plans)
- Mobile apps (iOS, Android)
- Integrations (grocery delivery)

---

## MVP Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:pass@host/dbname

# Auth
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=3000
```

### Production (.env.production)
```
DATABASE_URL=<neon-postgres-url>
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## MVP Code Standards

### TypeScript
- Strict mode enabled
- Explicit return types for functions
- No `any` types (use `unknown` if needed)
- Interfaces for data structures

### React
- Functional components only
- Custom hooks for reusable logic
- Props interfaces clearly defined
- Keep components under 300 lines

### CSS
- Tailwind utility classes preferred
- No inline styles
- Component-specific styles in separate files if needed
- Mobile-first responsive design

### API
- RESTful conventions
- Consistent error responses
- Input validation on all endpoints
- Return appropriate HTTP status codes

### Database
- Use Drizzle ORM for all queries
- No raw SQL except for complex queries
- Foreign key constraints enabled
- Indexes on frequently queried columns

### Security
- HTTPS only in production
- Password hashing with bcrypt (12 rounds)
- JWT tokens in HTTP-only cookies
- Input sanitization and validation
- Rate limiting on auth endpoints

---

## MVP Testing Strategy

### Manual Testing (Priority)
- ✅ Test all user flows on desktop
- ✅ Test all user flows on mobile
- ✅ Test all forms (validation, errors)
- ✅ Test authentication (login, logout, password reset)
- ✅ Test meal CRUD operations
- ✅ Test planner (add, remove meals)
- ✅ Test grocery list generation

### Automated Testing (If Time Permits)
- Unit tests for utility functions (nutrition calculations)
- Integration tests for critical API endpoints
- E2E tests for main user flows (optional)

**For MVP, prioritize manual testing over automated tests to save time.**

---

## MVP Launch Checklist

### Pre-Launch (1 week before)
- [ ] All core features working
- [ ] No critical bugs
- [ ] Responsive on mobile and desktop
- [ ] Error handling in place
- [ ] Loading states for async operations
- [ ] Forms validated
- [ ] Database backups configured
- [ ] Production environment variables set
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate working

### Launch Day
- [ ] Deploy to production (Vercel)
- [ ] Test production site thoroughly
- [ ] Monitor for errors (Vercel dashboard)
- [ ] Announce to beta users
- [ ] Send initial welcome email
- [ ] Monitor user sign-ups
- [ ] Be available for immediate bug fixes

### Post-Launch (First Week)
- [ ] Collect user feedback daily
- [ ] Fix critical bugs immediately
- [ ] Monitor performance metrics
- [ ] Track user engagement
- [ ] Plan first update based on feedback

---

## MVP Budget & Resources

### Development Resources
- 1 Full-stack developer (Claude Code + You)
- 10 weeks development time
- ZenFlow IDE (free)

### Infrastructure Costs (Monthly)
- Vercel Hobby Plan: $0 (free for MVP)
- Neon Postgres Free Tier: $0 (up to 10GB)
- Domain name: ~$12/year
- **Total Monthly Cost: ~$1**

### Tools (Free Tier)
- GitHub (version control)
- Vercel (hosting)
- Neon (database)
- VS Code / ZenFlow IDE (development)

**MVP can be built and launched for essentially $0/month** (excluding domain)

---

## Final Notes for Claude Code

### Development Priorities
1. **Start with authentication** - Users need accounts first
2. **Then meal management** - Core value proposition
3. **Then planner** - The main feature users want
4. **Then grocery list** - Completes the basic workflow
5. **Finally polish** - UI improvements, error handling

### Key Principles
- **Keep it simple** - No over-engineering
- **Ship fast** - MVP should launch in 10 weeks
- **User feedback first** - Build, launch, learn, iterate
- **No premature optimization** - Make it work first
- **Focus on core value** - Everything else can wait

### What Makes This MVP Different
- ✅ Minimal feature set
- ✅ No complex integrations
- ✅ No advanced features
- ✅ Fast time to market
- ✅ Clear scope boundaries
- ✅ Realistic timeline
- ✅ Low cost to build

---

## Questions to Answer Before Starting

1. **Who is the primary user?** → Health-conscious individuals planning weekly meals
2. **What problem are we solving?** → Time-consuming meal planning and grocery shopping
3. **What is the core value?** → Quick weekly meal planning with auto-generated grocery lists
4. **What is success?** → Users planning full week and using grocery list regularly
5. **What can we cut?** → Everything not essential to core flow (see "Out of Scope" sections)

---

**This MVP specification is ready for implementation. Focus on these features only, and resist the temptation to add more until after launch.**