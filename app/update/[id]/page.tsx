import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPreorderById } from "@/app/actions";
import UpdatePreorderForm from "./UpdatePreorderForm";

export const metadata: Metadata = {
  title: "Update Preorder - Preorder Manager",
  description: "Modify an existing preorder configuration.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const preorder = await getPreorderById(id);

  if (!preorder) {
    notFound();
  }

  return (
    <main className="flex-1 bg-[#f4f4f5] min-h-screen py-10">
      <UpdatePreorderForm preorder={preorder} />
    </main>
  );
}
