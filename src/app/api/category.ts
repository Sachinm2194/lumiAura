import axiosInstance from "@/lib/helpers/axiosInstance";


export async function getAllCategories(search?: string) {
    const params: { search?: string } = {};
    if (search && search.trim()) {
        params.search = search.trim();
    }
    const response = await axiosInstance.get('/categories', { params });
    return response.data || [];
}

export async function getCategoryBySlug(slug: string) {
    const response = await axiosInstance.get(`/categories/${slug}`);
    return response.data || null;
}