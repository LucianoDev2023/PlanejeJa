"use client";

import { Button } from "@/app/_components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

// export default function PaymentButton({ children }: PaymentButtonProps) {
export default function PaymentButton() {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  );

  const fetchClientSecret = useCallback(() => {
    return fetch("/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => data.client_secret);
  }, []);

  const options = { fetchClientSecret };
  const { user } = useUser();
  const hasPremiumPlan = user?.publicMetadata.subscriptionPlan == "premium";
  if (!hasPremiumPlan) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full rounded-lg font-bold">
            Adquirir plano
          </Button>
        </DialogTrigger>
        {/* <DialogContent> */}
        <DialogContent className="max-h-[700px] w-full overflow-y-auto p-4">
          <div className="w-full">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
              clear
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rouded-lg w-full border-2 border-white/10 bg-[#203241] font-bold">
          <Link
            href={`${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL as string}?prefilled_email=${user.emailAddresses[0].emailAddress}`}
          >
            Gerenciar plano
          </Link>
        </Button>
      </DialogTrigger>
      <DialogContent></DialogContent>
    </Dialog>
  );
}
