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

        // Vérifier si l'utilisateur a été créé
        if (result.data?.user) {
          console.log("✅ User created successfully:", result.data.user);
          setShowConfirmation(true);
          return;
        }

        console.log("✅ Sign up successful with session");
      } else {
        console.log("🔑 Attempting sign in...");
        const result = await signIn(email, password);
        console.log("✅ Sign in result:", result);

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
  if (showConfirmation) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">
            Compte créé avec succès ! ✅
          </CardTitle>
          <CardDescription>
            Vous pouvez maintenant vous connecter
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800 mb-2">
              <strong>Compte créé pour :</strong> {fullName}
            </p>
            <p className="text-sm text-green-600">
              Votre compte a été créé avec l'email : <strong>{email}</strong>
            </p>
          </div>

          <Button
            onClick={async () => {
              try {
                const result = await signIn(email, password);
                if (result.error) {
                  setShowConfirmation(false);
                  onToggleMode(); // Basculer vers le mode connexion
                } else {
                  console.log("✅ Auto sign-in successful");
                }
              } catch (error) {
                console.error("💥 Auto sign-in error:", error);
                setShowConfirmation(false);
                onToggleMode();
              }
            }}
            className="w-full"
          >
            Se connecter maintenant
          </Button>
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
