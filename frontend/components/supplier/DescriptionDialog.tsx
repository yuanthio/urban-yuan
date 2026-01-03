// e-commerce/frontend/components/supplier/DescriptionDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productName: string;
  description: string;
};

export default function DescriptionDialog({
  open,
  onOpenChange,
  productName,
  description,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Dialog Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Product Description
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                {productName}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Dialog Body */}
        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {description || 'No description available'}
            </p>
          </div>
        </div>

        {/* Dialog Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-50 hover:bg-gray-100 border-gray-300"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
