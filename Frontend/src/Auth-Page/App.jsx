import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { isSupabaseConfigured, setRememberMe, supabase } from "@/lib/supabaseClient";

function Icon({ children, className = "size-5", viewBox = "0 0 24 24" }) {
    return (
        <svg //View Port
        aria-hidden={"true"}
        className={className}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        >
            {children}
        </svg>
    );
}

function Logo() {
    return (
        //vertically center flexbox
        <div className={"flex items-center gap-3"} aria-label="Study Quest">
            <div className="grid size-10 place-items-center rounded-xl border-2 border-ink bg-lime shadow-sticker">
                <Icon className={"size-6"}>
                      <path
                        d="M5 19.5V6.8c2.6-.7 5-.2 7 1.5v11.2c-2-1.7-4.4-2.2-7-1.5ZM19 19.5V6.8c-2.6-.7-5-.2-7 1.5v11.2c2-1.7 4.4-2.2 7-1.5Z"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        />
                <path d="m15.4 4 .6 1.3 1.4.6-1.4.6-.6 1.3-.6-1.3-1.4-.6 1.4-.6.6-1.3Z" fill="currentColor" />
            </Icon>
        </div>
        <span className="text-xl font-extrabold tracking-tight">
            Study <span className="text-violet">Quest</span>
            </span>
    </div>
    );
}

function QuestIllustration() {
    return (
        <div className="relative mx-auto aspect-square w-full max-w-xl" aria-hidden="true">
            <div className="absolute left-[8%] top-[9%] rotate-[-5deg] rounded-2xl border-2 border-ink bg-paper px-5 py-3 shadow-sticker">
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Today&apos;s quest</p>
                <p className="mt-1 font-extrabold">Ace chapter 4</p>
            </div>

            <svg className="absolute inset-0 size-full" viewBox="0 0 560 560">
                <path
                    d="M110 150c70 6 20 90 96 107 100 9 197-61 249 18 44 67-72 88-30 165"
                    fill="none"
                    stroke="#272334"
                    strokeDasharray="10 13"
                    strokeLinecap="round"
                    strokeWidth="3"
                />
                <path d="m100 140 17 5-12 13Z" fill="#272334" />
                <path d="m416 397 10 15 10-16Z" fill="#272334" />
            </svg>

            <div className="absolute right-[8%] top-[21%] grid size-24 rotate-[5deg] place-items-center rounded-[2rem] border-2 border-ink bg-coral shadow-card">
                <Icon className="size-11">
                    <path d="M7 7.5h10M7 11.5h7M5 4h14v16l-3.5-2-3.5 2-3.5-2L5 20V4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                </Icon>
            </div>

            <div className="absolute left-[11%] top-[42%] grid size-20 rotate-[-8deg] place-items-center rounded-full border-2 border-ink bg-blue shadow-card">
                <Icon className="size-10">
                    <path d="m12 3 2.2 5.8 6.3.3-4.9 4 1.7 6.1-5.3-3.5-5.3 3.5 1.7-6.1-4.9-4 6.3-.3L12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
                </Icon>
            </div>

            <div className="absolute bottom-[13%] left-[29%] right-[17%] rounded-[2rem] border-2 border-ink bg-violet p-5 text-white shadow-card">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-white/70">Weekly streak</p>
                        <p className="mt-1 text-2xl font-extrabold">7 days strong</p>
                    </div>
                    <div className="grid size-14 place-items-center rounded-2xl bg-lime text-ink">
                        <Icon className="size-8">
                            <path d="M13.5 3.5c.5 3-1.8 4.2-3.1 6.2-1.1-1.6-1.5-2.8-.9-4.7C6.6 7.1 5 10 5.6 13.5A6.5 6.5 0 0 0 18.3 15c.9-3.8-1.2-7.7-4.8-11.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
                            <path d="M12 12c-2.2 2.3-1.6 4.8 0 6.2 1.9-1 2.9-3.5 0-6.2Z" fill="currentColor" />
                        </Icon>
                    </div>
                </div>
                <div className="mt-5 flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div key={day} className="grid size-8 flex-1 place-items-center rounded-lg bg-white/15 text-xs font-extrabold">
                            {day}
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute right-[5%] top-[51%] rounded-full border-2 border-ink bg-lime p-3 shadow-sticker">
                <Icon className="size-7">
                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
                </Icon>
            </div>
        </div>
    );
}

