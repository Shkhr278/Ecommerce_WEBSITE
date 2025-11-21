import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProductsPage from "@/pages/events";
import CartPage from "@/pages/cart";
import FavoritesPage from "@/pages/favorites";
import ProfilePage from "@/pages/profile";
import ProductDetailsPage from "@/pages/product-details";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProductsPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/product/:id" component={ProductDetailsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
