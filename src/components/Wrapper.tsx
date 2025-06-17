import React, { ReactNode } from "react";

interface Props {
  styles?: string;
  children: ReactNode;
}

export default function Wrapper({ styles, children }: Props) {
  return <div className={`container mx-auto px-4 sm:px-6 md:px-8 ${styles}`}>{children}</div>;
}
