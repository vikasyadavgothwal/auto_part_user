"use client";

import { type FormEvent } from "react";
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
import { RequiredMark } from "@/components/ui/required-mark";
import type { UserProfileFormValues } from "@/lib/user-settings";
import type {
  UserAddressFormValues,
  UserAddressRecord,
} from "@/lib/user-addresses";

type MobileCountryCodeOption = {
  code: string;
  label: string;
};

type ContactVerificationSectionProps = {
  form: UserProfileFormValues;
  mobileCountryCode: string;
  mobileLocalNumber: string;
  mobileCountryCodes: readonly MobileCountryCodeOption[];
  emailVerified: boolean;
  mobileVerified: boolean;
  emailChanged: boolean;
  phoneChanged: boolean;
  otp: string;
  isSendingEmail: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  setField: <Key extends keyof UserProfileFormValues>(
    key: Key,
    value: UserProfileFormValues[Key],
  ) => void;
  setMobileNumber: (countryCode: string, localNumber: string) => void;
  setOtp: (value: string) => void;
  normalizeDigits: (value: string, maxLength?: number) => string;
  sendEmailVerification: () => void;
  sendMobileOtp: () => void;
  verifyMobileOtp: () => void;
};

export function SettingsHeader() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Profile Settings</h1>
      <p className="text-sm text-[#9CA3AF]">
        Manage your profile details and verified contact information.
      </p>
    </div>
  );
}

