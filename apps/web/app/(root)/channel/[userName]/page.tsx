import { getChannelProfile } from "@/lib/api/userApi";
import ChannelContent from "./ChannelContent";
import { Metadata } from "next";

interface Props {
  params: {
    userName: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userName: string }>;
}): Promise<Metadata> {
  const { userName } = await params;

  try {
    const response = await getChannelProfile(userName);
    const channel = response.data;

    if (!channel) {
      return {
        title: "Channel Not Found",
      };
    }

    const title = `${channel.fullName || channel.userName} (@${
      channel.userName
    }) - AeroVideo`;
    const description = `Watch videos from ${
      channel.fullName || channel.userName
    } on AeroVideo. ${channel.totalSubscribers} subscribers and ${
      channel.channelInfo?.totalViews || 0
    } total views.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        username: channel.userName,
        images: channel.avatar ? [channel.avatar] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: channel.avatar ? [channel.avatar] : [],
      },
    };
  } catch (error) {
    return {
      title: "Channel - AeroVideo",
    };
  }
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ userName: string }>;
}) {
  const { userName } = await params;

  return <ChannelContent userName={userName} />;
}
