import { Metadata } from "next";
import CreatePreorderForm from "./CreatePreorderForm";

export const metadata: Metadata = {
  title: "Create Preorder - Preorder Manager",
  description: "Create a new preorder parameter with custom configurations.",
};

export default function Page() {
  return (
    <main className="flex-1 bg-[#f4f4f5] min-h-screen py-10">
      <CreatePreorderForm />
    </main>
  );
}
