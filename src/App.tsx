import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Watermark from "./pages/Watermark";
import Verify from "./pages/Verify";
import IPFS from "./pages/IPFS";
import Generate from "./pages/Generate";
import Plagiarism from "./pages/Plagiarism";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/watermark" element={<Watermark />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/ipfs" element={<IPFS />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/plagiarism" element={<Plagiarism />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;