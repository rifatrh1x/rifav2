"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFollowAction } from "@/lib/actions";
import { useToastStore } from "@/lib/store";
import { Button } from "@/components/ui";

export function FollowButton({
  userId,
  initial,
  size = "sm",
}: {
  userId: string;
  initial: boolean;
  size?: "sm" | "default" | "lg";
}) {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [following, setFollowing] = useState(initial);

  const onClick = async () => {
    setFollowing((v) => !v);
    const res = await toggleFollowAction(userId);
    router.refresh();
    if (res && res.loginRequired) {
      toast("Log in to follow people", "info");
      router.push("/login");
      return;
    }
    if (res && typeof res.following === "boolean") setFollowing(res.following);
    else if (res && res.error) toast(res.error, "error");
  };

  return (
    <Button size={size} variant={following ? "secondary" : "gradient"} onClick={onClick}>
      {following ? "Following" : "Follow"}
    </Button>
  );
}
