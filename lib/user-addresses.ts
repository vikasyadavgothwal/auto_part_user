export type UserAddressRecord = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserAddressFormValues = {
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export const emptyAddressForm: UserAddressFormValues = {
  label: "Home",
  recipientName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: true,
};

export const payloadFromAddressForm = (form: UserAddressFormValues) => ({
  label: form.label.trim(),
  recipientName: form.recipientName.trim(),
  phone: form.phone.trim(),
  addressLine1: form.addressLine1.trim(),
  addressLine2: form.addressLine2.trim(),
  landmark: form.landmark.trim(),
  city: form.city.trim(),
  state: form.state.trim(),
  postalCode: form.postalCode.trim(),
  country: form.country.trim(),
  isDefault: form.isDefault,
});
