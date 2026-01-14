export async function getProjectTypes():  {
    try {
      const response = await axiosInstance.get(
      'verify-email'
      );
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  }