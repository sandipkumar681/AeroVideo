export interface IPaymentRequest {
  amount: number;
}

export interface IPaymentResponse {
  success: boolean;
  message: string;
  orderId?: string;
  amount?: number;
  currency?: string;
}

export interface IVerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
