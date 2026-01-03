// e-commerce/frontend/components/landing/Features.tsx
"use client";

import { Shield, Truck, Headphones, Award, Clock, Users } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Authentic Sneakers",
    description: "100% genuine branded sneakers with authenticity verification and quality guarantee."
  },
  {
    icon: Truck,
    title: "Fast Sneaker Delivery",
    description: "Quick and reliable delivery with real-time tracking for your latest sneaker pickups."
  },
  {
    icon: Headphones,
    title: "Sneaker Expert Support",
    description: "24/7 customer service from sneaker experts who understand your style and needs."
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Carefully curated collection of the latest and most sought-after sneaker models."
  },
  {
    icon: Clock,
    title: "Easy Returns",
    description: "30-day hassle-free return policy if your sneakers don't fit or meet expectations."
  },
  {
    icon: Users,
    title: "Sneaker Community",
    description: "Join thousands of sneaker enthusiasts and exclusive member-only releases."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white px-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Sneaker Store?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide the best sneaker shopping experience with features designed for true sneaker lovers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border border-gray-200 hover:border-red-700 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-red-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-700 transition-colors">
                <feature.icon className="w-6 h-6 text-red-200 group-hover:text-white transition-colors" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
