"use client";

import Link from "next/link";
import { Heart, Package, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Saved Parts",
    value: "4",
    showIcon: true,
    icon: Heart,
  },
  {
    title: "In Stock",
    value: "3",
    showIcon: false,
  },
  {
    title: "Total Value",
    value: "$237.96",
    showIcon: false,
  },
];

const savedParts = [
  {
    brand: "Brembo",
    title: "Premium Brake Pads - Front",
    fit: "Fits: 2019 Toyota Camry",
    price: "$89.99",
    actionLabel: "Add to Cart",
    inStock: true,
    stockLabel: "",
  },
  {
    brand: "Mobil 1",
    title: "Synthetic Oil Filter",
    fit: "Fits: 2019 Toyota Camry",
    price: "$12.99",
    actionLabel: "Add to Cart",
    inStock: true,
    stockLabel: "",
  },
  {
    brand: "K&N",
    title: "High Performance Air Filter",
    fit: "Fits: 2021 Honda Accord",
    price: "$54.99",
    actionLabel: "Notify Me",
    inStock: false,
    stockLabel: "Out of Stock",
  },
  {
    brand: "Philips",
    title: "LED Headlight Bulbs",
    fit: "Fits: 2019 Toyota Camry",
    price: "$79.99",
    actionLabel: "Add to Cart",
    inStock: true,
    stockLabel: "",
  },
];

export default function SavedPartsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Saved Parts</h1>
          <p className="text-brand-muted">
            Keep track of parts you&apos;re interested in.
          </p>
        </div>

        <Button
          asChild
          className="h-auto w-full rounded-sm bg-primary px-6 py-3 text-foreground hover:bg-brand-primary-hover sm:w-auto"
        >
          <Link href="/search">Browse Parts</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="rounded-sm border border-border bg-brand-panel"
            >
              <CardContent className="p-6">
                {item.showIcon && Icon ? (
                  <div className="mb-2 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="text-sm text-brand-muted">{item.title}</div>
                  </div>
                ) : (
                  <div className="mb-2 text-sm text-brand-muted">{item.title}</div>
                )}

                <div className="text-3xl font-bold text-foreground">{item.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {savedParts.map((part) => (
          <Card
            key={`${part.brand}-${part.title}`}
            className="group overflow-hidden rounded-sm border border-border bg-brand-panel transition-all hover:border-primary"
          >
            <div className="relative flex aspect-square items-center justify-center bg-brand-panel-strong">
              <Package className="h-16 w-16 text-brand-muted" />

              <button
                type="button"
                className="absolute right-3 top-3 rounded-sm bg-background/50 p-2 backdrop-blur-sm transition-all hover:bg-primary"
              >
                <Trash2 className="h-4 w-4 text-foreground" />
              </button>

              {!part.inStock ? (
                <Badge className="absolute bottom-3 left-3 rounded-full border border-brand-warning/20 bg-brand-warning/10 px-3 py-1 text-xs font-medium text-brand-warning hover:bg-brand-warning/10">
                  {part.stockLabel}
                </Badge>
              ) : null}
            </div>

            <CardContent className="p-4">
              <div className="mb-1 text-xs text-brand-muted">{part.brand}</div>

              <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">
                {part.title}
              </h3>

              <div className="mb-3 text-xs text-brand-muted">{part.fit}</div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-bold text-primary">
                  {part.price}
                </div>

                {part.inStock ? (
                  <Button className="rounded-sm bg-primary px-4 py-2 text-sm text-foreground hover:bg-brand-primary-hover">
                    {part.actionLabel}
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="cursor-not-allowed rounded-sm bg-brand-panel-strong px-4 py-2 text-sm text-brand-muted hover:bg-brand-panel-strong"
                  >
                    {part.actionLabel}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}