import type { Metadata } from "next";
import React from "react";
import Login from "./sign-up";

export const metadata: Metadata = {
  title: "Registro",
  description: "Crea tu cuenta en Tech Centre y accede a nuestros programas académicos en tecnología. Regístrate para comenzar tu formación profesional.",
  robots: {
    index: false,
    follow: false,
  },
};

const LoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-5 py-20">
      <Login />
    </div>
  );
};

export default LoginPage;
