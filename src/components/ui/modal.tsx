"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalClose = DialogPrimitive.Close;

export const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title?: string;
    description?: string;
  }
>(({ className, children, title, description, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-fg/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-bg-raised p-6 shadow-xl duration-200 animate-in fade-in zoom-in-95 rounded-[2px]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        {title && (
          <DialogPrimitive.Title className="font-mono text-xs uppercase tracking-[0.16em] text-fg">
            {title}
          </DialogPrimitive.Title>
        )}
        <DialogPrimitive.Close className="rounded-[2px] p-1 text-fg-subtle hover:text-fg hover:bg-bg-hover transition-colors">
          <X className="h-4 w-4 stroke-[1.5]" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
      {description && (
        <DialogPrimitive.Description className="text-xs text-fg-muted leading-relaxed">
          {description}
        </DialogPrimitive.Description>
      )}
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

ModalContent.displayName = "ModalContent";
