// e-commerce/frontend/components/landing/Testimonials.tsx
"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Software Developer",
    avatar: "/api/placeholder/100/100",
    rating: 5,
    content: "Absolutely love this platform! The user experience is seamless and I found exactly what I was looking for. Fast shipping and great customer service too!",
    featured: true
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Product Designer",
    avatar: "/api/placeholder/100/100",
    rating: 5,
    content: "Great selection of products and competitive prices. The checkout process is smooth and I love the product recommendations. Highly recommended!",
    featured: false
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    avatar: "/api/placeholder/100/100",
    rating: 4,
    content: "Very satisfied with my purchases. The quality is excellent and the return policy is hassle-free. Will definitely shop here again.",
    featured: false
  },
  {
    id: 4,
    name: "David Kim",
    role: "Entrepreneur",
    avatar: "/api/placeholder/100/100",
    rating: 5,
    content: "As a business owner, I appreciate the bulk ordering options and quick delivery. This platform has become my go-to for office supplies.",
    featured: false
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Teacher",
    avatar: "/api/placeholder/100/100",
    rating: 5,
    content: "Amazing customer service! They helped me find the perfect products for my classroom and even gave me an educator discount.",
    featured: false
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Fitness Coach",
    avatar: "/api/placeholder/100/100",
    rating: 4,
    content: "Great quality products and fast shipping. The mobile app is very user-friendly and I can shop on the go. Love it!",
    featured: false
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white px-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real reviews from real customers who love shopping with us
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="mb-12">
          <div className="bg-linear-to-r from-red-800 to-red-900 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
            <Quote className="absolute top-4 right-4 w-16 h-16 opacity-10" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-xl lg:text-2xl mb-8 leading-relaxed">
                "{testimonials[0].content}"
              </blockquote>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/30 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-lg">{testimonials[0].name}</div>
                  <div className="text-red-100">{testimonials[0].role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(1).map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 bg-gray-50 rounded-xl p-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">4.8★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div>
              <div className="text-3xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div>
              <div className="text-3xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
