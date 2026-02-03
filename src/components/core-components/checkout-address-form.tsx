"use client";

import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Address } from "@/types/checkout";
import { toast } from "react-toastify";

interface CheckoutAddressFormProps {
  initialShippingAddress?: Address | null;
  initialBillingAddress?: Address | null;
  onContinue: (shippingAddress: Address, billingAddress: Address) => void;
  isLoading?: boolean;
  showContinueButton?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
  onValidationReady?: (validateAndSubmit: () => void) => void;
}

const CheckoutAddressForm = forwardRef<
  { validateAndSubmit: () => void },
  CheckoutAddressFormProps
>(({
  initialShippingAddress,
  initialBillingAddress,
  onContinue,
  isLoading = false,
  showContinueButton = true,
  onValidationReady,
}, ref) => {
  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullName: initialShippingAddress?.fullName || "",
    addressLine1: initialShippingAddress?.addressLine1 || "",
    addressLine2: initialShippingAddress?.addressLine2 || "",
    city: initialShippingAddress?.city || "",
    state: initialShippingAddress?.state || "",
    postalCode: initialShippingAddress?.postalCode || "",
    country: initialShippingAddress?.country || "India",
    phone: initialShippingAddress?.phone || "",
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(
    !initialBillingAddress || JSON.stringify(initialShippingAddress) === JSON.stringify(initialBillingAddress)
  );

  const [billingAddress, setBillingAddress] = useState<Address>({
    fullName: initialBillingAddress?.fullName || "",
    addressLine1: initialBillingAddress?.addressLine1 || "",
    addressLine2: initialBillingAddress?.addressLine2 || "",
    city: initialBillingAddress?.city || "",
    state: initialBillingAddress?.state || "",
    postalCode: initialBillingAddress?.postalCode || "",
    country: initialBillingAddress?.country || "India",
    phone: initialBillingAddress?.phone || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) return "Invalid phone number";
        return "";
      case "addressLine1":
        if (!value.trim()) return "Address line 1 is required";
        return "";
      case "city":
        if (!value.trim()) return "City is required";
        return "";
      case "state":
        if (!value.trim()) return "State is required";
        return "";
      case "postalCode":
        if (!value.trim()) return "Postal code is required";
        const postalRegex = /^[0-9]{5,6}$/;
        if (!postalRegex.test(value)) return "Invalid postal code";
        return "";
      case "country":
        if (!value.trim()) return "Country is required";
        return "";
      default:
        return "";
    }
  };

  const validateAddress = (address: Address, prefix: string): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(address).forEach((key) => {
      if (key !== "addressLine2") {
        const error = validateField(key, address[key as keyof Address] as string);
        if (error) {
          newErrors[`${prefix}_${key}`] = error;
          isValid = false;
        }
      }
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleShippingChange = (field: keyof Address, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[`shipping_${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`shipping_${field}`];
        return newErrors;
      });
    }

    // If billing same as shipping, update billing too
    if (billingSameAsShipping) {
      setBillingAddress((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleBillingChange = (field: keyof Address, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[`billing_${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`billing_${field}`];
        return newErrors;
      });
    }
  };

  const handleBillingSameAsShippingChange = (checked: boolean) => {
    setBillingSameAsShipping(checked);
    if (checked) {
      setBillingAddress(shippingAddress);
      // Clear billing errors
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith("billing_")) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
  };

  const validateAndSubmit = () => {
    // Validate shipping address
    const isShippingValid = validateAddress(shippingAddress, "shipping");
    
    // Validate billing address if different
    const isBillingValid = billingSameAsShipping || validateAddress(billingAddress, "billing");

    if (!isShippingValid || !isBillingValid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    onContinue(shippingAddress, billingAddress);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSubmit();
  };

  // Expose validateAndSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    validateAndSubmit,
  }));

  // Also expose via callback if needed
  useEffect(() => {
    if (onValidationReady) {
      onValidationReady(validateAndSubmit);
    }
  }, [onValidationReady]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Shipping Address</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={shippingAddress.fullName}
              onChange={(e) => handleShippingChange("fullName", e.target.value)}
              placeholder="John Doe"
              className={errors.shipping_fullName ? "border-destructive" : ""}
            />
            {errors.shipping_fullName && (
              <p className="text-xs text-destructive mt-1">{errors.shipping_fullName}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Phone <span className="text-destructive">*</span>
            </label>
            <Input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => handleShippingChange("phone", e.target.value)}
              placeholder="+91 9876543210"
              className={errors.shipping_phone ? "border-destructive" : ""}
            />
            {errors.shipping_phone && (
              <p className="text-xs text-destructive mt-1">{errors.shipping_phone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Address Line 1 <span className="text-destructive">*</span>
          </label>
          <Input
            value={shippingAddress.addressLine1}
            onChange={(e) => handleShippingChange("addressLine1", e.target.value)}
            placeholder="Street address, P.O. Box"
            className={errors.shipping_addressLine1 ? "border-destructive" : ""}
          />
          {errors.shipping_addressLine1 && (
            <p className="text-xs text-destructive mt-1">{errors.shipping_addressLine1}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Address Line 2
          </label>
          <Input
            value={shippingAddress.addressLine2}
            onChange={(e) => handleShippingChange("addressLine2", e.target.value)}
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              City <span className="text-destructive">*</span>
            </label>
            <Input
              value={shippingAddress.city}
              onChange={(e) => handleShippingChange("city", e.target.value)}
              placeholder="City"
              className={errors.shipping_city ? "border-destructive" : ""}
            />
            {errors.shipping_city && (
              <p className="text-xs text-destructive mt-1">{errors.shipping_city}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              State <span className="text-destructive">*</span>
            </label>
            <Input
              value={shippingAddress.state}
              onChange={(e) => handleShippingChange("state", e.target.value)}
              placeholder="State"
              className={errors.shipping_state ? "border-destructive" : ""}
            />
            {errors.shipping_state && (
              <p className="text-xs text-destructive mt-1">{errors.shipping_state}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Postal Code <span className="text-destructive">*</span>
            </label>
            <Input
              value={shippingAddress.postalCode}
              onChange={(e) => handleShippingChange("postalCode", e.target.value)}
              placeholder="123456"
              className={errors.shipping_postalCode ? "border-destructive" : ""}
            />
            {errors.shipping_postalCode && (
              <p className="text-xs text-destructive mt-1">{errors.shipping_postalCode}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Country <span className="text-destructive">*</span>
          </label>
          <Select
            value={shippingAddress.country}
            onValueChange={(value) => handleShippingChange("country", value)}
          >
            <SelectTrigger className={errors.shipping_country ? "border-destructive" : ""}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
          {errors.shipping_country && (
            <p className="text-xs text-destructive mt-1">{errors.shipping_country}</p>
          )}
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="billing-same"
            checked={billingSameAsShipping}
            onCheckedChange={handleBillingSameAsShippingChange}
          />
          <label
            htmlFor="billing-same"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Billing address same as shipping address
          </label>
        </div>

        {!billingSameAsShipping && (
          <>
            <h3 className="text-lg font-semibold text-foreground">Billing Address</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={billingAddress.fullName}
                  onChange={(e) => handleBillingChange("fullName", e.target.value)}
                  placeholder="John Doe"
                  className={errors.billing_fullName ? "border-destructive" : ""}
                />
                {errors.billing_fullName && (
                  <p className="text-xs text-destructive mt-1">{errors.billing_fullName}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Phone <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  value={billingAddress.phone}
                  onChange={(e) => handleBillingChange("phone", e.target.value)}
                  placeholder="+91 9876543210"
                  className={errors.billing_phone ? "border-destructive" : ""}
                />
                {errors.billing_phone && (
                  <p className="text-xs text-destructive mt-1">{errors.billing_phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Address Line 1 <span className="text-destructive">*</span>
              </label>
              <Input
                value={billingAddress.addressLine1}
                onChange={(e) => handleBillingChange("addressLine1", e.target.value)}
                placeholder="Street address, P.O. Box"
                className={errors.billing_addressLine1 ? "border-destructive" : ""}
              />
              {errors.billing_addressLine1 && (
                <p className="text-xs text-destructive mt-1">{errors.billing_addressLine1}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Address Line 2
              </label>
              <Input
                value={billingAddress.addressLine2}
                onChange={(e) => handleBillingChange("addressLine2", e.target.value)}
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  City <span className="text-destructive">*</span>
                </label>
                <Input
                  value={billingAddress.city}
                  onChange={(e) => handleBillingChange("city", e.target.value)}
                  placeholder="City"
                  className={errors.billing_city ? "border-destructive" : ""}
                />
                {errors.billing_city && (
                  <p className="text-xs text-destructive mt-1">{errors.billing_city}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  State <span className="text-destructive">*</span>
                </label>
                <Input
                  value={billingAddress.state}
                  onChange={(e) => handleBillingChange("state", e.target.value)}
                  placeholder="State"
                  className={errors.billing_state ? "border-destructive" : ""}
                />
                {errors.billing_state && (
                  <p className="text-xs text-destructive mt-1">{errors.billing_state}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Postal Code <span className="text-destructive">*</span>
                </label>
                <Input
                  value={billingAddress.postalCode}
                  onChange={(e) => handleBillingChange("postalCode", e.target.value)}
                  placeholder="123456"
                  className={errors.billing_postalCode ? "border-destructive" : ""}
                />
                {errors.billing_postalCode && (
                  <p className="text-xs text-destructive mt-1">{errors.billing_postalCode}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Country <span className="text-destructive">*</span>
              </label>
              <Select
                value={billingAddress.country}
                onValueChange={(value) => handleBillingChange("country", value)}
              >
                <SelectTrigger className={errors.billing_country ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="USA">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
              {errors.billing_country && (
                <p className="text-xs text-destructive mt-1">{errors.billing_country}</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto min-w-[150px]"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Continue"}
        </Button>
      </div>
    </form>
  );
});

CheckoutAddressForm.displayName = "CheckoutAddressForm";

export default CheckoutAddressForm;

