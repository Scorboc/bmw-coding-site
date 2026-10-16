import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Index from "./pages/Index";
const ChatGPT = lazy(() => import("./pages/ChatGPT"));
const Admin = lazy(() => import("./pages/Admin"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ErrorCodes = lazy(() => import("./pages/ErrorCodes"));
const ErrorCodeDetail = lazy(() => import("./pages/ErrorCodeDetail"));
const ChipTuningPage = lazy(() => import("./pages/ChipTuningPage"));
const CodingPage = lazy(() => import("./pages/CodingPage"));
const KeysPage = lazy(() => import("./pages/KeysPage"));
const EcologyPage = lazy(() => import("./pages/EcologyPage"));
const BMWModelPage = lazy(() => import("./pages/BMWModelPage"));
const BMWEnginePage = lazy(() => import("./pages/BMWEnginePage"));
const PricesPage = lazy(() => import("./pages/PricesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const MaintenancePage = lazy(() => import("./pages/MaintenancePage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogArticlePage = lazy(() => import("./pages/BlogArticlePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
import ScrollToTopButton from "@/components/ScrollToTopButton";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ScrollToTopButton />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div role="status" className="min-h-screen bg-black text-white flex items-center justify-center">Загрузка страницы…</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chatgpt" element={<ChatGPT />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/error-codes" element={<ErrorCodes />} />
            <Route path="/error-codes/:code" element={<ErrorCodeDetail />} />
            <Route path="/chip-tuning" element={<ChipTuningPage />} />
            <Route path="/chip-tuning/:slug" element={<BMWModelPage />} />
            <Route path="/engines/:slug" element={<BMWEnginePage />} />
            <Route path="/coding" element={<CodingPage />} />
            <Route path="/keys" element={<KeysPage />} />
            <Route path="/ecology" element={<EcologyPage />} />
            <Route path="/prices" element={<PricesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
