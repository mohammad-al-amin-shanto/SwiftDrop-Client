import React from "react";
import RegisterForm from "../../components/auth/RegisterForm";
import { AppShell } from "../../components/layout/AppShell";

const RegisterPage: React.FC = () => {
  return (
    <AppShell hideChrome>
      <div className="max-w-3xl mx-auto py-12">
        <RegisterForm />
      </div>
    </AppShell>
  );
};

export default RegisterPage;
