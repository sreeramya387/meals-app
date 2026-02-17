import { seedDatabase } from '../lib/db/seed-ingredients'

async function main() {
  console.log('Starting database seed...')
  await seedDatabase()
  console.log('Database seed completed!')
  process.exit(0)
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
