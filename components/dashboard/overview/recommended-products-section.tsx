import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type RecommendedProduct = {
  id: number
  title: string
  subtitle: string
  price: string
}

type RecommendedProductsSectionProps = {
  products: RecommendedProduct[]
}

export function RecommendedProductsSection({
  products,
}: RecommendedProductsSectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-foreground">
        Recommended for Your Vehicle
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Card
            key={product.id}
            className="cursor-pointer rounded-sm border border-border bg-brand-panel transition-all hover:border-primary"
          >
            <CardContent className="p-6">
              <div className="mb-4 aspect-square rounded-sm bg-brand-panel-strong" />

              <h3 className="mb-2 font-semibold text-foreground">
                {product.title}
              </h3>

              <p className="mb-4 text-sm text-brand-muted">
                {product.subtitle}
              </p>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-primary">
                  {product.price}
                </span>

                <Button className="bg-primary text-primary-foreground hover:bg-brand-primary-hover">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
