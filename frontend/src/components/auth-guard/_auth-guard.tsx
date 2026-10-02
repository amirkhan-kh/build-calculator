"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { logoutAction } from "@/action/auth/logout.action";

export function AuthGuard() {
    const queryClient = useQueryClient();
    const redirectingRef = useRef(false);

    useEffect(() => {
        const cache = queryClient.getQueryCache();

        const unsubscribe = cache.subscribe((event) => {
            if (redirectingRef.current) return;
            if (event.type !== "updated") return;

            const data = event.query.state.data as { _meta?: { reason?: string } } | undefined;
            if (data?._meta?.reason === "TOKEN") {
                redirectingRef.current = true;
                logoutAction();
            }
        });

        return () => unsubscribe();
    }, [queryClient]);

    return null;
}
