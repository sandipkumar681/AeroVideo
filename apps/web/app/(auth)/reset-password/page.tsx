import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = {
  title: "Reset Password - AeroVideo",
  description: "Recover your account by resetting your password.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  );
}
