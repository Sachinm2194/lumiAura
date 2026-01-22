"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Category } from "@/types/product";

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  className?: string;
}

export default function Breadcrumbs({ 
  items, 
  showBackButton = true,
  className = "" 
}: BreadcrumbsProps) {
  const router = useRouter();

  return (
    <div className={`max-w-7xl mx-auto px-4 md:px-8 py-4 ${className}`}>
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        {showBackButton && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <span>/</span>
          </>
        )}
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link 
                href={item.href} 
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
            {index < items.length - 1 && <span>/</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

