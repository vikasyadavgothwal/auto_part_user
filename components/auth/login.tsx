"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { FirebaseError } from "firebase/app"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RequiredMark } from "@/components/ui/required-mark"
import {
  createFirebaseLoginPayload,
  isFirebaseAuthConfigured,
} from "@/lib/auth/firebase-client"
import type { AuthApiPayload } from "@/lib/auth/types"
import { appRoutes, withBasePath } from "@/lib/routes"

function getLoginError(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/invalid-credential") {
      return "The email or password is incorrect."
    }
    if (error.code === "auth/too-many-requests") {
      return "Too many attempts. Try again later."
    }
  }
  return error instanceof Error ? error.message : "Unable to sign in."
}

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("Enter a valid email address.")
      return
    }
    if (password.length < 8 || password.length > 128) {
      toast.error("Password must be between 8 and 128 characters.")
      return
    }
    setIsSubmitting(true)

    try {
      const body = isFirebaseAuthConfigured()
        ? await createFirebaseLoginPayload(normalizedEmail, password)
        : {
            email: normalizedEmail,
            password,
            deviceName: "User dashboard",
          }
      const response = await fetch(withBasePath("/api/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
      const payload = (await response.json()) as AuthApiPayload

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? "Unable to sign in." : payload.message,
        )
      }

      toast.success("Signed in successfully")
      router.replace(appRoutes.overview)
      router.refresh()
    } catch (loginError) {
      toast.error(getLoginError(loginError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-brand-surface px-4 py-8 sm:py-10">
      <div className="w-full max-w-md">
        <Card className="border border-border bg-brand-elevated text-foreground shadow-2xl shadow-black/20 ring-0">
          <CardHeader className="space-y-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-brand-panel px-3 py-1 text-xs text-brand-muted">
              <ShieldCheck className="size-3.5" />
              Secure user access
            </div>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription className="text-brand-muted">
              Access and refresh tokens are stored in secure HttpOnly cookies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form noValidate className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email<RequiredMark /></Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  maxLength={254}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-11 border-border bg-brand-surface"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password<RequiredMark /></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    minLength={8}
                    maxLength={128}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-11 border-border bg-brand-surface pr-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-brand-muted hover:bg-transparent hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full"
              >
                {isSubmitting ? "Signing in..." : "Sign in to dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
