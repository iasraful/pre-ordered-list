"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getPreorders(params: {
  filter?: "all" | "active" | "inactive";
  sortBy?: "name" | "createdAt" | "startsAt" | "endsAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) {
  const filter = params.filter ?? "all";
  const sortBy = params.sortBy ?? "createdAt";
  const sortOrder = params.sortOrder ?? "desc";
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 8;

  const where: Prisma.PreorderWhereInput = {};
  if (filter === "active") {
    where.status = true;
  } else if (filter === "inactive") {
    where.status = false;
  }

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [preorders, totalCount] = await Promise.all([
    prisma.preorder.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take,
    }),
    prisma.preorder.count({ where }),
  ]);

  return {
    preorders,
    totalCount,
  };
}

export async function getPreorderById(id: string) {
  return prisma.preorder.findUnique({
    where: { id },
  });
}

export async function togglePreorderStatus(id: string, status: boolean) {
  const updated = await prisma.preorder.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/");
  return updated;
}

export async function deletePreorder(id: string) {
  const deleted = await prisma.preorder.delete({
    where: { id },
  });
  revalidatePath("/");
  return deleted;
}

export async function createPreorder(data: {
  name: string;
  products: number;
  preorderWhen: string;
  startsAt: Date;
  endsAt: Date | null;
  status: boolean;
}) {
  const created = await prisma.preorder.create({
    data,
  });
  revalidatePath("/");
  return created;
}

export async function updatePreorder(
  id: string,
  data: {
    name: string;
    products: number;
    preorderWhen: string;
    startsAt: Date;
    endsAt: Date | null;
    status: boolean;
  }
) {
  const updated = await prisma.preorder.update({
    where: { id },
    data,
  });
  revalidatePath("/");
  return updated;
}
