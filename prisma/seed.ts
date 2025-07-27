import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a default association
  const association = await prisma.association.create({
    data: {
      name: 'Default Association',
      email: 'default@association.com',
    },
  });

  // Create a default category
  const category = await prisma.category.create({
    data: {
      name: 'pipes',
    },
  });

  // Create sample products
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
}

main()
  .then(() => {
    console.log('Seeding completed');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
