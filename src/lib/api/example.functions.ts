"use server";
// Example server action — converted from TanStack server function.
export async function getGreeting({ name }: { name: string }) {
  return {
    greeting: `Hello, ${name}!`,
    mode: process.env.NODE_ENV ?? "unknown",
  };
}
