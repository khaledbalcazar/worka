"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Native modal: keeps focus inside, makes the background inert and restores
// focus to the trigger on close. Closed sheets are absent from keyboard order.
export default function MobileSheet({ open, onClose, label, children, className = "", desktop = false }: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
  desktop?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open || desktop) return;
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktopMedia.matches) onClose(); };
    closeOnDesktop();
    desktopMedia.addEventListener("change", closeOnDesktop);
    return () => desktopMedia.removeEventListener("change", closeOnDesktop);
  }, [open, onClose, desktop]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
        )).filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first) { e.preventDefault(); return; }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        if (e.target === e.currentTarget &&
          (e.clientX < bounds.left || e.clientX > bounds.right ||
           e.clientY < bounds.top || e.clientY > bounds.bottom)) onClose();
      }}
      className={`fixed inset-x-0 top-auto bottom-0 m-0 w-full max-w-none max-h-[85dvh] bg-white text-foreground rounded-t-3xl shadow-2xl backdrop:bg-black/40 ${desktop ? "sm:inset-0 sm:m-auto sm:max-w-lg sm:rounded-2xl" : ""} ${className}`}
    >
      {children}
    </dialog>
  );
}
