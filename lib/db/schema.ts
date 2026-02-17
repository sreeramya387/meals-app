import { pgTable, uuid, varchar, text, timestamp, integer, decimal, boolean, pgEnum, date } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const mealCategoryEnum = pgEnum('meal_category', ['breakfast', 'lunch', 'dinner', 'snack'])
export const mealSlotEnum = pgEnum('meal_slot', ['breakfast', 'lunch', 'dinner'])
export const ingredientCategoryEnum = pgEnum('ingredient_category', ['protein', 'carbs', 'vegetables', 'fruits', 'dairy', 'fats', 'other'])
export const groceryCategoryEnum = pgEnum('grocery_category', ['produce', 'meat', 'dairy', 'pantry', 'other'])
export const unitEnum = pgEnum('unit', ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'piece'])
export const preferredUnitsEnum = pgEnum('preferred_units', ['metric', 'imperial'])

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  preferredUnits: preferredUnitsEnum('preferred_units').default('imperial').notNull(),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  marketingEmails: boolean('marketing_emails').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Meals table
export const meals = pgTable('meals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: mealCategoryEnum('category').notNull(),
  preparationTimeMinutes: integer('preparation_time_minutes').default(0).notNull(),
  cookingTimeMinutes: integer('cooking_time_minutes').default(0).notNull(),
  servings: integer('servings').default(2).notNull(),
  instructions: text('instructions'),
  dietaryTags: text('dietary_tags').array(),
  calories: decimal('calories', { precision: 10, scale: 2 }).default('0').notNull(),
  proteinG: decimal('protein_g', { precision: 10, scale: 2 }).default('0').notNull(),
  carbsG: decimal('carbs_g', { precision: 10, scale: 2 }).default('0').notNull(),
  fatG: decimal('fat_g', { precision: 10, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Ingredients table
export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  category: ingredientCategoryEnum('category').notNull(),
  caloriesPer100g: decimal('calories_per_100g', { precision: 10, scale: 2 }).notNull(),
  proteinPer100g: decimal('protein_per_100g', { precision: 10, scale: 2 }).notNull(),
  carbsPer100g: decimal('carbs_per_100g', { precision: 10, scale: 2 }).notNull(),
  fatPer100g: decimal('fat_per_100g', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Meal Ingredients junction table
export const mealIngredients = pgTable('meal_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  mealId: uuid('meal_id').notNull().references(() => meals.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: unitEnum('unit').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Meal Plans table
export const mealPlans = pgTable('meal_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weekStartDate: date('week_start_date').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Planned Meals table
export const plannedMeals = pgTable('planned_meals', {
  id: uuid('id').primaryKey().defaultRandom(),
  mealPlanId: uuid('meal_plan_id').notNull().references(() => mealPlans.id, { onDelete: 'cascade' }),
  mealId: uuid('meal_id').notNull().references(() => meals.id),
  date: date('date').notNull(),
  mealSlot: mealSlotEnum('meal_slot').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Grocery Lists table
export const groceryLists = pgTable('grocery_lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  mealPlanId: uuid('meal_plan_id').references(() => mealPlans.id),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Grocery Items table
export const groceryItems = pgTable('grocery_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  groceryListId: uuid('grocery_list_id').notNull().references(() => groceryLists.id, { onDelete: 'cascade' }),
  itemName: varchar('item_name', { length: 255 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  category: groceryCategoryEnum('category').notNull(),
  isChecked: boolean('is_checked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Sessions table
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  meals: many(meals),
  mealPlans: many(mealPlans),
  groceryLists: many(groceryLists),
  sessions: many(sessions),
}))

export const mealsRelations = relations(meals, ({ one, many }) => ({
  user: one(users, {
    fields: [meals.userId],
    references: [users.id],
  }),
  mealIngredients: many(mealIngredients),
  plannedMeals: many(plannedMeals),
}))

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  mealIngredients: many(mealIngredients),
}))

export const mealIngredientsRelations = relations(mealIngredients, ({ one }) => ({
  meal: one(meals, {
    fields: [mealIngredients.mealId],
    references: [meals.id],
  }),
  ingredient: one(ingredients, {
    fields: [mealIngredients.ingredientId],
    references: [ingredients.id],
  }),
}))

export const mealPlansRelations = relations(mealPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [mealPlans.userId],
    references: [users.id],
  }),
  plannedMeals: many(plannedMeals),
  groceryLists: many(groceryLists),
}))

export const plannedMealsRelations = relations(plannedMeals, ({ one }) => ({
  mealPlan: one(mealPlans, {
    fields: [plannedMeals.mealPlanId],
    references: [mealPlans.id],
  }),
  meal: one(meals, {
    fields: [plannedMeals.mealId],
    references: [meals.id],
  }),
}))

export const groceryListsRelations = relations(groceryLists, ({ one, many }) => ({
  user: one(users, {
    fields: [groceryLists.userId],
    references: [users.id],
  }),
  mealPlan: one(mealPlans, {
    fields: [groceryLists.mealPlanId],
    references: [mealPlans.id],
  }),
  groceryItems: many(groceryItems),
}))

export const groceryItemsRelations = relations(groceryItems, ({ one }) => ({
  groceryList: one(groceryLists, {
    fields: [groceryItems.groceryListId],
    references: [groceryLists.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))
