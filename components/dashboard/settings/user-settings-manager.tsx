"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
} from "firebase/auth";
import { toast } from "sonner";

import {
  ContactVerificationSection,
  DeleteAddressDialog,
  EditAddressDialog,
  ProfileInformationSection,
  SavedDeliveryAddressesSection,
  SettingsAlerts,
  SettingsHeader,
} from "@/components/dashboard/settings/user-settings-sections";
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
      const checkResponse = await authenticatedFetch(
        withBasePath("/api/settings/mobile-otp/check"),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ phone: normalizedPhone }),
        },
      );
      const checkPayload = (await checkResponse.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!checkResponse.ok) {
        throw new Error(
          checkPayload?.message || "Unable to check mobile number",
        );
      }

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
      <SettingsHeader />
      <div id="user-mobile-recaptcha" />
      <SettingsAlerts message={message} error={error} />

      <ContactVerificationSection
        form={form}
        mobileCountryCode={mobileCountryCode}
        mobileLocalNumber={mobileLocalNumber}
        mobileCountryCodes={MOBILE_COUNTRY_CODES}
        emailVerified={emailVerified}
        mobileVerified={mobileVerified}
        emailChanged={emailChanged}
        phoneChanged={phoneChanged}
        otp={otp}
        isSendingEmail={isSendingEmail}
        isSendingOtp={isSendingOtp}
        isVerifyingOtp={isVerifyingOtp}
        setField={setField}
        setMobileNumber={setMobileNumber}
        setOtp={setOtp}
        normalizeDigits={normalizeDigits}
        sendEmailVerification={sendEmailVerification}
        sendMobileOtp={sendMobileOtp}
        verifyMobileOtp={verifyMobileOtp}
      />

      <ProfileInformationSection
        form={form}
        isSaving={isSaving}
        saveSettings={saveSettings}
        setField={setField}
      />

      <SavedDeliveryAddressesSection
        addressError={addressError}
        isLoadingAddresses={isLoadingAddresses}
        addresses={addresses}
        addressForm={addressForm}
        isSavingAddress={isSavingAddress}
        deletingAddressId={deletingAddressId}
        defaultingAddressId={defaultingAddressId}
        setAddressField={setAddressField}
        openEditAddress={openEditAddress}
        setDefaultAddress={setDefaultAddress}
        setAddressPendingDelete={setAddressPendingDelete}
        setAddressError={setAddressError}
        saveAddress={saveAddress}
      />

      <EditAddressDialog
        editingAddress={editingAddress}
        editAddressForm={editAddressForm}
        editAddressError={editAddressError}
        isUpdatingAddress={isUpdatingAddress}
        setEditAddressField={setEditAddressField}
        closeEditAddress={closeEditAddress}
        updateAddress={updateAddress}
      />

      <DeleteAddressDialog
        addressPendingDelete={addressPendingDelete}
        deletingAddressId={deletingAddressId}
        closeDeleteAddressDialog={closeDeleteAddressDialog}
        deleteAddress={deleteAddress}
      />
    </div>
  );
}
