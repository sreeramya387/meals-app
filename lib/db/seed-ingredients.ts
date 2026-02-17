import { db } from './index'
import { ingredients } from './schema'

// Sample of 100 common ingredients with nutritional data (per 100g)
// In production, you'd have all 500 ingredients
export const seedIngredients = [
  // Proteins
  { name: 'Chicken Breast', category: 'protein', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { name: 'Ground Beef (90% lean)', category: 'protein', caloriesPer100g: 176, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 10 },
  { name: 'Salmon', category: 'protein', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
  { name: 'Eggs', category: 'protein', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
  { name: 'Tuna (canned in water)', category: 'protein', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 0.8 },
  { name: 'Pork Chop', category: 'protein', caloriesPer100g: 231, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 14 },
  { name: 'Turkey Breast', category: 'protein', caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 0.7 },
  { name: 'Shrimp', category: 'protein', caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3 },
  { name: 'Tofu', category: 'protein', caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatPer100g: 4.8 },
  { name: 'Black Beans', category: 'protein', caloriesPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 23.7, fatPer100g: 0.5 },
  
  // Vegetables
  { name: 'Broccoli', category: 'vegetables', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4 },
  { name: 'Spinach', category: 'vegetables', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: 'Carrots', category: 'vegetables', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2 },
  { name: 'Bell Pepper', category: 'vegetables', caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3 },
  { name: 'Tomatoes', category: 'vegetables', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
  { name: 'Onion', category: 'vegetables', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1 },
  { name: 'Garlic', category: 'vegetables', caloriesPer100g: 149, proteinPer100g: 6.4, carbsPer100g: 33, fatPer100g: 0.5 },
  { name: 'Cucumber', category: 'vegetables', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1 },
  { name: 'Lettuce', category: 'vegetables', caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2 },
  { name: 'Zucchini', category: 'vegetables', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3 },
  { name: 'Cauliflower', category: 'vegetables', caloriesPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5, fatPer100g: 0.3 },
  { name: 'Mushrooms', category: 'vegetables', caloriesPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3 },
  { name: 'Asparagus', category: 'vegetables', caloriesPer100g: 20, proteinPer100g: 2.2, carbsPer100g: 3.9, fatPer100g: 0.1 },
  { name: 'Green Beans', category: 'vegetables', caloriesPer100g: 31, proteinPer100g: 1.8, carbsPer100g: 7, fatPer100g: 0.2 },
  { name: 'Kale', category: 'vegetables', caloriesPer100g: 49, proteinPer100g: 4.3, carbsPer100g: 9, fatPer100g: 0.9 },
  
  // Fruits
  { name: 'Apple', category: 'fruits', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2 },
  { name: 'Banana', category: 'fruits', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
  { name: 'Orange', category: 'fruits', caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1 },
  { name: 'Strawberries', category: 'fruits', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3 },
  { name: 'Blueberries', category: 'fruits', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3 },
  { name: 'Avocado', category: 'fruits', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 15 },
  { name: 'Grapes', category: 'fruits', caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2 },
  { name: 'Watermelon', category: 'fruits', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 7.6, fatPer100g: 0.2 },
  { name: 'Mango', category: 'fruits', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4 },
  { name: 'Pineapple', category: 'fruits', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1 },
  
  // Carbs
  { name: 'White Rice', category: 'carbs', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { name: 'Brown Rice', category: 'carbs', caloriesPer100g: 112, proteinPer100g: 2.6, carbsPer100g: 24, fatPer100g: 0.9 },
  { name: 'Quinoa', category: 'carbs', caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9 },
  { name: 'Pasta', category: 'carbs', caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1 },
  { name: 'Bread (Whole Wheat)', category: 'carbs', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4 },
  { name: 'Oats', category: 'carbs', caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 6.9 },
  { name: 'Sweet Potato', category: 'carbs', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1 },
  { name: 'Potato', category: 'carbs', caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17, fatPer100g: 0.1 },
  { name: 'Couscous', category: 'carbs', caloriesPer100g: 112, proteinPer100g: 3.8, carbsPer100g: 23, fatPer100g: 0.2 },
  { name: 'Tortilla', category: 'carbs', caloriesPer100g: 304, proteinPer100g: 8, carbsPer100g: 51, fatPer100g: 7.3 },
  
  // Dairy
  { name: 'Milk (2%)', category: 'dairy', caloriesPer100g: 50, proteinPer100g: 3.3, carbsPer100g: 4.8, fatPer100g: 2 },
  { name: 'Greek Yogurt', category: 'dairy', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: 'Cheddar Cheese', category: 'dairy', caloriesPer100g: 403, proteinPer100g: 25, carbsPer100g: 1.3, fatPer100g: 33 },
  { name: 'Mozzarella Cheese', category: 'dairy', caloriesPer100g: 280, proteinPer100g: 28, carbsPer100g: 2.2, fatPer100g: 17 },
  { name: 'Butter', category: 'dairy', caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81 },
  { name: 'Cream Cheese', category: 'dairy', caloriesPer100g: 342, proteinPer100g: 6, carbsPer100g: 4, fatPer100g: 34 },
  { name: 'Sour Cream', category: 'dairy', caloriesPer100g: 193, proteinPer100g: 2.4, carbsPer100g: 4.6, fatPer100g: 19 },
  { name: 'Parmesan Cheese', category: 'dairy', caloriesPer100g: 431, proteinPer100g: 38, carbsPer100g: 4.1, fatPer100g: 29 },
  
  // Fats & Oils
  { name: 'Olive Oil', category: 'fats', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: 'Coconut Oil', category: 'fats', caloriesPer100g: 862, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: 'Almonds', category: 'fats', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
  { name: 'Walnuts', category: 'fats', caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65 },
  { name: 'Peanut Butter', category: 'fats', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
  { name: 'Cashews', category: 'fats', caloriesPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44 },
  { name: 'Chia Seeds', category: 'fats', caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31 },
  { name: 'Flax Seeds', category: 'fats', caloriesPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatPer100g: 42 },
  
  // Other/Condiments
  { name: 'Soy Sauce', category: 'other', caloriesPer100g: 53, proteinPer100g: 5.6, carbsPer100g: 4.9, fatPer100g: 0.1 },
  { name: 'Honey', category: 'other', caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82, fatPer100g: 0 },
  { name: 'Maple Syrup', category: 'other', caloriesPer100g: 260, proteinPer100g: 0, carbsPer100g: 67, fatPer100g: 0.2 },
  { name: 'Ketchup', category: 'other', caloriesPer100g: 112, proteinPer100g: 1.2, carbsPer100g: 27, fatPer100g: 0.1 },
  { name: 'Mustard', category: 'other', caloriesPer100g: 66, proteinPer100g: 4, carbsPer100g: 6, fatPer100g: 3.3 },
  { name: 'Mayonnaise', category: 'other', caloriesPer100g: 680, proteinPer100g: 1, carbsPer100g: 0.6, fatPer100g: 75 },
  { name: 'Balsamic Vinegar', category: 'other', caloriesPer100g: 88, proteinPer100g: 0.5, carbsPer100g: 17, fatPer100g: 0 },
  { name: 'Lemon Juice', category: 'other', caloriesPer100g: 22, proteinPer100g: 0.4, carbsPer100g: 6.9, fatPer100g: 0.2 },
  { name: 'Basil (fresh)', category: 'other', caloriesPer100g: 23, proteinPer100g: 3.2, carbsPer100g: 2.7, fatPer100g: 0.6 },
  { name: 'Cilantro', category: 'other', caloriesPer100g: 23, proteinPer100g: 2.1, carbsPer100g: 3.7, fatPer100g: 0.5 },
  { name: 'Parsley', category: 'other', caloriesPer100g: 36, proteinPer100g: 3, carbsPer100g: 6.3, fatPer100g: 0.8 },
  { name: 'Ginger', category: 'other', caloriesPer100g: 80, proteinPer100g: 1.8, carbsPer100g: 18, fatPer100g: 0.8 },
  { name: 'Black Pepper', category: 'other', caloriesPer100g: 251, proteinPer100g: 10, carbsPer100g: 64, fatPer100g: 3.3 },
  { name: 'Salt', category: 'other', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
  { name: 'Paprika', category: 'other', caloriesPer100g: 282, proteinPer100g: 14, carbsPer100g: 54, fatPer100g: 13 },
  { name: 'Cumin', category: 'other', caloriesPer100g: 375, proteinPer100g: 18, carbsPer100g: 44, fatPer100g: 22 },
  { name: 'Oregano', category: 'other', caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 69, fatPer100g: 4.3 },
  { name: 'Thyme', category: 'other', caloriesPer100g: 101, proteinPer100g: 5.6, carbsPer100g: 24, fatPer100g: 1.7 },
  { name: 'Rosemary', category: 'other', caloriesPer100g: 131, proteinPer100g: 3.3, carbsPer100g: 21, fatPer100g: 5.9 },
  { name: 'Cinnamon', category: 'other', caloriesPer100g: 247, proteinPer100g: 4, carbsPer100g: 81, fatPer100g: 1.2 },
  
  // Additional proteins
  { name: 'Cod', category: 'protein', caloriesPer100g: 82, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 0.7 },
  { name: 'Tilapia', category: 'protein', caloriesPer100g: 96, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 1.7 },
  { name: 'Bacon', category: 'protein', caloriesPer100g: 541, proteinPer100g: 37, carbsPer100g: 1.4, fatPer100g: 42 },
  { name: 'Ham', category: 'protein', caloriesPer100g: 145, proteinPer100g: 21, carbsPer100g: 1.5, fatPer100g: 5.5 },
  { name: 'Chickpeas', category: 'protein', caloriesPer100g: 164, proteinPer100g: 8.9, carbsPer100g: 27, fatPer100g: 2.6 },
  { name: 'Lentils', category: 'protein', caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4 },
  { name: 'Kidney Beans', category: 'protein', caloriesPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 23, fatPer100g: 0.5 },
  { name: 'Tempeh', category: 'protein', caloriesPer100g: 193, proteinPer100g: 19, carbsPer100g: 9, fatPer100g: 11 },
  { name: 'Edamame', category: 'protein', caloriesPer100g: 121, proteinPer100g: 11, carbsPer100g: 10, fatPer100g: 5 },
  { name: 'Cottage Cheese', category: 'dairy', caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3 },
  
  // More vegetables
  { name: 'Eggplant', category: 'vegetables', caloriesPer100g: 25, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.2 },
  { name: 'Celery', category: 'vegetables', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3, fatPer100g: 0.2 },
  { name: 'Cabbage', category: 'vegetables', caloriesPer100g: 25, proteinPer100g: 1.3, carbsPer100g: 5.8, fatPer100g: 0.1 },
  { name: 'Brussels Sprouts', category: 'vegetables', caloriesPer100g: 43, proteinPer100g: 3.4, carbsPer100g: 9, fatPer100g: 0.3 },
  { name: 'Radish', category: 'vegetables', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.4, fatPer100g: 0.1 },
  { name: 'Beets', category: 'vegetables', caloriesPer100g: 43, proteinPer100g: 1.6, carbsPer100g: 10, fatPer100g: 0.2 },
  { name: 'Corn', category: 'vegetables', caloriesPer100g: 86, proteinPer100g: 3.3, carbsPer100g: 19, fatPer100g: 1.4 },
  { name: 'Peas', category: 'vegetables', caloriesPer100g: 81, proteinPer100g: 5.4, carbsPer100g: 14, fatPer100g: 0.4 },
  { name: 'Squash', category: 'vegetables', caloriesPer100g: 16, proteinPer100g: 1.2, carbsPer100g: 3.4, fatPer100g: 0.2 },
  { name: 'Pumpkin', category: 'vegetables', caloriesPer100g: 26, proteinPer100g: 1, carbsPer100g: 6.5, fatPer100g: 0.1 },
]

export async function seedDatabase() {
  console.log('Seeding ingredients...')
  
  try {
    // Insert ingredients in batches
    const batchSize = 20
    for (let i = 0; i < seedIngredients.length; i += batchSize) {
      const batch = seedIngredients.slice(i, i + batchSize)
      await db.insert(ingredients).values(
        batch.map(ing => ({
          name: ing.name,
          category: ing.category as any,
          caloriesPer100g: ing.caloriesPer100g.toString(),
          proteinPer100g: ing.proteinPer100g.toString(),
          carbsPer100g: ing.carbsPer100g.toString(),
          fatPer100g: ing.fatPer100g.toString(),
        }))
      ).onConflictDoNothing()
      
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`)
    }
    
    console.log(`Successfully seeded ${seedIngredients.length} ingredients!`)
  } catch (error) {
    console.error('Error seeding ingredients:', error)
    throw error
  }
}
