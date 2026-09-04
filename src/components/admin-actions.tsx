"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Ban } from "lucide-react";
import { toggleVerifiedAction, banUserAction } from "@/lib/actions";
import { useToastStore } from "@/lib/store";
import { Button } from "@/components/ui";

export function VerifyButton({
  userId,
  verified,
  self,
}: {
  userId: string;
  verified: boolean;
  self: boolean;
}) {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant={verified ? "secondary" : "outline"}
      size="sm"
      disabled={busy || self}
      onClick={async () => {
        setBusy(true);
        await toggleVerifiedAction(userId);
        setBusy(false);
        toast(verified ? "Badge removed" : "Badge granted");
        router.refresh();
      }}
    >
      <BadgeCheck className="h-4 w-4" />
      {verified ? "Unverify" : "Verify"}
    </Button>
  );
}

export function BanButton({ userId, self }: { userId: string; self: boolean }) {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={busy || self}
      onClick={async () => {
        if (!confirm("Ban this user? Their account and posts will be removed.")) return;
        setBusy(true);
        const res = await banUserAction(userId);
        setBusy(false);
        if (res.error) toast(res.error, "error");
        else {
          toast("User banned");
          router.refresh();
        }
      }}
    >
      <Ban className="h-4 w-4" /> Ban
    </Button>
  );
}
