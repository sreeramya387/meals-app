import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Plan Your Meals.<br />Save Time Shopping.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create delicious meal plans for the week and automatically generate your grocery list.
            Simple, efficient, and stress-free meal planning.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/register">
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">Create Meals</h3>
              <p className="text-gray-600">
                Build your personal recipe collection with ingredients and nutrition info.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-xl font-semibold mb-2">Plan Your Week</h3>
              <p className="text-gray-600">
                Drag and drop meals into your weekly calendar. See nutrition at a glance.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🛒</div>
              <h3 className="text-xl font-semibold mb-2">Auto Grocery Lists</h3>
              <p className="text-gray-600">
                Generate shopping lists automatically from your meal plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
