"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticatedFetch } from "@/lib/auth/client";
import { withBasePath } from "@/lib/routes";

type Feedback = { title: string; message: string };

export function ChangePasswordCard() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    if (!form.currentPassword) {
      setFeedback({ title: "Validation Error", message: "Current password is required" });
      return;
    }
    if (form.newPassword.length < 8 || form.newPassword.length > 128) {
      setFeedback({ title: "Validation Error", message: "New password must be between 8 and 128 characters" });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setFeedback({ title: "Validation Error", message: "New passwords do not match" });
      return;
    }

    setIsSaving(true);
    try {
      const response = await authenticatedFetch(withBasePath("/api/auth/change-password"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Unable to change password");
      }
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setFeedback({ title: "Password Changed", message: payload.message || "Password changed successfully" });
    } catch (error) {
      setFeedback({
        title: "Unable To Change Password",
        message: error instanceof Error ? error.message : "Unable to change password",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
      <Dialog open={Boolean(feedback)} onOpenChange={(open) => !open && setFeedback(null)}>
        <DialogContent className="border-border bg-brand-panel text-foreground">
          <DialogHeader>
            <DialogTitle>{feedback?.title}</DialogTitle>
            <DialogDescription>{feedback?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button type="button" onClick={() => setFeedback(null)}>OK</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        {([
          ["currentPassword", "Current Password", "current-password"],
          ["newPassword", "New Password", "new-password"],
          ["confirmPassword", "Confirm Password", "new-password"],
        ] as const).map(([key, label, autocomplete]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`user-${key}`}>{label}</Label>
            <Input
              id={`user-${key}`}
              type="password"
              autoComplete={autocomplete}
              value={form[key]}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              maxLength={128}
              className="border-border bg-brand-surface"
            />
          </div>
        ))}
        <div className="md:col-span-3">
          <Button type="button" variant="outline" disabled={isSaving} onClick={submit} className="gap-2">
            <KeyRound className="size-4" />
            {isSaving ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
