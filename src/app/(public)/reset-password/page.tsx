import ResetPasswordForm from "@/components/Auth/ResetPasswordForm";
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
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password",
};

const ResetPasswordPage = () => {
  return (
    <section className="grid h-dvh place-items-center">
      <Card className="w-xs sm:w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>

        <CardContent>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
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

export default ResetPasswordPage;
