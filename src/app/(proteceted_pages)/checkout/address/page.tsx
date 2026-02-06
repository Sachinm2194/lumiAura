"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutStepper from "@/components/core-components/checkout-stepper";
import OrderSummaryItem from "@/components/core-components/order-summary-item";
import AddressCard from "@/components/core-components/address-card";
import AddressFormDialog from "@/components/core-components/address-form-dialog";
import DeleteConfirmationDialog from "@/components/core-components/delete-confirmation-dialog";
import { useCheckoutContext } from "@/contexts/CheckoutContext";
import { Address } from "@/types/checkout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Package, Plus } from "lucide-react";
import { GetAllAddresses, DeleteAddress, SetDefaultAddress } from "@/app/api/address";
import { toast } from "react-toastify";

export default function CheckoutAddressPage() {
  const router = useRouter();
  const {
    orderItems,
    shippingAddress,
    billingAddress,
    setShippingAddress,
    setBillingAddress,
    isBuyNow,
    buyNowProductData,
    cartProductData,
  } = useCheckoutContext();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<any | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<any | null>(null);

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  // Set selected address if shipping address exists (only if no selection yet)
  useEffect(() => {
    if (shippingAddress && addresses.length > 0 && !selectedAddressId) {
      const matchingAddress = addresses.find(
        (addr) =>
          addr.fullName === shippingAddress.fullName &&
          addr.addressLine1 === shippingAddress.addressLine1 &&
          addr.phone === shippingAddress.phone
      );
      if (matchingAddress && matchingAddress.addressId) {
        setSelectedAddressId(matchingAddress.addressId);
      }
    }
  }, [shippingAddress, addresses]);

  // Redirect if no items in checkout
  useEffect(() => {
    if (orderItems.length === 0) {
      router.push("/cart");
    }
  }, [orderItems.length, router]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await GetAllAddresses();
      const addressesList = Array.isArray(data) ? data : [];
      setAddresses(addressesList);
      
      // Always select default address if it exists, otherwise select first address
      if (addressesList.length > 0) {
        const defaultAddress = addressesList.find((addr: any) => addr.isDefault) || addressesList[0];
        if (defaultAddress && defaultAddress.addressId) {
          setSelectedAddressId(defaultAddress.addressId);
          handleAddressSelect(defaultAddress);
        }
      }
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = (address: any) => {
    const addressData: Address = {
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
    };
    setShippingAddress(addressData);
    setBillingAddress(addressData); // Default billing same as shipping
  };

  const handleRadioChange = (value: string) => {
    setSelectedAddressId(value);
    const address = addresses.find((addr) => addr.addressId === value);
    if (address) {
      handleAddressSelect(address);
    }
  };

  const handleAddNew = () => {
    setAddressToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (address: any) => {
    setAddressToEdit(address);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (address: any) => {
    setAddressToDelete(address);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    const addressId = addressToDelete.addressId;
    if (!addressId) return;

    setDeletingAddressId(addressId);
    try {
      await DeleteAddress(addressId);
      toast.success("Address deleted successfully");
      
      // If deleted address was selected, clear selection and select default
      if (selectedAddressId === addressId) {
        setSelectedAddressId("");
        setShippingAddress(null);
        setBillingAddress(null);
        // After deletion, select default address if available
        setTimeout(() => {
          fetchAddresses();
        }, 100);
      }
      
      await fetchAddresses();
    } catch (error: any) {
      console.error("Error deleting address:", error);
      toast.error(error?.response?.data?.message || "Failed to delete address");
    } finally {
      setDeletingAddressId(null);
      setAddressToDelete(null);
    }
  };

  const handleDialogSuccess = () => {
    fetchAddresses();
  };

  const handleSetDefault = async (address: any) => {
    const addressId = address.addressId;
    if (!addressId) return;

    try {
      await SetDefaultAddress(addressId);
      toast.success("Default address updated successfully");
      await fetchAddresses();
    } catch (error: any) {
      console.error("Error setting default address:", error);
      toast.error(error?.response?.data?.message || "Failed to set default address");
    }
  };

  const handleStepClick = (step: number) => {
    // For Buy Now: step 1 is Address (no previous step)
    // For Cart: step 1 is Cart
    if (!isBuyNow && step === 1) {
      router.push("/cart");
    }
  };

  // Determine current step for stepper
  // Buy Now: Address is step 1, Payment is step 2
  // Cart: Cart is step 1, Address is step 2, Payment is step 3
  const stepperCurrentStep = isBuyNow ? 1 : 2;

  const handleContinueWithOrderSummary = async () => {
    if (!selectedAddressId || !shippingAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsSubmitting(true);
    // Small delay to ensure state is set
    setTimeout(() => {
      router.push("/checkout/payment");
    }, 100);
  };

  // Calculate order summary with actual prices
  const calculateSummary = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      // Get variant price from product data
      if (isBuyNow && buyNowProductData) {
        const variant = buyNowProductData.variants?.find(
          (v) => Number(v.id) === Number(item.variantId)
        ) || buyNowProductData.variants?.[0];
        const price = variant ? parseFloat(variant.sellingPrice || "0") : 0;
        return sum + price * item.quantity;
      }
      // For cart items, use cartProductData
      if (!isBuyNow && cartProductData) {
        const productData = cartProductData[item.productId];
        if (productData) {
          const variant = productData.variants?.find(
            (v) => Number(v.id) === Number(item.variantId)
          ) || productData.variants?.[0];
          const price = variant ? parseFloat(variant.sellingPrice || "0") : 0;
          return sum + price * item.quantity;
        }
      }
      return sum; // Fallback: no price available
    }, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateSummary();

  if (orderItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-4 pb-20 md:pb-6 px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Stepper */}
        <CheckoutStepper 
          currentStep={stepperCurrentStep} 
          onStepClick={handleStepClick} 
          isBuyNow={isBuyNow}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Address Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>DEFAULT ADDRESS</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-32 bg-muted animate-pulse rounded-lg" />
                    <div className="h-32 bg-muted animate-pulse rounded-lg" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No addresses found</p>
                    <Button onClick={handleAddNew}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <RadioGroup
                      value={selectedAddressId}
                      onValueChange={handleRadioChange}
                    >
                      {addresses.map((address) => {
                        const addressId = address.addressId;
                        if (!addressId) return null;
                        return (
                          <AddressCard
                            key={addressId}
                            address={address}
                            addressId={addressId}
                            isSelected={selectedAddressId === addressId}
                            onSelect={() => handleRadioChange(addressId)}
                            onEdit={() => handleEdit(address)}
                            onDelete={() => handleDeleteClick(address)}
                            onSetDefault={() => handleSetDefault(address)}
                            isDeleting={deletingAddressId === addressId}
                          />
                        );
                      })}
                    </RadioGroup>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddNew}
                      className="w-full mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Items ({orderItems.length})
                  </h4>
                  <div className="space-y-0">
                    {orderItems.map((item, index) => (
                      <OrderSummaryItem
                        key={index}
                        orderItem={item}
                        productData={isBuyNow ? buyNowProductData : null}
                        cartProductData={!isBuyNow ? cartProductData : undefined}
                        index={index}
                        isBuyNow={isBuyNow}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="pt-4 border-t">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={handleContinueWithOrderSummary}
                    disabled={isSubmitting || !selectedAddressId}
                  >
                    {isSubmitting ? "Processing..." : "Continue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Address Form Dialog */}
      <AddressFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleDialogSuccess}
        addressToEdit={addressToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
        itemName={addressToDelete ? `${addressToDelete.fullName} - ${addressToDelete.addressLine1}` : undefined}
      />
    </div>
  );
}

