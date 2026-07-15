import { ExternalLink, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type RecommendedProduct = {
  id: string
  title: string
  subtitle: string
  price: string
  href: string
  image: string
  stockLabel: string
}

type RecommendedProductsSectionProps = {
  products: RecommendedProduct[]
  browsePartsHref: string
}

export function RecommendedProductsSection({
  products,
  browsePartsHref,
}: RecommendedProductsSectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-foreground">
        Saved Parts & Offers
      </h2>

      {!products.length ? (
        <Card className="rounded-sm border border-border bg-brand-panel">
          <CardContent className="p-10 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-brand-muted" />
            <h3 className="text-xl font-semibold text-foreground">
              No saved parts yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">
              Save parts from the marketplace and they will appear in your
              overview.
            </p>
            <Button
              asChild
              className="mt-5 rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-brand-primary-hover"
            >
              <a href={browsePartsHref}>Browse Parts</a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Card
            key={product.id}
            className="rounded-sm border border-border bg-brand-panel transition-all hover:border-primary"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex aspect-square items-center justify-center rounded-sm bg-brand-panel-strong">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full rounded-sm object-cover"
                  />
                ) : (
                  <Package className="h-16 w-16 text-brand-muted" />
                )}
              </div>

              <h3 className="mb-2 font-semibold text-foreground">
                {product.title}
              </h3>

              <p className="mb-4 text-sm text-brand-muted">
                {product.subtitle}
              </p>
              <p className="mb-4 text-xs text-brand-muted">
                {product.stockLabel}
              </p>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-primary">
                  {product.price}
                </span>

                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-brand-primary-hover"
                >
                  <a href={product.href}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
