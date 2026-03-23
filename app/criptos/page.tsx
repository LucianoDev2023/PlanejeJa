// app/criptos/page.tsx

import { redirect } from "next/navigation";
import Navbar from "../_components/navbar";
import TransactionContainer from "./_components/TransactionContainer";
import { auth } from "@clerk/nextjs/server";

export default async function Criptos() {
  const { userId } = auth();
  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617]">
      <Navbar />
      <main className="flex-1 overflow-x-hidden pb-10">
        <TransactionContainer />
      </main>
    </div>
  );
}
