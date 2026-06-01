import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./signup";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Accedi al tuo workspace — ARKHEON AI" }] }),
  component: () => <AuthShell mode="login" />,
});
