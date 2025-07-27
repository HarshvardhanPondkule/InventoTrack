"use server";

import prisma from "../lib/prisma"; // relative import to lib/prisma.ts
import {
  FormDataType,
  OrderItem,
  Product,
  ProductOverviewStats,
  StockSummary,
  Transaction,
} from "./types"; // relative import for types.ts inside app/
import { Category } from "@prisma/client";

// Utility: Validate association
async function getAssociationOrThrow(email: string) {
  if (!email) throw new Error("Email is required.");
  const association = await prisma.association.findUnique({ where: { email } });
  if (!association) throw new Error("No association found.");
  return association;
}

// Association
export async function checkAndAddAssociation(email: string, name: string) {
  if (!email) return;
  const existing = await prisma.association.findUnique({ where: { email } });
  if (!existing && name) {
    await prisma.association.create({ data: { email, name } });
  }
}

export async function getAssociation(email: string) {
  if (!email) return;
  return await prisma.association.findUnique({ where: { email } });
}

// Category
export async function createCategory(name: string, email: string, description?: string) {
  if (!name || !email) return;
  const association = await getAssociationOrThrow(email);
  await prisma.category.create({
    data: { name, description: description || "", associationId: association.id },
  });
}

export async function updateCategory(id: string, email: string, name: string, description?: string) {
  if (!id || !email || !name) throw new Error("Missing data.");
  await getAssociationOrThrow(email);
  await prisma.category.update({
    where: { id },
    data: { name, description: description || "" },
  });
}

export async function deleteCategory(id: string, email: string) {
  if (!id || !email) throw new Error("Missing data.");
  await getAssociationOrThrow(email);
  await prisma.category.delete({ where: { id } });
}

export async function readCategories(email: string): Promise<Category[] | undefined> {
  const association = await getAssociationOrThrow(email);
  return await prisma.category.findMany({ where: { associationId: association.id } });
}

// Product
export async function createProduct(formData: FormDataType, email: string) {
  const { name, description, price, imageUrl, categoryId, unit, quantity } = formData;
  if (!email || !price || !categoryId || !name) throw new Error("Missing product data.");
  const association = await getAssociationOrThrow(email);
  await prisma.product.create({
    data: {
      name,
      description,
      price: Number(price),
      quantity: Number(quantity) || 0,
      imageUrl: imageUrl || "",
      categoryId,
      unit: unit || "",
      associationId: association.id,
    },
  });
}

export async function updateProduct(formData: FormDataType, email: string) {
  const { id, name, description, price, imageUrl, quantity, unit } = formData;
  if (!id || !email || !price || !name) throw new Error("Missing data.");
  await getAssociationOrThrow(email);
  await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price: Number(price),
      quantity: Number(quantity) || 0,
      unit: unit || "",
      imageUrl: imageUrl || "",
    },
  });
}

export async function deleteProduct(id: string, email: string) {
  if (!id || !email) throw new Error("Missing data.");
  await getAssociationOrThrow(email);
  await prisma.product.delete({ where: { id } });
}

export async function readProducts(email: string): Promise<Product[] | undefined> {
  const association = await getAssociationOrThrow(email);
  const products = await prisma.product.findMany({
    where: { associationId: association.id },
    include: { category: true },
  });
  return products.map((p) => ({ ...p, categoryName: p.category?.name }));
}

export async function readProductById(productId: string, email: string): Promise<Product | undefined> {
  await getAssociationOrThrow(email);
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });
  return product ? { ...product, categoryName: product.category?.name } : undefined;
}

// Stock
export async function replenishStockWithTransaction(productId: string, quantity: number, email: string) {
  const association = await getAssociationOrThrow(email);
  await prisma.product.update({
    where: { id: productId },
    data: { quantity: { increment: quantity } },
  });
  await prisma.transaction.create({
    data: {
      type: "IN",
      quantity,
      productId,
      associationId: association.id,
    },
  });
}

export async function deductStockWithTransaction(orderItems: OrderItem[], email: string) {
  const association = await getAssociationOrThrow(email);

  for (const item of orderItems) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || item.quantity <= 0 || product.quantity < item.quantity) {
      throw new Error(`Insufficient stock or invalid product: ${product?.name}`);
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
      await tx.transaction.create({
        data: {
          type: "OUT",
          quantity: item.quantity,
          productId: item.productId,
          associationId: association.id,
        },
      });
    }
  });

  return { success: true };
}

// Reporting
export async function getTransactions(email: string, limit?: number): Promise<Transaction[]> {
  const association = await getAssociationOrThrow(email);
  const transactions = await prisma.transaction.findMany({
    where: { associationId: association.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: { include: { category: true } } },
  });
  return transactions.map((tx) => ({
    ...tx,
    categoryName: tx.product.category.name,
    productName: tx.product.name,
    imageUrl: tx.product.imageUrl,
    price: tx.product.price,
    unit: tx.product.unit,
  }));
}

export async function getProductOverviewStats(email: string): Promise<ProductOverviewStats> {
  const association = await getAssociationOrThrow(email);
  const products = await prisma.product.findMany({
    where: { associationId: association.id },
    include: { category: true },
  });
  const transactions = await prisma.transaction.findMany({ where: { associationId: association.id } });

  const stockValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return {
    totalProducts: products.length,
    totalCategories: new Set(products.map((p) => p.category?.name)).size,
    totalTransactions: transactions.length,
    stockValue,
  };
}

export async function getProductCategoryDistribution(email: string) {
  const association = await getAssociationOrThrow(email);
  const categories = await prisma.category.findMany({
    where: { associationId: association.id },
    include: { products: true },
  });

  return categories
    .map((cat) => ({ name: cat.name, value: cat.products.length }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export async function getStockSummary(email: string): Promise<StockSummary> {
  const association = await getAssociationOrThrow(email);
  const products = await prisma.product.findMany({
    where: { associationId: association.id },
    include: { category: true },
  });

  const inStock = products.filter((p) => p.quantity > 5);
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 5);
  const outOfStock = products.filter((p) => p.quantity === 0);

  return {
    inStockCount: inStock.length,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    criticalProducts: [...lowStock, ...outOfStock].map((p) => ({
      ...p,
      categoryName: p.category?.name,
    })),
  };
}
