import { Metadata } from "next";
import { getPreorders } from "@/app/actions";
import PreordersClient from "@/app/components/PreordersClient";

export const metadata: Metadata = {
  title: "Preorders - Preorder Manager",
  description: "View and manage active and inactive product preorders.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const filter = (resolvedSearchParams.filter as string) || "all";
  const sortBy = (resolvedSearchParams.sortBy as string) || "createdAt";
  const sortOrder = (resolvedSearchParams.sortOrder as "asc" | "desc") || "desc";
  const page = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page as string, 10)
    : 1;
  const pageSize = 8;

  // Validate parameters to prevent prisma query crashes
  const validFilters = ["all", "active", "inactive"];
  const selectedFilter = validFilters.includes(filter) ? (filter as "all" | "active" | "inactive") : "all";

  const validSortBy = ["name", "createdAt", "startsAt", "endsAt"];
  const selectedSortBy = validSortBy.includes(sortBy) ? (sortBy as "name" | "createdAt" | "startsAt" | "endsAt") : "createdAt";

  const validSortOrder = ["asc", "desc"];
  const selectedSortOrder = validSortOrder.includes(sortOrder) ? sortOrder : "desc";

  const { preorders, totalCount } = await getPreorders({
    filter: selectedFilter,
    sortBy: selectedSortBy,
    sortOrder: selectedSortOrder,
    page,
    pageSize,
  });

  // Convert Date objects to plain JS structures if needed (Prisma returns Dates, Next Server Actions serializes them, but here it is direct server render)
  return (
    <main className="flex-1 bg-[#f4f4f5] min-h-screen py-10">
      <PreordersClient
        preorders={preorders}
        totalCount={totalCount}
        currentFilter={selectedFilter}
        currentSortBy={selectedSortBy}
        currentSortOrder={selectedSortOrder}
        currentPage={page}
        pageSize={pageSize}
      />
    </main>
  );
}
