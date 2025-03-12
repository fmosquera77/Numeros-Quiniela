import { Suspense } from "react"
import LotterySearch from "@/components/lottery-search"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Buscador de Números - Vivi Tu Suerte</h1>
      <Suspense fallback={<SearchSkeleton />}>
        <LotterySearch />
      </Suspense>
    </main>
  )
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

