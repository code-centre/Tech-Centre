import React, { ReactNode } from "react";

interface Props {
  styles?: string;
  children: ReactNode;
}

export default function Wrapper({ styles, children }: Props) {
  return <div className={`mx-auto px-5 ${styles}`}>{children}</div>;
}