export default function App() {
    const navigate = useNavigate();
    const { session } = useAuth();
    const [mode, setMode] = useState("login");
    const [showPassword, setShowPassword] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMeChecked] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const isLogin = mode === "login";

    useEffect(() => {
        if (session) {
            navigate("/", { replace: true });
        }
    }, [session, navigate]);

    function switchMode(nextMode) {
        setMode(nextMode);
        setError(null);
        setMessage(null);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (!isSupabaseConfigured || !supabase) {
            setError("Supabase is not configured. Copy Frontend/.env.example to Frontend/.env and add your keys.");
            setLoading(false);
            return;
        }

        if (isLogin) {
            setRememberMe(rememberMe);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
        } else {
            setRememberMe(true);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { display_name: displayName },
                    emailRedirectTo: window.location.origin,
                },
            });
            if (error) {
                setError(error.message);
            } else if (!data.session) {
                // Email confirmation is enabled in the Supabase project.
                setMessage("Check your inbox to confirm your email, then log in.");
            }
        }

        setLoading(false);
    }

    async function handleForgotPassword() {
        setError(null);
        setMessage(null);
        if (!isSupabaseConfigured || !supabase) {
            setError("Supabase is not configured. Copy Frontend/.env.example to Frontend/.env and add your keys.");
            return;
        }
        if (!email) {
            setError("Enter your email address first, then click \"Forgot password?\".");
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) setError(error.message);
        else setMessage("Password reset link sent. Check your inbox.");
    }

    if (session) {
        return null;
    }

    return (
        <main className="min-h-screen bg-paper text-ink">
            <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
                <section className="relative hidden overflow-hidden border-r-2 border-ink bg-lilac p-10 lg:flex lg:flex-col xl:p-14">
                    <Logo />
                    <div className="mx-auto mt-14 max-w-2xl text-center">
                        <p className="mb-5 inline-flex rounded-full border-2 border-ink bg-lime px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] shadow-sticker">
                            Learn. Level up. Repeat.
                        </p>
                        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">
                            Turn study time into <span className="text-violet">quest time.</span>
                        </h1>
                    </div>
                    <div className="min-h-0 flex-1">
                        <QuestIllustration />
                    </div>
                </section>

                <section className="safe-area-top flex min-h-screen flex-col px-5 pb-6 sm:px-10 lg:px-14 xl:px-24">
                    <div className="mb-10 flex items-center justify-between lg:justify-end">
                        <div className="lg:hidden">
                            <Logo />
                        </div>
                        <p className="hidden text-sm font-semibold text-muted sm:block">
                            {isLogin ? "New to Study Quest?" : "Already adventuring?"}
                            <button
                                className="ml-2 font-extrabold text-violet underline decoration-2 underline-offset-4 transition hover:text-ink"
                                onClick={() => switchMode(isLogin ? "signup" : "login")}
                                type="button"
                            >
                                {isLogin ? "Create account" : "Log in"}
                            </button>
                        </p>
                    </div>

                    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-10">
                        <div className="mb-8">
                            <div className="mb-5 grid size-12 place-items-center rounded-2xl border-2 border-ink bg-lime shadow-sticker">
                                <Icon className="size-6">
                                    <path
                                        d="m9.2 13.1 6.7-6.7 3.5-1.8-1.8 3.5-6.7 6.7-1.7-1.7Z"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.8"
                                    />
                                    <path
                                        d="m15.9 6.4 1.7 1.7M7.2 11.1l5.7 5.7M10.5 15.1l-4.7 4.7M8.9 13.5l-4.7 4.7M4.1 18.2l1.7 1.7"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.8"
                                    />
                                </Icon>
                            </div>
                            <h2 className="text-4xl font-extrabold tracking-tight">
                                {isLogin ? "Welcome back, hero" : "Begin your adventure"}
                            </h2>
                            <p className="mt-3 leading-relaxed text-muted">
                                {isLogin
                                    ? "Your quests, streaks, and study squad are waiting."
                                    : "Create your profile and make every study session count."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 rounded-2xl bg-soft p-1.5">
                            {["login", "signup"].map((tab) => (
                                <button
                                    className={`rounded-xl px-4 py-3 text-sm font-extrabold transition ${
                                        mode === tab ? "border-2 border-ink bg-white shadow-sticker" : "text-muted hover:text-ink"
                                    }`}
                                    key={tab}
                                    onClick={() => switchMode(tab)}
                                    type="button"
                                >
                                    {tab === "login" ? "Log in" : "Sign up"}
                                </button>
                            ))}
                        </div>

                        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <label className="block">
                                    <span className="mb-2 block text-sm font-extrabold">Display name</span>
                                    <input
                                        className="field"
                                        name="name"
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="QuestingScholar"
                                        required
                                        value={displayName}
                                        type="text"
                                    />
                                </label>
                            )}

                            <label className="block">
                                <span className="mb-2 block text-sm font-extrabold">Email address</span>
                                <input
                                    autoComplete="email"
                                    className="field"
                                    name="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="hero@example.com"
                                    required
                                    type="email"
                                    value={email}
                                />
                            </label>

                            <label className="block">
                <span className="mb-2 flex items-center justify-between text-sm font-extrabold">
                  Password
                    {isLogin && (
                        <button className="text-xs text-violet hover:underline" onClick={handleForgotPassword} type="button">
                            Forgot password?
                        </button>
                    )}
                </span>
                                <span className="relative block">
                  <input
                      className="field pr-14"
                      minLength={8}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      name="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      value={password}
                      required
                      type={showPassword ? "text" : "password"}
                  />
                  <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
                      onClick={() => setShowPassword((visible) => !visible)}
                      type="button"
                  >
                    <Icon>
                      {showPassword ? (
                          <>
                              <path d="m4 4 16 16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                              <path d="M10.2 10.2a2.5 2.5 0 0 0 3.5 3.5M9.5 5.5A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a15.7 15.7 0 0 1-2.2 3M6.2 6.2C3.9 8 3 12 3 12s3.5 7 9 7c1.1 0 2.2-.3 3.1-.7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                          </>
                      ) : (
                          <>
                              <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
                              <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
                          </>
                      )}
                    </Icon>
                  </button>
                </span>
                            </label>

                            {isLogin && (
                                <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-muted">
                                    <input
                                        checked={rememberMe}
                                        className="size-5 rounded accent-violet"
                                        onChange={(e) => setRememberMeChecked(e.target.checked)}
                                        type="checkbox"
                                    />
                                    Keep me logged in
                                </label>
                            )}

                            {error && (
                                <div className="rounded-xl border-2 border-ink bg-coral/50 px-4 py-3 text-sm font-bold" role="alert">
                                    {error}
                                </div>
                            )}

                            {message && (
                                <div className="rounded-xl border-2 border-ink bg-lime/50 px-4 py-3 text-sm font-bold" role="status">
                                    {message}
                                </div>
                            )}

                            <button className="primary-button disabled:opacity-60" disabled={loading} type="submit">
                                <span>
                                    {loading ? "One moment..." : isLogin ? "Continue my quest" : "Create my account"}
                                </span>
                                <Icon>
                                    <path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                </Icon>
                            </button>
                        </form>

                        <p className="mt-7 text-center text-xs leading-relaxed text-muted">
                            By continuing, you agree to our{" "}
                            <button className="font-bold text-ink underline underline-offset-2" type="button">
                                Terms
                            </button>{" "}
                            and{" "}
                            <button className="font-bold text-ink underline underline-offset-2" type="button">
                                Privacy Policy
                            </button>
                            .
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
