import axiosInstance from "@/lib/helpers/axiosInstance";


export async function getAllCategories() {
    const response = await axiosInstance.get('/categories');
    return response.data || [];
}

export async function getCategoryBySlug(slug: string) {
    const response = await axiosInstance.get(`/categories/${slug}`);
    return response.data || null;
}