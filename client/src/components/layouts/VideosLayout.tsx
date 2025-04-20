import { PropsWithChildren } from "react";

export default function VideosLayout({ children }: PropsWithChildren) {
  return (
    <div>
      <h1>Videos</h1>
      {children}
    </div>
  );
}
