'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type LoginResponse = {
    token: string;
    expiresIn: number;
    role: string;
    userId: number;
};

const OAuthCallbackPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const [error, setError] = useState<string | null>(null);
    const missingCode = !code;

    useEffect(() => {
        if (!code) {
            return;
        }

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
        const controller = new AbortController();

        const exchangeCode = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/auth/oauth/exchange`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code }),
                    signal: controller.signal,
                    cache: "no-store",
                });

                if (!response.ok) {
                    setError("OAuth exchange failed. Please try again.");
                    return;
                }

                const authPayload: LoginResponse = await response.json();
                localStorage.setItem("auth", JSON.stringify(authPayload));
                router.replace("/users");
            } catch (err) {
                if ((err as DOMException).name !== "AbortError") {
                    setError("Unable to complete OAuth sign-in. Please try again.");
                }
            }
        };

        exchangeCode();

        return () => controller.abort();
    }, [router, code]);

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-xl font-semibold">Signing you in…</h2>
            {missingCode && (
                <p className="mt-3 text-sm text-red-600">Missing OAuth code. Please try again.</p>
            )}
            {!missingCode && error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default OAuthCallbackPage;
