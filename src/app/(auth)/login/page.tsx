// src/app/(auth)/login/page.tsx

import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
