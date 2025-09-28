"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginFormProps {
  onToggleMode: () => void;
  isSignUp: boolean;
}

export function LoginForm({ onToggleMode, isSignUp }: LoginFormProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("🔄 Form submitted:", { isSignUp, email, fullName });
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        console.log("📝 Attempting sign up...");
        const result = await signUp(email, password, fullName);
        console.log("✅ Sign up result:", result);

        if (result.error) {
          console.error("❌ Sign up error:", result.error);
          throw result.error;
        }

        // Si pas de session mais utilisateur créé = confirmation email requise
        if (result.data?.user && !result.data?.session) {
          console.log("📧 Email confirmation required");
          setShowConfirmation(true);
          return;
        }

        console.log("✅ Sign up successful with session");
      } else {
        console.log("🔑 Attempting sign in...");
        const result = await signIn(email, password);
        console.log("✅ Sign in result:", result);
        console.log(showConfirmation);

        if (result.error) {
          console.error("❌ Sign in error:", result.error);
          throw result.error;
        }
      }
    } catch (error: any) {
      console.error("💥 Auth error:", error);
      setError(error.message);
    } finally {
      console.log("⏹️ Setting loading to false");
      setLoading(false);
    }
  }

  // Page de confirmation d'inscription
  console.log("🔍 showConfirmation state:", showConfirmation);
  if (showConfirmation) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">
            Compte créé avec succès ! ✅
          </CardTitle>
          <CardDescription>Vérifiez votre boîte email</CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Email envoyé à :</strong> {email}
            </p>
            <p className="text-sm text-blue-600">
              Cliquez sur le lien de confirmation dans votre email pour activer
              votre compte et commencer votre entraînement.
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Vérifiez aussi votre dossier spam/courrier indésirable</p>
            <p>• Le lien est valide pendant 24 heures</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? "Start your calisthenics journey"
            : "Sign in to continue your training"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isSignUp}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-blue-600 hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
