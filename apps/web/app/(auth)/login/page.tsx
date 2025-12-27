import { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login - AeroVideo",
  description: "Login to your AeroVideo account",
};

export default function Login() {
  return <LoginForm />;
}
