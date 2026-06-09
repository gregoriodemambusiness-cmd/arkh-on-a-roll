"use client";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

/**
 * Drop-in replacement for TanStack Router's <Link to="..." hash="...">
 * Uses Next.js Link under the hood.
 */
export function Link({
  to,
  href: _href,
  hash,
  children,
  ...rest
}: {
  to?: string;
  href?: string;
  hash?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  const dest = (to ?? _href ?? "/") + (hash ? `#${hash}` : "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <NextLink href={dest} {...(rest as any)}>
      {children}
    </NextLink>
  );
}

/**
 * Drop-in replacement for TanStack Router's useNavigate().
 * Returns a function that accepts { to, hash }.
 */
export function useNavigate() {
  const router = useRouter();
  return ({ to, hash }: { to: string; hash?: string }) => {
    router.push(hash ? `${to}#${hash}` : to);
  };
}
