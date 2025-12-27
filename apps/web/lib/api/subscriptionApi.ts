import { BACKEND_URL } from "@/constant";
import { handleResponse } from "./videoApi";

export interface SubscriptionResponse {
  statusCode: number;
  data: {
    subscribed: boolean;
  };
  message: string;
  success: boolean;
}

export const toggleSubscription = async (
  channelId: string
): Promise<SubscriptionResponse> => {
  const response = await fetch(
    `${BACKEND_URL}/subscriptions/toggle/${channelId}`,
    {
      method: "POST",
      credentials: "include",
    }
  );
  return handleResponse(response);
};

export const getSubscriberCount = async (
  channelId: string
): Promise<{ count: number }> => {
  const response = await fetch(
    `${BACKEND_URL}/subscriptions/subscribers/${channelId}`
  );
  return handleResponse(response);
};
export interface SubscribedChannel {
  _id: string;
  channel: {
    _id: string;
    userName: string;
    fullName: string;
    avatar: string;
    subscriberCount: number;
  };
  createdAt: string;
}

export const getSubscribedChannels = async (): Promise<SubscribedChannel[]> => {
  const response = await fetch(`${BACKEND_URL}/subscriptions/subscribed`, {
    method: "GET",
    credentials: "include",
  });
  const data = await handleResponse(response);
  return data.data;
};
