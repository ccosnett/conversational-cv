"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { VoiceProvider, useVoice } from "@humeai/voice-react";

type TokenResponse = {
  accessToken: string;
  configId: string;
  sessionSettings: {
    type: "session_settings";
    context: {
      text: string;
      type: "persistent" | "temporary";
    };
    systemPrompt: string;
  };
};

const SUGGESTIONS = [
  "Who are you?",
  "What did you do at Compass?",
  "What did you do at Wolfram?",
  "What roles are you looking for?",
  "What are your strongest technical skills?",
  "Why are you interested in voice and conversational AI?",
];

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 12.8 19.8 19.8 0 0 1 2.08 4.09 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.68 2.62a2 2 0 0 1-.45 2.11L8 9.94a16 16 0 0 0 6.06 6.06l1.49-1.29a2 2 0 0 1 2.11-.45c.84.33 1.72.56 2.62.68A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function CallUI() {
  const { connect, disconnect, status, messages, sendSessionSettings } =
    useVoice();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = status.value === "connected";
  const isConnecting = status.value === "connecting";

  const handleClick = useCallback(async () => {
    setError(null);
    if (isConnected) {
      await disconnect();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/token", { cache: "no-store" });
      if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
      const { accessToken, configId, sessionSettings } =
        (await res.json()) as TokenResponse;
      const { type: _type, ...sessionSettingsMessage } = sessionSettings;

      await connect({
        auth: { type: "accessToken", value: accessToken },
        configId: configId || undefined,
      });
      sendSessionSettings(sessionSettingsMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [connect, disconnect, isConnected, sendSessionSettings]);

  const statusText = error
    ? `Error: ${error}`
    : status.value === "error"
      ? `Error: ${status.reason}`
      : isConnected
        ? "Connected - ask away"
        : isConnecting || loading
          ? "Connecting..."
          : "Ready";

  const buttonLabel = isConnected
    ? "Hang up"
    : isConnecting || loading
      ? "Connecting..."
      : "Start conversation";

  return (
    <main className="min-h-screen px-6 py-12 text-stone-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-stone-300/80 bg-white/75 p-8 shadow-[0_24px_80px_rgba(64,44,17,0.08)] backdrop-blur">
            <div className="inline-flex rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-600">
              Interactive conversational CV
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Talk through Conor&apos;s background instead of scanning a PDF.
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
              Ask about Compass, Wolfram, technical strengths, projects, or the
              kinds of engineering roles he wants next. The voice session is
              grounded on a small hand-written corpus rather than generic AI
              improvisation.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleClick}
                disabled={isConnecting || loading}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition ${
                  isConnected
                    ? "bg-red-500 text-white hover:bg-red-400"
                    : "bg-stone-950 text-stone-50 hover:bg-stone-800"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {!isConnected ? <PhoneIcon /> : null}
                {buttonLabel}
              </button>

              <div className="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm text-stone-700">
                {statusText}
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-300 bg-stone-50/80 p-4">
                <p className="text-sm font-semibold text-stone-900">Grounded</p>
                <p className="mt-1 text-sm text-stone-600">
                  Uses curated CV notes and recruiter-style FAQs.
                </p>
              </div>
              <div className="rounded-2xl border border-stone-300 bg-stone-50/80 p-4">
                <p className="text-sm font-semibold text-stone-900">Honest</p>
                <p className="mt-1 text-sm text-stone-600">
                  If something is not in the source material, it should say so.
                </p>
              </div>
              <div className="rounded-2xl border border-stone-300 bg-stone-50/80 p-4">
                <p className="text-sm font-semibold text-stone-900">
                  Voice-first
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  Built as a practical hiring artifact, not a clone gimmick.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                Try asking
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <span
                    key={suggestion}
                    className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700"
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-stone-300/80 bg-[#10261f] p-8 text-stone-100 shadow-[0_24px_80px_rgba(20,34,28,0.24)]">
            <Image
              src="/me.png"
              alt="Conor Cosnett"
              width={180}
              height={180}
              priority
              className="h-32 w-32 rounded-[1.5rem] border border-white/10 object-cover shadow-2xl"
            />

            <h2 className="mt-6 text-3xl font-semibold">Conor Cosnett</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.24em] text-emerald-200/70">
              Applied AI and product engineering
            </p>

            <div className="mt-6 space-y-4 text-sm leading-7 text-stone-300">
              <p>
                Most recently: Founding Engineer at Compass Labs, building DeFi
                APIs, SDK tooling, analytics, and agentic systems.
              </p>
              <p>
                Previously: customer-facing software engineer and Customer
                Success Manager at Wolfram Research.
              </p>
              <p>
                Background: first-class honours in Applied Mathematics and
                Applied Physics from University of Galway.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <a
                href="https://github.com/ccosnett"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-4 py-2 text-stone-100 transition hover:bg-white/10"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/conorcosnett/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-4 py-2 text-stone-100 transition hover:bg-white/10"
              >
                LinkedIn
              </a>
            </div>
          </aside>
        </section>

        <section className="rounded-[2rem] border border-stone-300/80 bg-white/80 p-6 shadow-[0_24px_80px_rgba(64,44,17,0.08)] backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-stone-950">
                Live transcript
              </h2>
              <p className="text-sm text-stone-600">
                The assistant only renders user and assistant messages here.
              </p>
            </div>
          </div>

          <div className="mt-6 flex min-h-72 flex-col gap-3 rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-4">
            {messages.length === 0 ? (
              <div className="flex min-h-60 items-center justify-center rounded-[1.25rem] border border-dashed border-stone-300 bg-white/70 p-6 text-center text-sm leading-7 text-stone-500">
                Start a call and ask about Conor&apos;s background, Compass,
                Wolfram, technical strengths, or the roles he wants next.
              </div>
            ) : (
              messages.map((msg, i) => {
                if (msg.type === "user_message") {
                  return (
                    <div
                      key={i}
                      className="max-w-[85%] self-end rounded-2xl bg-stone-950 px-4 py-3 text-sm leading-7 text-stone-50"
                    >
                      {msg.message?.content}
                    </div>
                  );
                }
                if (msg.type === "assistant_message") {
                  return (
                    <div
                      key={i}
                      className="max-w-[85%] self-start rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-7 text-stone-900"
                    >
                      {msg.message?.content}
                    </div>
                  );
                }
                return null;
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Call() {
  return (
    <VoiceProvider>
      <CallUI />
    </VoiceProvider>
  );
}
