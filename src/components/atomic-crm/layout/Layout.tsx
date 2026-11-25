import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Skeleton } from "@/components/ui/skeleton";

import { DataImportProvider } from "../dataImport/DataImportProvider";
import { useConfigurationLoader } from "../root/useConfigurationLoader";
import Header from "./Header";
import { GlobalShortcutsHandler } from "./GlobalShortcutsHandler";

export const Layout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();

  return (
    <DataImportProvider>
      <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-background text-foreground">
        <GlobalShortcutsHandler />
        <Header />
        <main
          className="w-full flex-1 max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 overflow-x-hidden"
          id="main-content"
        >
          <ErrorBoundary FallbackComponent={Error}>
            <Suspense
              fallback={<Skeleton className="h-12 w-12 rounded-full" />}
            >
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
        <Notification />
      </div>
    </DataImportProvider>
  );
};
