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
import { useTranslations } from "@/lib/i18n";

interface LoginFormProps {
  onToggleMode: () => void;
  isSignUp: boolean;
}

export function LoginForm({ onToggleMode, isSignUp }: LoginFormProps) {
  const { signIn, signUp } = useAuth();
  const t = useTranslations('authForm');
  const tCommon = useTranslations('common');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check if passwords match (only if both fields have values)
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Validate password confirmation
        if (password !== confirmPassword) {
          throw new Error(t('passwordsDontMatch'));
        }

        const result = await signUp(email, password);

        if (result.error) {
          throw result.error;
        }

        // Check if user was created
        if (result.data?.user) {
          setShowConfirmation(true);
          return;
        }
      } else {
        const result = await signIn(email, password);

        if (result.error) {
          throw result.error;
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t('anErrorOccurred'));
    } finally {
      setLoading(false);
    }
  }

  // Signup confirmation page
  if (showConfirmation) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">
            {t('accountCreatedSuccess')} ✅
          </CardTitle>
          <CardDescription>
            {t('canNowSignIn')}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">
              {t('accountCreatedWith')} <strong>{email}</strong>
            </p>
          </div>

          <Button
            onClick={async () => {
              try {
                const result = await signIn(email, password);
                if (result.error) {
                  setShowConfirmation(false);
                  onToggleMode();
                }
              } catch {
                setShowConfirmation(false);
                onToggleMode();
              }
            }}
            className="w-full"
          >
            {t('signInNow')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {isSignUp ? t('createAccount') : t('welcomeBack')}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? t('startJourney')
            : t('signInToContinue')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={
                isSignUp && password
                  ? passwordsMatch
                    ? "border-green-500 focus-visible:ring-green-500"
                    : passwordsDontMatch
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                  : ""
              }
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={isSignUp}
                minLength={6}
                className={
                  confirmPassword
                    ? passwordsMatch
                      ? "border-green-500 focus-visible:ring-green-500"
                      : passwordsDontMatch
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                    : ""
                }
              />
              {passwordsMatch && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  ✓ {t('passwordsMatch')}
                </p>
              )}
              {passwordsDontMatch && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  ✗ {t('passwordsDontMatch')}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? tCommon('loading') : isSignUp ? t('createAccount') : t('signIn')}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-blue-600 hover:underline"
          >
            {isSignUp
              ? t('alreadyHaveAccount')
              : t('dontHaveAccount')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
