import axiosInstance from "@/lib/helpers/axiosInstance";

interface AddressPayload {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    addressLine2?: string;
    isDefault?: boolean;
    addressType?: string;
    label?: string;

}
export async function GetAllAddresses() {
    const response = await axiosInstance.get("/addresses");
    return response.data || response;
}

export async function GetAddressById(id: string) {
    const response = await axiosInstance.get(`/addresses/${id}`);
    return response.data || response;
}

export async function CreateAddress(address: AddressPayload) {
    const response = await axiosInstance.post("/addresses", address);
    return response.data || response;
}

export async function UpdateAddress(id: string, address: AddressPayload) {
    const response = await axiosInstance.put(`/addresses/${id}`, address);
    return response.data || response;
}

export async function DeleteAddress(id: string) {
    const response = await axiosInstance.delete(`/addresses/${id}`);
    return response.data || response;
}

export async function SetDefaultAddress(addressId: string) {
  const response = await axiosInstance.put(`/addresses/${addressId}/set-default`);
  return response.data || response;
}