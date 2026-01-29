import axiosInstance from "@/lib/helpers/axiosInstance";

export async function getCart(search?: string) {
  const params: { search?: string } = {};
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const response = await axiosInstance.get("/cart", { params });
  return response.data || response || [];
}
