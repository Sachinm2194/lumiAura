import axiosInstance from "@/lib/helpers/axiosInstance";
import { Address } from "@/types/checkout";

/**
 * Fetch all addresses for the current user
 */
export async function getAddresses(): Promise<Address[]> {
  try {
    const response = await axiosInstance.get("/addresses");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
}

/**
 * Add a new address
 */
export async function addAddress(addressData: Address): Promise<Address> {
  try {
    const response = await axiosInstance.post("/addresses", addressData);
    return response.data || response;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
}

/**
 * Update an existing address
 */
export async function updateAddress(
  addressId: string | number,
  addressData: Partial<Address>
): Promise<Address> {
  try {
    const response = await axiosInstance.put(`/addresses/${addressId}`, addressData);
    return response.data || response;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId: string | number): Promise<void> {
  try {
    await axiosInstance.delete(`/addresses/${addressId}`);
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(addressId: string | number): Promise<void> {
  try {
    await axiosInstance.post(`/addresses/${addressId}/set-default`);
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
}

