"use client";

import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "@/constant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createOrderSchema } from "@aerovideo/schemas";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PREDEFINED_AMOUNTS = [50, 100, 200];

export default function PaymentForm() {
  const [donorName, setDonorName] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () =>
      toast.error("Failed to load Razorpay SDK. Please check your connection.");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!sdkLoaded) {
      toast.error("Razorpay SDK is not loaded yet.");
      return;
    }

    const amountToCharge =
      selectedAmount === "custom" ? Number(customAmount) : selectedAmount;

    const result = createOrderSchema.safeParse({
      donorName,
      amount: amountToCharge,
    });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on the backend
      const res = await fetch(`${BACKEND_URL}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ donorName, amount: amountToCharge }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      const orderData = data.data.order;

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AeroVideo Support",
        description: "Support our platform",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch(
              `${BACKEND_URL}/payments/verify-payment`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed",
              );
            }

            toast.success("Payment successful! Thank you.");
          } catch (err: any) {
            toast.error(
              err.message || "Something went wrong verifying the payment.",
            );
          }
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp1.open();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send Support</CardTitle>
        <CardDescription>Select an amount to send via Razorpay</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Your Name"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PREDEFINED_AMOUNTS.map((amt) => (
            <Button
              key={amt}
              type="button"
              variant={selectedAmount === amt ? "default" : "outline"}
              onClick={() => setSelectedAmount(amt)}
            >
              ₹{amt}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Button
            className="flex-1"
            type="button"
            variant={selectedAmount === "custom" ? "default" : "outline"}
            onClick={() => setSelectedAmount("custom")}
          >
            Custom
          </Button>
          {selectedAmount === "custom" && (
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                placeholder="Amount"
                className="pl-7"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handlePayment}
          disabled={loading || !sdkLoaded}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${selectedAmount === "custom" ? (customAmount ? `₹${customAmount}` : "") : `₹${selectedAmount}`}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
