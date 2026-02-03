import axiosInstance from "@/lib/helpers/axiosInstance";
import { CreateOrderPayload } from "@/types/checkout";

/**
 * Create a new order
 */
export async function CreateOrder(order: CreateOrderPayload) {
  try {
    const response = await axiosInstance.post("/orders", order);
    return response.data || response;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/**
 * Get order details by ID
 */
export async function GetOrder(id: string) {
  try {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data || response;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

/**
 * Get all orders for the current user
 */
export async function GetOrders() {
  try {
    const response = await axiosInstance.get("/orders");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}
