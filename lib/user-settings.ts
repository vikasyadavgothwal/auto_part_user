export type UserProfileRecord = {
  id: string;
  publicId: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  emailVerifiedAt: string | null;
  phone: string | null;
  mobileVerifiedAt: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserProfileFormValues = {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
};

export const emptyUserProfile: UserProfileRecord = {
  id: "",
  publicId: "",
  companyName: null,
  firstName: null,
  lastName: null,
  email: null,
  emailVerifiedAt: null,
  phone: null,
  mobileVerifiedAt: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  state: null,
  country: null,
  createdAt: "",
  updatedAt: "",
};

export const formFromProfile = (
  profile: UserProfileRecord,
): UserProfileFormValues => ({
  companyName: profile.companyName ?? "",
  firstName: profile.firstName ?? "",
  lastName: profile.lastName ?? "",
  email: profile.email ?? "",
  phone: profile.phone ?? "",
  addressLine1: profile.addressLine1 ?? "",
  addressLine2: profile.addressLine2 ?? "",
  city: profile.city ?? "",
  state: profile.state ?? "",
  country: profile.country ?? "",
});

export const payloadFromForm = (form: UserProfileFormValues) => ({
  companyName: form.companyName.trim(),
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  addressLine1: form.addressLine1.trim(),
  addressLine2: form.addressLine2.trim(),
  city: form.city.trim(),
  state: form.state.trim(),
  country: form.country.trim(),
});
