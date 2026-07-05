import RegisterForm from "@/components/Auth/RegisterForm";
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
  title: "Create an account",
  description: "Create an account to get started",
};

const RegisterPage = () => {
  return (
    <section className="grid h-dvh place-items-center">
      <Card className="w-xs sm:w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Create an account to get started</CardDescription>
        </CardHeader>

        <CardContent>
          <RegisterForm />
        </CardContent>

        <CardFooter className="justify-center">
          <div className="flex justify-center gap-1">
            Already have an account?
            <Link
              href="/"
              className="hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
};

export default RegisterPage;
