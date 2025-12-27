import { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register - AeroVideo",
  description: "Create a new account on AeroVideo",
};

export default function Register() {
  return <RegisterForm />;
}
