import { LayoutProps } from "@/lib/types";

const PrivateLayout = async ({ children }: LayoutProps) => {
  return <main className="">{children}</main>;
};

export default PrivateLayout;
