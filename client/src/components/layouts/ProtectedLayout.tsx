import { PropsWithChildren } from "react";

export default function ProtectedLayout({ children }: PropsWithChildren) {
  return (
    <div>
      ProtectedLayout
      {children}
    </div>
  );
}
