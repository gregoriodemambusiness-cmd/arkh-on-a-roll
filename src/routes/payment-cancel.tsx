import { Link } from "@/lib/nextCompat";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

function PaymentCancel() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-5">
      <header className="absolute left-0 right-0 top-0 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-5"><Link to="/"><Logo size={22} /></Link></div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elegant text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <XCircle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">Pagamento annullato</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Il tuo piano non è stato modificato. Puoi riprovare quando vuoi.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/"
            hash="pricing"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background hover:opacity-90"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Torna ai prezzi
          </Link>
          <Link
            to="/app"
            className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-[12.5px] text-foreground hover:bg-accent"
          >
            Vai alla dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default PaymentCancel;
