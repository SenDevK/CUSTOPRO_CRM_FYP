
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import LanguageAttributeUpdater from "@/components/LanguageAttributeUpdater";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EnhancedDashboardPage from "./pages/EnhancedDashboardPage";
import CustomersPage from "./pages/CustomersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DataImportPage from "./pages/DataImportPage";
import MarketingPage from "./pages/MarketingPage";
import SegmentCustomersPage from "./pages/SegmentCustomersPage";
import SegmentAnalyticsPage from "./pages/SegmentAnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageAttributeUpdater />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />

          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Navigate to="/analytics" />} />
            <Route path="/dashboard-legacy" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/import" element={<DataImportPage />} />
            <Route path="/marketing" element={<MarketingPage />} />
            <Route path="/settings" element={<div className="p-8">Settings page will be available in the next version</div>} />
            <Route path="/segment-customers/:segmentId" element={<SegmentCustomersPage />} />
            <Route path="/segment-analytics/:segmentId" element={<SegmentAnalyticsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
