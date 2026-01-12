// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.trashCan.deleteMany()

  // Seed trash cans from JSON
  await prisma.trashCan.createMany({
    data: [
      {
        id: 1,
        location: 'Gravensteenstraat',
        lat: 51.0568,
        lng: 3.7192,
        status: 'empty',
        lastUpdated: '2026-01-11',
      },
      {
        id: 2,
        location: 'Korenmarkt',
        lat: 51.0543,
        lng: 3.7205,
        status: 'full',
        lastUpdated: '2025-12-17',
      },
      {
        id: 3,
        location: 'Citadelpark',
        lat: 51.0398,
        lng: 3.7103,
        status: 'empty',
        lastUpdated: '2025-12-17',
      },
      {
        id: 4,
        location: 'Sint-Pietersplein',
        lat: 51.0475,
        lng: 3.7268,
        status: 'empty',
        lastUpdated: '2025-12-17',
      },
      {
        id: 5,
        location: 'Vrijdagmarkt',
        lat: 51.0589,
        lng: 3.7243,
        status: 'full',
        lastUpdated: '2025-12-17',
      },
      {
        id: 6,
        location: 'Gentbrugge Meersen',
        lat: 51.0358,
        lng: 3.7565,
        status: 'full',
        lastUpdated: '2025-12-17',
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
