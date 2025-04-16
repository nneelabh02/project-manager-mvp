// src/app/(auth)/signup/page.tsx

import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
