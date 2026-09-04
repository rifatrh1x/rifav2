"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { markAllReadAction } from "@/lib/actions";
import { Button } from "@/components/ui";

export function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || busy}
      onClick={async () => {
        setBusy(true);
        await markAllReadAction();
        setBusy(false);
        router.refresh();
      }}
    >
      <CheckCheck className="h-4 w-4" /> Mark all read
    </Button>
  );
}
