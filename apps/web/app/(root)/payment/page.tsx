import PaymentForm from "@/components/PaymentForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support via Razorpay",
  description: "Send any amount to support the platform",
};

export default function PaymentPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Support Us</h1>
        <p className="text-muted-foreground">
          Show your appreciation by buying us a coffee or supporting our
          development.
        </p>
      </div>
      <PaymentForm />
    </div>
  );
}
