import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check and create default association if not present
  let association = await prisma.association.findFirst();
  if (!association) {
    association = await prisma.association.create({
      data: {
        name: 'Default Association',
        email: 'default@association.com',
      },
    });
    console.log('Seeded default association.');
  }

  // Check and create default category if not present
  let category = await prisma.category.findFirst({
    where: { name: 'pipes' },
  });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'pipes',
      },
    });
    console.log('Seeded default category.');
  }

  // Check if sample products already exist
  const existingProducts = await prisma.product.findMany();
  if (existingProducts.length === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: 'Steel Pipe',
          quantity: 10,
          price: 120,
          description: 'High-quality steel pipe for industrial use',
          unit: 'meters',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1627886741/steel_pipe.jpg',
          associationId: association.id,
          categoryId: category.id,
        },
        {
          name: 'PVC Pipe',
          quantity: 5,
          price: 60,
          description: 'Durable PVC pipe for plumbing',
          unit: 'meters',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1627886741/pvc_pipe.jpg',
          associationId: association.id,
          categoryId: category.id,
        },
      ],
    });
    console.log('Seeded sample products.');
  }
}

main()
  .then(() => {
    console.log('Seeding completed.');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('Seeding failed:', e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