export function ContactVerificationSection({
  form,
  mobileCountryCode,
  mobileLocalNumber,
  mobileCountryCodes,
  emailVerified,
  mobileVerified,
  emailChanged,
  phoneChanged,
  otp,
  isSendingEmail,
  isSendingOtp,
  isVerifyingOtp,
  setField,
  setMobileNumber,
  setOtp,
  normalizeDigits,
  sendEmailVerification,
  sendMobileOtp,
  verifyMobileOtp,
}: ContactVerificationSectionProps) {
  // FIX: Extracted contact verification markup without changing inputs or handlers.
  return (
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
            maxLength={254}
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
                {mobileCountryCodes.map((country) => (
                  <option
                    key={`${country.code}-${country.label}`}
                    value={country.code}
                  >
                    {country.code}
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
              maxLength={14}
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
              <div className="space-y-1 sm:max-w-32">
                <Label htmlFor="user-mobile-otp">OTP<RequiredMark /></Label>
                <Input
                  id="user-mobile-otp"
                  value={otp}
                  onChange={(event) =>
                    setOtp(normalizeDigits(event.target.value, 6))
                  }
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit OTP"
                  required
                  className="h-9 border-[#2A2A2A] bg-[#0A0A0A]"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={verifyMobileOtp}
                disabled={isVerifyingOtp || !/^\d{6}$/.test(otp)}
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
  );
}

export function ProfileInformationSection({
  form,
  isSaving,
  phoneChanged,
  saveSettings,
  setField,
}: {
  form: UserProfileFormValues;
  isSaving: boolean;
  phoneChanged: boolean;
  saveSettings: (event: FormEvent<HTMLFormElement>) => void;
  setField: <Key extends keyof UserProfileFormValues>(
    key: Key,
    value: UserProfileFormValues[Key],
  ) => void;
}) {
  // FIX: Extracted profile information markup without changing form submission.
  return (
    <form noValidate className="space-y-8" onSubmit={saveSettings}>
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
              maxLength={160}
              onChange={(event) => setField("companyName", event.target.value)}
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="first-name">First Name<RequiredMark /></Label>
            <Input
              id="first-name"
              value={form.firstName}
              minLength={2}
              maxLength={100}
              required
              onChange={(event) => setField("firstName", event.target.value)}
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              value={form.lastName}
              maxLength={100}
              onChange={(event) => setField("lastName", event.target.value)}
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
          </div>

          <div className="flex items-end">
              <Button
                type="submit"
              disabled={isSaving || phoneChanged}
              className="gap-2 bg-[#DC2626] text-white hover:bg-[#B91C1C]"
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

type SavedDeliveryAddressesSectionProps = {
  isLoadingAddresses: boolean;
  addresses: UserAddressRecord[];
  addressForm: UserAddressFormValues;
  isSavingAddress: boolean;
  deletingAddressId: string;
  defaultingAddressId: string;
  setAddressField: <Key extends keyof UserAddressFormValues>(
    key: Key,
    value: UserAddressFormValues[Key],
  ) => void;
  openEditAddress: (address: UserAddressRecord) => void;
  setDefaultAddress: (address: UserAddressRecord) => void;
  setAddressPendingDelete: (address: UserAddressRecord) => void;
  saveAddress: () => void;
};

export function SavedDeliveryAddressesSection({
  isLoadingAddresses,
  addresses,
  addressForm,
  isSavingAddress,
  deletingAddressId,
  defaultingAddressId,
  setAddressField,
  openEditAddress,
  setDefaultAddress,
  setAddressPendingDelete,
  saveAddress,
}: SavedDeliveryAddressesSectionProps) {
  // FIX: Extracted saved delivery address markup without changing handlers.
  return (
    <Card className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MapPin className="size-5 text-[#DC2626]" />
          Saved Delivery Addresses
        </CardTitle>
        <p className="text-sm text-[#9CA3AF]">
          These addresses are saved only for your account and are used when you
          place product orders from the main website cart.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <Label htmlFor="delivery-label">Address Label<RequiredMark /></Label>
            <Input
              id="delivery-label"
              value={addressForm.label}
              maxLength={60}
              required
              onChange={(event) => setAddressField("label", event.target.value)}
              className="h-11 border-[#2A2A2A] bg-[#111111]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-recipient">Recipient Name<RequiredMark /></Label>
            <Input
              id="delivery-recipient"
              value={addressForm.recipientName}
              maxLength={120}
              required
              onChange={(event) =>
                setAddressField("recipientName", event.target.value)
              }
              className="h-11 border-[#2A2A2A] bg-[#111111]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-phone">Phone<RequiredMark /></Label>
            <Input
              id="delivery-phone"
              value={addressForm.phone}
              type="tel"
              maxLength={25}
              required
              onChange={(event) => setAddressField("phone", event.target.value)}
              className="h-11 border-[#2A2A2A] bg-[#111111]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-postal">Postal Code<RequiredMark /></Label>
            <Input
              id="delivery-postal"
              value={addressForm.postalCode}
              maxLength={20}
              required
              onChange={(event) =>
                setAddressField("postalCode", event.target.value)
              }
              className="h-11 border-[#2A2A2A] bg-[#111111]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="delivery-line-1">Address Line 1<RequiredMark /></Label>
            <Input
              id="delivery-line-1"
              value={addressForm.addressLine1}
              maxLength={255}
              required
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
              maxLength={255}
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
              maxLength={160}
              onChange={(event) =>
                setAddressField("landmark", event.target.value)
              }
              className="h-11 border-[#2A2A2A] bg-[#111111]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-city">City<RequiredMark /></Label>
            <Input
              id="delivery-city"
              value={addressForm.city}
              maxLength={120}
              required
              onChange={(event) => setAddressField("city", event.target.value)}
              className="h-11 border-[#2A2A2A] bg-[#111111]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-state">State<RequiredMark /></Label>
            <Input
              id="delivery-state"
              value={addressForm.state}
              maxLength={120}
              required
              onChange={(event) => setAddressField("state", event.target.value)}
              className="h-11 border-[#2A2A2A] bg-[#111111]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-country">Country<RequiredMark /></Label>
            <Input
              id="delivery-country"
              value={addressForm.country}
              maxLength={120}
              required
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
  );
}

type EditAddressDialogProps = {
  editingAddress: UserAddressRecord | null;
  editAddressForm: UserAddressFormValues;
  isUpdatingAddress: boolean;
  setEditAddressField: <Key extends keyof UserAddressFormValues>(
    key: Key,
    value: UserAddressFormValues[Key],
  ) => void;
  closeEditAddress: () => void;
  updateAddress: () => void;
};

export function EditAddressDialog({
  editingAddress,
  editAddressForm,
  isUpdatingAddress,
  setEditAddressField,
  closeEditAddress,
  updateAddress,
}: EditAddressDialogProps) {
  // FIX: Extracted edit dialog markup without changing submission behavior.
  return (
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
          noValidate
          className="grid gap-6 px-6 py-5 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            updateAddress();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="edit-delivery-label">Address Label<RequiredMark /></Label>
            <Input
              id="edit-delivery-label"
              value={editAddressForm.label}
              maxLength={60}
              required
              onChange={(event) =>
                setEditAddressField("label", event.target.value)
              }
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-delivery-recipient">Recipient Name<RequiredMark /></Label>
            <Input
              id="edit-delivery-recipient"
              value={editAddressForm.recipientName}
              maxLength={120}
              required
              onChange={(event) =>
                setEditAddressField("recipientName", event.target.value)
              }
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-delivery-phone">Phone<RequiredMark /></Label>
            <Input
              id="edit-delivery-phone"
              value={editAddressForm.phone}
              type="tel"
              maxLength={25}
              required
              onChange={(event) =>
                setEditAddressField("phone", event.target.value)
              }
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-delivery-postal">Postal Code<RequiredMark /></Label>
            <Input
              id="edit-delivery-postal"
              value={editAddressForm.postalCode}
              maxLength={20}
              required
              onChange={(event) =>
                setEditAddressField("postalCode", event.target.value)
              }
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="edit-delivery-line-1">Address Line 1<RequiredMark /></Label>
            <Input
              id="edit-delivery-line-1"
              value={editAddressForm.addressLine1}
              maxLength={255}
              required
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
              maxLength={255}
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
              maxLength={160}
              onChange={(event) =>
                setEditAddressField("landmark", event.target.value)
              }
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-delivery-city">City<RequiredMark /></Label>
            <Input
              id="edit-delivery-city"
              value={editAddressForm.city}
              maxLength={120}
              required
              onChange={(event) =>
                setEditAddressField("city", event.target.value)
              }
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-delivery-state">State<RequiredMark /></Label>
            <Input
              id="edit-delivery-state"
              value={editAddressForm.state}
              maxLength={120}
              required
              onChange={(event) =>
                setEditAddressField("state", event.target.value)
              }
              className="h-11 border-[#2A2A2A] bg-[#0A0A0A]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-delivery-country">Country<RequiredMark /></Label>
            <Input
              id="edit-delivery-country"
              value={editAddressForm.country}
              maxLength={120}
              required
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
  );
}

export function DeleteAddressDialog({
  addressPendingDelete,
  deletingAddressId,
  closeDeleteAddressDialog,
  deleteAddress,
}: {
  addressPendingDelete: UserAddressRecord | null;
  deletingAddressId: string;
  closeDeleteAddressDialog: () => void;
  deleteAddress: (addressId: string) => void;
}) {
  // FIX: Extracted delete dialog markup without changing confirmation behavior.
  return (
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
  );
}
