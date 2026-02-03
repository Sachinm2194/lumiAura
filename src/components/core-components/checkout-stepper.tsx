"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: number) => void;
  className?: string;
}

export default function CheckoutStepper({
  currentStep,
  onStepClick,
  className,
}: CheckoutStepperProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Header shrinks after scrolling past a certain point (typically around 50-100px)
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const steps = [
    { number: 1, label: "Cart" },
    { number: 2, label: "Address" },
    { number: 3, label: "Payment" },
  ];

  const getStepState = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "active";
    return "upcoming";
  };

  const handleStepClick = (stepNumber: number) => {
    // Only allow clicking on completed/previous steps (backward navigation)
    if (stepNumber < currentStep && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div 
      className={cn(
        "sticky z-40 w-full pb-5  bg-background  transition-all duration-300",
        isScrolled ? "top-14 pt-4" : "top-16 pt-1",
        className
      )}
    >
      <div className="max-w-2xl mx-auto px-5 ">
        <div className="flex items-center justify-center relative">
          {steps.map((step, index) => {
            const state = getStepState(step.number);
            const isClickable = step.number < currentStep;

            return (
              <React.Fragment key={step.number}>
                {/* Step Label */}
                <div className="flex flex-col items-center relative z-10">
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.number)}
                    disabled={!isClickable}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider transition-colors pb-0.5 relative whitespace-nowrap",
                      state === "active" && "text-primary",
                      state === "completed" && "text-muted-foreground cursor-pointer hover:text-foreground",
                      state === "upcoming" && "text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {step.label}
                    {/* Active step underline */}
                    {state === "active" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                </div>

                {/* Dotted line after each step (except last) */}
                {index < steps.length - 1 && (
                  <div className="h-px w-24 md:w-32 mx-4 border-t-2 border-dotted border-muted-foreground/40" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
