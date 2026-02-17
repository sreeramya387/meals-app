# Meal Prep App - Setup Guide

## Prerequisites

- Node.js 20+ installed
- A Neon Postgres database (free tier available at https://neon.tech)
- npm or yarn package manager

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update the `.env.local` file with your actual database credentials:

```env
# Database - Get this from your Neon dashboard
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Authentication - Generate a strong random secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# App URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Set Up Database

Push the database schema to your Neon database:

```bash
npm run db:push
```

This will create all the necessary tables in your Neon database.

**Note:** If you prefer to use migrations instead:
```bash
npm run db:generate  # Generate migration files
# Then manually apply migrations or use your preferred method
```

### 4. Seed the Database

Populate the database with 100 common ingredients:

```bash
npm run db:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Steps

1. **Register an Account**: Go to `/register` and create your account
2. **Create Your First Meal**: Navigate to "My Meals" and click "Create Meal"
3. **Add Ingredients**: After creating a meal, add ingredients to calculate nutrition
4. **Plan Your Week**: Go to "Weekly Planner" and add meals to your calendar
5. **Generate Grocery List**: After planning, go to "Grocery List" and generate your shopping list

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types
- `npm run db:generate` - Generate Drizzle migrations for Postgres
- `npm run db:push` - Push schema directly to Postgres database (recommended for development)
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed` - Seed ingredient database

## Project Structure

```
meal-prep/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Home dashboard
│   │   ├── meals/           # Meal management
│   │   ├── planner/         # Weekly planner
│   │   ├── grocery/         # Grocery lists
│   │   └── profile/         # User profile
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── meals/          # Meal CRUD endpoints
│   │   ├── ingredients/    # Ingredient search
│   │   ├── planner/        # Meal planning endpoints
│   │   ├── grocery/        # Grocery list endpoints
│   │   └── profile/        # Profile endpoints
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── ui/                 # Base UI components
│   └── layout/             # Layout components
├── lib/                    # Utilities and business logic
│   ├── db/                 # Database setup and schema
│   ├── auth/               # Authentication utilities
│   ├── validation/         # Zod schemas
│   └── nutrition/          # Nutrition calculator
├── types/                  # TypeScript type definitions
└── scripts/                # Utility scripts

```

## Features Implemented

### ✅ Authentication
- User registration with email/password
- Secure login with JWT sessions
- Password hashing with bcrypt
- Session management
- Protected routes

### ✅ Meal Management
- Create, read, update, delete meals
- Add ingredients with quantities
- Automatic nutrition calculation
- Search and filter meals
- Dietary tags (vegetarian, vegan, etc.)

### ✅ Weekly Planner
- 7-day calendar view
- 3 meal slots per day (breakfast, lunch, dinner)
- Add/remove meals from slots
- Weekly nutrition summary
- Daily calorie tracking

### ✅ Grocery Lists
- Auto-generate from weekly plan
- Organized by category (produce, meat, dairy, etc.)
- Check/uncheck items
- Print-friendly view
- Multiple list management

### ✅ User Profile
- Update personal information
- Change password
- Notification preferences
- Unit preferences (metric/imperial)

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Neon Postgres (serverless)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Date Handling**: date-fns

## Troubleshooting

### Database Connection Issues
- Ensure your DATABASE_URL is correct
- Check that your Neon database is active
- Verify SSL mode is included in connection string

### Build Errors
- Run `npm run typecheck` to find TypeScript errors
- Ensure all dependencies are installed
- Clear `.next` folder and rebuild

### Ingredient Search Not Working
- Make sure you ran `npm run db:seed`
- Check database connection
- Verify ingredients table has data

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL=your-neon-production-url
JWT_SECRET=strong-random-secret-for-production
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Support

For issues or questions, refer to:
- Next.js Documentation: https://nextjs.org/docs
- Drizzle ORM: https://orm.drizzle.team
- Neon Postgres: https://neon.tech/docs

## License

MIT
