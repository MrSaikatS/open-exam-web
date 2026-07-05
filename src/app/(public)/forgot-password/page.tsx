import ForgotPasswordForm from "@/components/Auth/ForgotPasswordForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your password",
};

const ForgotPasswordPage = () => {
  return (
    <section className="grid h-dvh place-items-center">
      <Card className="w-xs sm:w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ForgotPasswordForm />
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            href="/"
            className="text-muted-foreground text-xs hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
};

export default ForgotPasswordPage;
