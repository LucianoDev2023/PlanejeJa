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
    <div className="flex min-h-screen flex-col justify-between">
      <Navbar />
      <div className="flex w-full flex-1 flex-col overflow-y-auto bg-gradient-to-b from-[#0D141A] to-[#080b14] pb-28 sm:pb-10 md:mt-0">
        <TransactionContainer />
      </div>
      {/* Rodapé com o Tour */}
      <div className="fixed bottom-0 w-full bg-[#060D13] shadow-inner">
        {/* <TradeFormTour /> */}
      </div>
    </div>
  );
}
