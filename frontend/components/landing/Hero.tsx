// e-commerce/frontend/components/landing/Hero.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Star, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative bg-linear-to-br from-red-900 to-red-950 pt-10 pb-10 px-4"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">

              <h1 className="text-4xl lg:text-6xl font-bold text-red-50 leading-tight">
                Step Up Your Style with
                <span className="text-red-400"> Premium Sneakers</span>
              </h1>

              <p className="text-lg lg:text-xl text-red-200 max-w-lg">
                Discover the latest collection of branded sneakers and shoes.
                From athletic performance to street style, find your perfect
                pair.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                <ShoppingBag className="w-5 h-5" />
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="lg">
                View Collection
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-red-100">500+</div>
                <div className="text-sm text-red-300">Sneaker Models</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-100">25K+</div>
                <div className="text-sm text-red-300">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-100">4.9★</div>
                <div className="text-sm text-red-300">Customer Rating</div>
              </div>
            </div>
          </div>

          {/* Right Image/Illustration */}
          <div className="flex justify-center items-center">
            <img src="/shoes-hero.png" alt="Premium Sneakers Collection" />
          </div>
        </div>
      </div>
    </section>
  );
}
