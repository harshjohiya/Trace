import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { WaveformIcon } from "@/components/WaveformIcon";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <WaveformIcon size={40} />
        </div>
        <h1 className="text-[28px] font-bold" style={{ color: "var(--ink-1)" }}>
          Page not found
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: "var(--ink-2)" }}>
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center h-10 px-5 rounded-md text-[14px] font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="text-[18px] font-semibold" style={{ color: "var(--ink-1)" }}>
          This page didn't load
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: "var(--ink-2)" }}>
          Something went wrong. Try again.
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex h-10 items-center px-5 rounded-md text-white text-[14px] font-semibold"
          style={{ background: "var(--accent)" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

import { AuthProvider } from "@/components/AuthProvider";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
