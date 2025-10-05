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
    return fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.client_secret) {
          throw new Error("Client secret não retornado pela API");
        }
        return data.client_secret;
      });
  }, []);

  const options = { fetchClientSecret };
  const { user } = useUser();
  const hasPremiumPlan = user?.publicMetadata.subscriptionPlan == "premium";
  const hasCanceledPlan =
    user?.publicMetadata.subscriptionPlanStatus == "canceled";

  if (!hasPremiumPlan && !hasCanceledPlan) {
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
              <EmbeddedCheckout className="max-h-[80dvh]" />
            </EmbeddedCheckoutProvider>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog>
      <Button className="rouded-lg w-full border-2 border-white/10 bg-[#203241] font-bold">
        <Link
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL as string}?prefilled_email=${user.emailAddresses[0].emailAddress}`}
        >
          Gerenciar plano
        </Link>
      </Button>
      <DialogContent></DialogContent>
    </Dialog>
  );
}
