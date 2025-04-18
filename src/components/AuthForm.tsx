"use client";

import { useState, FormEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Database } from "@/types/supabase";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [errorMsg, setErrorMsg] = useState("");
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.refresh(); // Refresh the page to update the session
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Check your email to verify your account!");
        setIsLogin(true);
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-lg shadow-md w-full"
    >
      <h2 className="text-2xl font-bold text-center">
        {isLogin ? "Log In" : "Sign Up"}
      </h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {isLogin ? "Log In" : "Sign Up"}
      </button>

      {errorMsg && (
        <p className="text-red-600 text-sm text-center">{errorMsg}</p>
      )}

      <p className="text-sm text-center">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button
          type="button"
          className="ml-1 text-blue-600 underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Sign Up" : "Log In"}
        </button>
      </p>
    </form>
  );
}
