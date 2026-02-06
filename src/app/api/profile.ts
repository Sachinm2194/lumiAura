import axiosInstance from "@/lib/helpers/axiosInstance";

export async function getProfile() {
    const response = await axiosInstance.get("/users/profile");
    return response.data || response;
}

export async function updateProfile(data: any) {
    const response = await axiosInstance.put("/users/profile", data);
    return response.data || response;
}

