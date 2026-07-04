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
  title: "",
  description: "",
};

const page = () => {
  return (
    <section className="grid h-dvh place-items-center">
      <Card className="w-xs sm:w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>{/* <LoginForm /> */}</CardContent>

        <CardFooter className="flex-col gap-2">
          <div className="flex justify-center gap-1">
            Don&apos;t have an account?
            <Link
              href="/register"
              className="hover:underline">
              Create
            </Link>
          </div>
          <Link
            href={"/forgot-password" as never}
            className="text-muted-foreground text-xs hover:underline">
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
};

export default page;
