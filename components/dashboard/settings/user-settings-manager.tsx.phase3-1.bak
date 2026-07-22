"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
} from "firebase/auth";
import {
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquareText,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import {
  getFirebaseAuthDiagnostics,
  getFirebaseAuth,
  isFirebaseAuthConfigured,
} from "@/lib/auth/firebase-client";
import {
  formFromProfile,
  payloadFromForm,
  type UserProfileFormValues,
  type UserProfileRecord,
} from "@/lib/user-settings";
import {
  emptyAddressForm,
  payloadFromAddressForm,
  type UserAddressFormValues,
  type UserAddressRecord,
} from "@/lib/user-addresses";
import { withBasePath } from "@/lib/routes";

type SettingsPayload = {
  ok: boolean;
  profile?: UserProfileRecord;
  message?: string;
  verificationLink?: string;
};

type AddressesPayload = {
  ok: boolean;
  addresses?: UserAddressRecord[];
  address?: UserAddressRecord;
  message?: string;
};

type UserSettingsManagerProps = {
  profile: UserProfileRecord;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\+\d{8,18}$/;
const POSTAL_CODE_PATTERN = /^[A-Za-z0-9 -]*$/;
const MOBILE_COUNTRY_CODES = [
  { code: "+971", label: "UAE" },
  { code: "+91", label: "India" },
  { code: "+966", label: "Saudi Arabia" },
  { code: "+1", label: "United States" },
  { code: "+44", label: "United Kingdom" },
  { code: "+974", label: "Qatar" },
  { code: "+965", label: "Kuwait" },
  { code: "+968", label: "Oman" },
  { code: "+973", label: "Bahrain" },
  { code: "+92", label: "Pakistan" },
] as const;
const DEFAULT_MOBILE_COUNTRY_CODE = "+971";

const normalizeDigits = (value: string, maxLength = 14) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const parseMobileNumber = (value: string) => {
  const compact = value.replace(/[^\d+]/g, "");
  const countryCode =
    [...MOBILE_COUNTRY_CODES]
      .sort((first, second) => second.code.length - first.code.length)
      .find((country) => compact.startsWith(country.code))?.code ??
    DEFAULT_MOBILE_COUNTRY_CODE;
  const localNumber = normalizeDigits(
    compact.startsWith(countryCode)
      ? compact.slice(countryCode.length)
      : compact.replace(/^\+/, ""),
  );

  return { countryCode, localNumber };
};

const buildMobileNumber = (countryCode: string, localNumber: string) => {
  const digits = normalizeDigits(localNumber);
  return digits ? `${countryCode}${digits}` : "";
};

const formFromAddress = (
  address: UserAddressRecord,
): UserAddressFormValues => ({
  label: address.label,
  recipientName: address.recipientName,
  phone: address.phone,
  addressLine1: address.addressLine1,
  addressLine2: address.addressLine2 ?? "",
  landmark: address.landmark ?? "",
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
  isDefault: address.isDefault,
});

const normalizeMobileValue = (value: string) => {
  const parsed = parseMobileNumber(value);
  return buildMobileNumber(parsed.countryCode, parsed.localNumber);
};

const getFirebasePhoneErrorMessage = (error: unknown) => {
  const diagnostics = getFirebaseAuthDiagnostics();
  const origin =
    diagnostics.origin === "server" ? "this domain" : diagnostics.origin;

  if (!(error instanceof FirebaseError)) {
    return error instanceof Error
      ? error.message
      : "Unable to verify mobile number";
  }

  const messages: Record<string, string> = {
    "auth/captcha-check-failed": "Phone verification failed. Try again.",
    "auth/credential-already-in-use":
      "This mobile number is already linked to another account.",
    "auth/invalid-phone-number": "Enter a valid mobile number.",
    "auth/invalid-app-credential": `Phone verification is blocked for ${origin}. Add this domain in Firebase Auth Authorized domains and, if your Firebase API key is restricted, add ${origin}/* in Google Cloud API key HTTP referrers.`,
    "auth/invalid-verification-code": "The OTP is incorrect.",
    "auth/missing-verification-code": "Enter the OTP.",
    "auth/operation-not-allowed":
      "Phone authentication is not enabled in Firebase.",
    "auth/quota-exceeded": "Firebase SMS quota is exceeded. Try again later.",
    "auth/too-many-requests": "Too many OTP attempts. Try again later.",
  };

  return messages[error.code] ?? "Unable to verify mobile number";
};

const logFirebasePhoneError = (error: unknown) => {
  if (
    error instanceof FirebaseError &&
    error.code === "auth/invalid-app-credential"
  ) {
    console.warn("Firebase phone auth app verifier rejected", {
      ...getFirebaseAuthDiagnostics(),
      code: error.code,
      message: error.message,
    });
  }
};

export function UserSettingsManager({ profile }: UserSettingsManagerProps) {
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const initialForm = {
    ...formFromProfile(profile),
    phone: normalizeMobileValue(profile.phone ?? ""),
  };
  const initialMobile = parseMobileNumber(initialForm.phone);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [form, setForm] = useState<UserProfileFormValues>(initialForm);
  const [mobileCountryCode, setMobileCountryCode] = useState<string>(
    initialMobile.countryCode,
  );
  const [mobileLocalNumber, setMobileLocalNumber] = useState(
    initialMobile.localNumber,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState<UserAddressRecord[]>([]);
  const [addressForm, setAddressForm] =
    useState<UserAddressFormValues>(emptyAddressForm);
  const [editingAddress, setEditingAddress] =
    useState<UserAddressRecord | null>(null);
  const [addressPendingDelete, setAddressPendingDelete] =
    useState<UserAddressRecord | null>(null);
  const [editAddressForm, setEditAddressForm] =
    useState<UserAddressFormValues>(emptyAddressForm);
  const [addressError, setAddressError] = useState("");
  const [editAddressError, setEditAddressError] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState("");
  const [defaultingAddressId, setDefaultingAddressId] = useState("");
  const [otp, setOtp] = useState("");
  const [mobileVerificationId, setMobileVerificationId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    let mounted = true;
    authenticatedFetch(withBasePath("/api/addresses"), {
      method: "GET",
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as AddressesPayload;
        if (!response.ok || !payload.ok) {
          throw new Error(payload.message || "Unable to load addresses");
        }
        if (mounted) setAddresses(payload.addresses ?? []);
      })
      .catch((loadError) => {
        if (mounted) {
          setAddressError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load addresses",
          );
        }
      })
      .finally(() => {
        if (mounted) setIsLoadingAddresses(false);
      });

    return () => {
      mounted = false;
      recaptchaVerifier.current?.clear();
      recaptchaVerifier.current = null;
    };
  }, []);

  const setField = <Key extends keyof UserProfileFormValues>(
    key: Key,
    value: UserProfileFormValues[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setAddressField = <Key extends keyof UserAddressFormValues>(
    key: Key,
    value: UserAddressFormValues[Key],
  ) => {
    setAddressForm((current) => ({ ...current, [key]: value }));
    setAddressError("");
  };

  const setEditAddressField = <Key extends keyof UserAddressFormValues>(
    key: Key,
    value: UserAddressFormValues[Key],
  ) => {
    setEditAddressForm((current) => ({ ...current, [key]: value }));
    setEditAddressError("");
  };

  const openEditAddress = (address: UserAddressRecord) => {
    setEditingAddress(address);
    setEditAddressForm(formFromAddress(address));
    setEditAddressError("");
    setAddressError("");
  };

  const closeEditAddress = () => {
    if (isUpdatingAddress) return;
    setEditingAddress(null);
    setEditAddressForm(emptyAddressForm);
    setEditAddressError("");
  };

  const closeDeleteAddressDialog = () => {
    if (deletingAddressId) return;
    setAddressPendingDelete(null);
  };

  const clearRecaptchaVerifier = () => {
    recaptchaVerifier.current?.clear();
    recaptchaVerifier.current = null;
    document.getElementById("user-mobile-recaptcha")?.replaceChildren();
  };

  const getRecaptchaVerifier = () => {
    clearRecaptchaVerifier();
    const verifier = new RecaptchaVerifier(
      getFirebaseAuth(),
      "user-mobile-recaptcha",
      { size: "invisible" },
    );
    recaptchaVerifier.current = verifier;
    return verifier;
  };

  const syncProfileForm = (nextProfile: UserProfileRecord) => {
    const nextForm = {
      ...formFromProfile(nextProfile),
      phone: normalizeMobileValue(nextProfile.phone ?? ""),
    };
    const nextMobile = parseMobileNumber(nextForm.phone);
    setForm(nextForm);
    setMobileCountryCode(nextMobile.countryCode);
    setMobileLocalNumber(nextMobile.localNumber);
  };

  const setMobileNumber = (countryCode: string, localNumber: string) => {
    const digits = normalizeDigits(localNumber);
    setMobileCountryCode(countryCode);
    setMobileLocalNumber(digits);
    setField("phone", buildMobileNumber(countryCode, digits));
  };

  const validateForm = () => {
    if (!form.firstName.trim()) return "First name is required";
    if (form.companyName.trim().length > 160) {
      return "Company name must be 160 characters or fewer";
    }
    if (
      form.firstName.trim().length > 100 ||
      form.lastName.trim().length > 100
    ) {
      return "Name fields must be 100 characters or fewer";
    }
    if (form.email && !EMAIL_PATTERN.test(form.email)) {
      return "Enter a valid email address";
    }
    if (form.phone && !MOBILE_PATTERN.test(form.phone)) {
      return "Enter a valid mobile number";
    }
    if (form.postalCode && !POSTAL_CODE_PATTERN.test(form.postalCode)) {
      return "Postal code contains invalid characters";
    }
    return "";
  };

  const validateAddressForm = (values: UserAddressFormValues) => {
    if (!values.label.trim()) return "Address label is required";
    if (!values.recipientName.trim()) return "Recipient name is required";
    if (!values.phone.trim()) return "Phone number is required";
    if (!/^\+?[0-9][0-9\s()-]{6,24}$/.test(values.phone.trim())) {
      return "Enter a valid phone number";
    }
    if (!values.addressLine1.trim()) return "Address line 1 is required";
    if (!values.city.trim()) return "City is required";
    if (!values.state.trim()) return "State is required";
    if (!/^[A-Za-z0-9 -]{3,20}$/.test(values.postalCode.trim())) {
      return "Enter a valid postal code";
    }
    if (!values.country.trim()) return "Country is required";
    return "";
  };

  const saveAddress = async () => {
    setAddressError("");
    const validationError = validateAddressForm(addressForm);
    if (validationError) {
      setAddressError(validationError);
      return;
    }

    setIsSavingAddress(true);
    try {
      const response = await authenticatedFetch(withBasePath("/api/addresses"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payloadFromAddressForm(addressForm)),
      });
      const payload = (await response.json()) as AddressesPayload;
      if (!response.ok || !payload.ok || !payload.address) {
        throw new Error(payload.message || "Unable to save address");
      }
      setAddresses((current) => {
        const existing = payload.address?.isDefault
          ? current.map((address) => ({ ...address, isDefault: false }))
          : current;
        return [payload.address as UserAddressRecord, ...existing];
      });
      setAddressForm(emptyAddressForm);
      toast.success("Delivery address saved");
    } catch (saveError) {
      setAddressError(
        saveError instanceof Error ? saveError.message : "Unable to save address",
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  const updateAddress = async () => {
    if (!editingAddress) return;
    setEditAddressError("");
    const validationError = validateAddressForm(editAddressForm);
    if (validationError) {
      setEditAddressError(validationError);
      return;
    }

    setIsUpdatingAddress(true);
    try {
      const response = await authenticatedFetch(
        withBasePath(`/api/addresses/${encodeURIComponent(editingAddress.id)}`),
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payloadFromAddressForm(editAddressForm)),
        },
      );
      const payload = (await response.json()) as AddressesPayload;
      if (!response.ok || !payload.ok || !payload.address) {
        throw new Error(payload.message || "Unable to update address");
      }
      setAddresses((current) =>
        current.map((item) =>
          item.id === payload.address?.id
            ? payload.address
            : payload.address?.isDefault
              ? { ...item, isDefault: false }
              : item,
        ),
      );
      setEditingAddress(null);
      setEditAddressForm(emptyAddressForm);
      toast.success("Delivery address updated");
    } catch (updateError) {
      setEditAddressError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update address",
      );
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const setDefaultAddress = async (address: UserAddressRecord) => {
    if (address.isDefault) return;
    setAddressError("");
    setDefaultingAddressId(address.id);
    try {
      const response = await authenticatedFetch(
        withBasePath(`/api/addresses/${encodeURIComponent(address.id)}`),
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            payloadFromAddressForm({
              label: address.label,
              recipientName: address.recipientName,
              phone: address.phone,
              addressLine1: address.addressLine1,
              addressLine2: address.addressLine2 ?? "",
              landmark: address.landmark ?? "",
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country,
              isDefault: true,
            }),
          ),
        },
      );
      const payload = (await response.json()) as AddressesPayload;
      if (!response.ok || !payload.ok || !payload.address) {
        throw new Error(payload.message || "Unable to update address");
      }
      setAddresses((current) =>
        current.map((item) =>
          item.id === payload.address?.id
            ? payload.address
            : { ...item, isDefault: false },
        ),
      );
      toast.success("Default delivery address updated");
    } catch (updateError) {
      setAddressError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update address",
      );
    } finally {
      setDefaultingAddressId("");
    }
  };

  const deleteAddress = async (addressId: string) => {
    setAddressError("");
    setDeletingAddressId(addressId);
    try {
      const response = await authenticatedFetch(
        withBasePath(`/api/addresses/${encodeURIComponent(addressId)}`),
        { method: "DELETE" },
      );
      const payload = (await response.json()) as AddressesPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Unable to delete address");
      }
      setAddresses((current) => current.filter((item) => item.id !== addressId));
      setAddressPendingDelete(null);
      toast.success("Delivery address deleted");
    } catch (deleteError) {
      setAddressError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete address",
      );
    } finally {
      setDeletingAddressId("");
    }
  };

  const persistSettings = async () => {
    const response = await authenticatedFetch(withBasePath("/api/settings"), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payloadFromForm(form)),
    });
    const payload = (await response.json()) as SettingsPayload;
    if (!response.ok || !payload.ok || !payload.profile) {
      throw new Error(payload.message || "Unable to save settings");
    }
    setCurrentProfile(payload.profile);
    syncProfileForm(payload.profile);
    return payload.profile;
  };

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const pendingEmail = form.email;
      const pendingPhone = form.phone;
      const pendingMobileCountryCode = mobileCountryCode;
      const pendingMobileLocalNumber = mobileLocalNumber;
      const emailChanged =
        pendingEmail.trim().toLowerCase() !== (currentProfile.email ?? "");
      const phoneChanged =
        normalizeMobileValue(pendingPhone) !==
        normalizeMobileValue(currentProfile.phone ?? "");
      await persistSettings();
      if (emailChanged || phoneChanged) {
        setForm((current) => ({
          ...current,
          ...(emailChanged ? { email: pendingEmail } : {}),
          ...(phoneChanged ? { phone: pendingPhone } : {}),
        }));
        if (phoneChanged) {
          setMobileCountryCode(pendingMobileCountryCode);
          setMobileLocalNumber(pendingMobileLocalNumber);
        }
      }
      setMessage(
        emailChanged || phoneChanged
          ? "Profile saved. Verify changed email or mobile before it becomes active on your account."
          : "Settings saved",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save settings",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const sendEmailVerification = async () => {
    setError("");
    setMessage("");
    const email = form.email.trim().toLowerCase();
    if (!email) {
      setError("Enter an email before verification");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await authenticatedFetch(
        withBasePath("/api/settings/email-verification"),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const payload = (await response.json()) as SettingsPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Unable to send verification link");
      }
      setMessage(
        payload.verificationLink
          ? `${payload.message} ${payload.verificationLink}`
          : payload.message || "Verification link sent",
      );
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unable to send verification link",
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const sendMobileOtp = async () => {
    setError("");
    setMessage("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const normalizedPhone = normalizeMobileValue(form.phone);
    if (!normalizedPhone) {
      setError("Enter a mobile number before verification");
      return;
    }
    if (!isFirebaseAuthConfigured()) {
      setError("Firebase phone authentication is not configured");
      return;
    }

    setIsSendingOtp(true);
    try {
      const provider = new PhoneAuthProvider(getFirebaseAuth());
      let verificationId: string;
      try {
        verificationId = await provider.verifyPhoneNumber(
          normalizedPhone,
          getRecaptchaVerifier(),
        );
      } catch (error) {
        clearRecaptchaVerifier();
        throw error;
      }
      setMobileVerificationId(verificationId);
      setOtp("");
      setMessage("OTP sent by Firebase");
    } catch (sendError) {
      logFirebasePhoneError(sendError);
      setError(getFirebasePhoneErrorMessage(sendError));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyMobileOtp = async () => {
    setError("");
    setMessage("");
    setIsVerifyingOtp(true);

    try {
      if (!mobileVerificationId) throw new Error("Send OTP first");
      if (!isFirebaseAuthConfigured()) {
        throw new Error("Firebase phone authentication is not configured");
      }
      const credential = PhoneAuthProvider.credential(
        mobileVerificationId,
        otp,
      );
      const phoneCredential = await signInWithCredential(
        getFirebaseAuth(),
        credential,
      );
      const firebaseIdToken = await phoneCredential.user.getIdToken(true);

      const response = await authenticatedFetch(
        withBasePath("/api/settings/mobile-otp/verify"),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ firebaseIdToken }),
        },
      );
      const payload = (await response.json()) as SettingsPayload;
      if (!response.ok || !payload.ok || !payload.profile) {
        throw new Error(payload.message || "Unable to verify OTP");
      }

      setCurrentProfile(payload.profile);
      syncProfileForm(payload.profile);
      setOtp("");
      setMobileVerificationId("");
      setMessage("Mobile number verified");
    } catch (verifyError) {
      setError(getFirebasePhoneErrorMessage(verifyError));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const emailVerified =
    Boolean(currentProfile.emailVerifiedAt) &&
    form.email.trim().toLowerCase() === (currentProfile.email ?? "");
  const mobileVerified =
    Boolean(currentProfile.mobileVerifiedAt) &&
    normalizeMobileValue(form.phone) ===
      normalizeMobileValue(currentProfile.phone ?? "");
  const emailChanged =
    form.email.trim().toLowerCase() !== (currentProfile.email ?? "");
  const phoneChanged =
    normalizeMobileValue(form.phone) !==
    normalizeMobileValue(currentProfile.phone ?? "");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-sm text-[#9CA3AF]">
          Manage your profile details and verified contact information.
        </p>
      </div>
      <div id="user-mobile-recaptcha" />

      {message ? (
        <p className="break-words rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </p>
      ) : null}

      <form className="space-y-8" onSubmit={saveSettings}>
        <Card className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] shadow-none">
          <CardHeader>
            <CardTitle className="text-white">Contact Verification</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="user-email">Email</Label>
              {emailVerified ? (
                <Badge className="bg-green-500/10 text-green-400">
                  Verified
                </Badge>
              ) : emailChanged ? (
                <Badge
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400"
                >
                  Needs verification
                </Badge>
              ) : null}
            </div>
            <Input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
            {!emailVerified ? (
              <Button
                type="button"
                variant="outline"
                onClick={sendEmailVerification}
                disabled={isSendingEmail}
                className="gap-2"
              >
                <Mail className="size-4" />
                {isSendingEmail ? "Sending..." : "Send verification link"}
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="user-mobile">Mobile</Label>
              {mobileVerified ? (
                <Badge className="bg-green-500/10 text-green-400">
                  Verified
                </Badge>
              ) : phoneChanged ? (
                <Badge
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400"
                >
                  Needs verification
                </Badge>
              ) : null}
            </div>
            <div className="flex min-w-0">
              <select
                aria-label="Mobile country code"
                value={mobileCountryCode}
                onChange={(event) =>
                  setMobileNumber(event.target.value, mobileLocalNumber)
                }
                className="h-11 w-36 shrink-0 rounded-l-sm border border-[#2A2A2A] bg-[#0A0A0A] px-3 text-sm text-white outline-none transition-colors focus-visible:border-[#DC2626]"
              >
                {MOBILE_COUNTRY_CODES.map((country) => (
                  <option
                    key={`${country.code}-${country.label}`}
                    value={country.code}
                  >
                    {country.code} {country.label}
                  </option>
                ))}
              </select>
              <Input
                id="user-mobile"
                type="tel"
                value={mobileLocalNumber}
                onChange={(event) =>
                  setMobileNumber(mobileCountryCode, event.target.value)
                }
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="Mobile number"
                className="h-11 min-w-0 rounded-l-none border-l-0 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            {!mobileVerified ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendMobileOtp}
                  disabled={isSendingOtp}
                  className="gap-2"
                >
                  <MessageSquareText className="size-4" />
                  {isSendingOtp ? "Sending..." : "Send OTP"}
                </Button>
                <Input
                  value={otp}
                  onChange={(event) =>
                    setOtp(normalizeDigits(event.target.value, 6))
                  }
                  placeholder="OTP"
                  inputMode="numeric"
                  maxLength={6}
                  className="h-9 border-[#2A2A2A] bg-[#0A0A0A] sm:max-w-32"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={verifyMobileOtp}
                  disabled={isVerifyingOtp || !otp.trim()}
                  className="gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  Verify
                </Button>
              </div>
            ) : null}
          </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] shadow-none">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company</Label>
              <Input
                id="company-name"
                value={form.companyName}
                onChange={(event) =>
                  setField("companyName", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                value={form.firstName}
                onChange={(event) => setField("firstName", event.target.value)}
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                value={form.lastName}
                onChange={(event) => setField("lastName", event.target.value)}
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2 bg-[#DC2626] text-white hover:bg-[#B91C1C]"
              >
                <Save className="size-4" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MapPin className="size-5 text-[#DC2626]" />
            Saved Delivery Addresses
          </CardTitle>
          <p className="text-sm text-[#9CA3AF]">
            These addresses are saved only for your account and are used when
            you place product orders from the main website cart.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {addressError ? (
            <p
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {addressError}
            </p>
          ) : null}

          {isLoadingAddresses ? (
            <p className="text-sm text-[#9CA3AF]">Loading addresses...</p>
          ) : addresses.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="min-w-0 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-4"
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words font-semibold text-white">
                          {address.label}
                        </p>
                        {address.isDefault ? (
                          <Badge className="bg-green-500/10 text-green-400">
                            Default
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 break-words text-sm text-[#E5E7EB]">
                        {address.recipientName} | {address.phone}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEditAddress(address)}
                        className="gap-2"
                      >
                        <Pencil className="size-4" />
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultAddress(address)}
                        disabled={
                          address.isDefault || defaultingAddressId === address.id
                        }
                      >
                        {defaultingAddressId === address.id
                          ? "Saving..."
                          : "Default"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setAddressPendingDelete(address);
                          setAddressError("");
                        }}
                        disabled={deletingAddressId === address.id}
                        aria-label="Delete address"
                      >
                        <Trash2 className="size-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <p className="break-words text-sm leading-6 text-[#9CA3AF]">
                    {[
                      address.addressLine1,
                      address.addressLine2,
                      address.landmark,
                      address.city,
                      address.state,
                      address.postalCode,
                      address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-4 text-sm text-[#9CA3AF]">
              No saved delivery addresses yet.
            </p>
          )}

          <div className="grid gap-6 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delivery-label">Address Label</Label>
              <Input
                id="delivery-label"
                value={addressForm.label}
                onChange={(event) =>
                  setAddressField("label", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#111111]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-recipient">Recipient Name</Label>
              <Input
                id="delivery-recipient"
                value={addressForm.recipientName}
                onChange={(event) =>
                  setAddressField("recipientName", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#111111]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-phone">Phone</Label>
              <Input
                id="delivery-phone"
                value={addressForm.phone}
                onChange={(event) =>
                  setAddressField("phone", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#111111]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-postal">Postal Code</Label>
              <Input
                id="delivery-postal"
                value={addressForm.postalCode}
                onChange={(event) =>
                  setAddressField("postalCode", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#111111]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="delivery-line-1">Address Line 1</Label>
              <Input
                id="delivery-line-1"
                value={addressForm.addressLine1}
                onChange={(event) =>
                  setAddressField("addressLine1", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#111111]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="delivery-line-2">Address Line 2</Label>
              <Input
                id="delivery-line-2"
                value={addressForm.addressLine2}
                onChange={(event) =>
                  setAddressField("addressLine2", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#111111]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="delivery-landmark">Landmark</Label>
              <Input
                id="delivery-landmark"
                value={addressForm.landmark}
                onChange={(event) =>
                  setAddressField("landmark", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#111111]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-city">City</Label>
              <Input
                id="delivery-city"
                value={addressForm.city}
                onChange={(event) => setAddressField("city", event.target.value)}
                className="h-11 border-[#2A2A2A] bg-[#111111]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-state">State</Label>
              <Input
                id="delivery-state"
                value={addressForm.state}
                onChange={(event) =>
                  setAddressField("state", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#111111]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-country">Country</Label>
              <Input
                id="delivery-country"
                value={addressForm.country}
                onChange={(event) =>
                  setAddressField("country", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#111111]"
              />
            </div>
            <label className="flex items-center gap-2 self-end text-sm text-[#9CA3AF]">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(event) =>
                  setAddressField("isDefault", event.target.checked)
                }
                className="size-4 accent-[#DC2626]"
              />
              Use as default delivery address
            </label>
            <div className="md:col-span-2">
              <Button
                type="button"
                onClick={saveAddress}
                disabled={isSavingAddress}
                className="gap-2 bg-[#DC2626] text-white hover:bg-[#B91C1C]"
              >
                <Plus className="size-4" />
                {isSavingAddress ? "Saving..." : "Add Delivery Address"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(editingAddress)}
        onOpenChange={(open) => {
          if (!open) closeEditAddress();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-y-auto border border-[#2A2A2A] bg-[#1A1A1A] p-0 text-white sm:max-w-2xl">
          <DialogHeader className="border-b border-[#2A2A2A] px-6 py-5">
            <DialogTitle>Change Delivery Address</DialogTitle>
            <DialogDescription>
              Update the saved address used for product order delivery.
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-6 px-6 py-5 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              updateAddress();
            }}
          >
            {editAddressError ? (
              <p
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 md:col-span-2"
              >
                {editAddressError}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="edit-delivery-label">Address Label</Label>
              <Input
                id="edit-delivery-label"
                value={editAddressForm.label}
                onChange={(event) =>
                  setEditAddressField("label", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-delivery-recipient">Recipient Name</Label>
              <Input
                id="edit-delivery-recipient"
                value={editAddressForm.recipientName}
                onChange={(event) =>
                  setEditAddressField("recipientName", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-delivery-phone">Phone</Label>
              <Input
                id="edit-delivery-phone"
                value={editAddressForm.phone}
                onChange={(event) =>
                  setEditAddressField("phone", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-delivery-postal">Postal Code</Label>
              <Input
                id="edit-delivery-postal"
                value={editAddressForm.postalCode}
                onChange={(event) =>
                  setEditAddressField("postalCode", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-delivery-line-1">Address Line 1</Label>
              <Input
                id="edit-delivery-line-1"
                value={editAddressForm.addressLine1}
                onChange={(event) =>
                  setEditAddressField("addressLine1", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-delivery-line-2">Address Line 2</Label>
              <Input
                id="edit-delivery-line-2"
                value={editAddressForm.addressLine2}
                onChange={(event) =>
                  setEditAddressField("addressLine2", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-delivery-landmark">Landmark</Label>
              <Input
                id="edit-delivery-landmark"
                value={editAddressForm.landmark}
                onChange={(event) =>
                  setEditAddressField("landmark", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-delivery-city">City</Label>
              <Input
                id="edit-delivery-city"
                value={editAddressForm.city}
                onChange={(event) =>
                  setEditAddressField("city", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-delivery-state">State</Label>
              <Input
                id="edit-delivery-state"
                value={editAddressForm.state}
                onChange={(event) =>
                  setEditAddressField("state", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-delivery-country">Country</Label>
              <Input
                id="edit-delivery-country"
                value={editAddressForm.country}
                onChange={(event) =>
                  setEditAddressField("country", event.target.value)
                }
                className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
              />
            </div>
            <label className="flex items-center gap-2 self-end text-sm text-[#9CA3AF]">
              <input
                type="checkbox"
                checked={editAddressForm.isDefault}
                onChange={(event) =>
                  setEditAddressField("isDefault", event.target.checked)
                }
                className="size-4 accent-[#DC2626]"
              />
              Use as default delivery address
            </label>

            <DialogFooter className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditAddress}
                disabled={isUpdatingAddress}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingAddress}
                className="gap-2 bg-[#DC2626] text-white hover:bg-[#B91C1C]"
              >
                <Save className="size-4" />
                {isUpdatingAddress ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(addressPendingDelete)}
        onOpenChange={(open) => {
          if (!open) closeDeleteAddressDialog();
        }}
      >
        <DialogContent className="border border-[#2A2A2A] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Delete Delivery Address</DialogTitle>
            <DialogDescription>
              This saved delivery address will be removed from your account.
            </DialogDescription>
          </DialogHeader>

          {addressPendingDelete ? (
            <div className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-4 text-sm text-[#D1D5DB]">
              <p className="font-medium text-white">
                {addressPendingDelete.label}
              </p>
              <p className="mt-1 break-words">
                {[
                  addressPendingDelete.addressLine1,
                  addressPendingDelete.addressLine2,
                  addressPendingDelete.landmark,
                  addressPendingDelete.city,
                  addressPendingDelete.state,
                  addressPendingDelete.postalCode,
                  addressPendingDelete.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteAddressDialog}
              disabled={Boolean(deletingAddressId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (addressPendingDelete) deleteAddress(addressPendingDelete.id);
              }}
              disabled={Boolean(deletingAddressId)}
              className="gap-2 bg-[#DC2626] text-white hover:bg-[#B91C1C]"
            >
              <Trash2 className="size-4" />
              {deletingAddressId ? "Deleting..." : "Delete Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
