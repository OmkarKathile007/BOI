import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminPanel from "./components/AdminPanel";
import NotFound from "./pages/NotFound";
import DeviceTilt from "./pages/DeviceTilt";
import SecureSwipe from "./components/SecureSwipe";
import GetIpButton from "./components/GetIpButton";
import LocationFinder from "./components/LocationFinder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/device" element={<DeviceTilt />} />
          <Route path="/admin" element={<AdminPanel />} />
           <Route path="/patternswipe" element={<SecureSwipe/>} />
            <Route path="/ip" element={<GetIpButton/>} />
              <Route path="/loc" element={<LocationFinder/>} />
    
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
