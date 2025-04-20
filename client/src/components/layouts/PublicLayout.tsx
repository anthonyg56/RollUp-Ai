import { PropsWithChildren } from "react";

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div>PublicLayout
      {children}
    </div>
  );
}