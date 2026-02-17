'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Printer, Trash2, ShoppingCart } from 'lucide-react'
import { format } from 'date-fns'

interface GroceryItem {
  id: string
  itemName: string
  quantity: string
  unit: string
  category: string
  isChecked: boolean
}

interface GroceryList {
  id: string
  name: string
  createdAt: Date
  items?: GroceryItem[]
}

const categories = ['produce', 'meat', 'dairy', 'pantry', 'other']

export default function GroceryPage() {
  const router = useRouter()
  const [lists, setLists] = useState<GroceryList[]>([])
  const [currentList, setCurrentList] = useState<GroceryList | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/grocery')
      const data = await response.json()

      if (response.ok) {
        setLists(data.data)
        if (data.data.length > 0) {
          fetchListDetails(data.data[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch lists:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchListDetails = async (listId: string) => {
    try {
      const response = await fetch(`/api/grocery/${listId}`)
      const data = await response.json()

      if (response.ok) {
        setCurrentList(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch list details:', err)
    }
  }

  const handleGenerateList = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/grocery/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekDate: new Date().toISOString() }),
      })

      const data = await response.json()

      if (response.ok) {
        fetchLists()
      } else {
        alert(data.error || 'Failed to generate list')
      }
    } catch (err) {
      alert('Failed to generate list')
    } finally {
      setGenerating(false)
    }
  }

  const handleToggleItem = async (itemId: string, isChecked: boolean) => {
    if (!currentList) return

    try {
      const response = await fetch(`/api/grocery/${currentList.id}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, isChecked }),
      })

      if (response.ok) {
        setCurrentList({
          ...currentList,
          items: currentList.items?.map((item) =>
            item.id === itemId ? { ...item, isChecked } : item
          ),
        })
      }
    } catch (err) {
      console.error('Failed to toggle item:', err)
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this grocery list?')) return

    try {
      const response = await fetch(`/api/grocery/${listId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        if (currentList?.id === listId) {
          setCurrentList(null)
        }
        fetchLists()
      }
    } catch (err) {
      console.error('Failed to delete list:', err)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getItemsByCategory = (category: string) => {
    return currentList?.items?.filter((item) => item.category === category) || []
  }

  const getTotalItems = () => currentList?.items?.length || 0
  const getCheckedItems = () => currentList?.items?.filter((item) => item.isChecked).length || 0

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grocery List</h1>
          <p className="text-muted-foreground mt-2">
            Generate and manage your shopping lists
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateList} disabled={generating}>
            <Plus className="mr-2 h-4 w-4" />
            {generating ? 'Generating...' : 'Generate from Plan'}
          </Button>
          {currentList && (
            <Button variant="outline" onClick={handlePrint} className="print:hidden">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          )}
        </div>
      </div>

      {lists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No grocery lists yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Generate a grocery list from your weekly meal plan
            </p>
            <Button onClick={handleGenerateList} disabled={generating}>
              <Plus className="mr-2 h-4 w-4" />
              {generating ? 'Generating...' : 'Generate from Current Week'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar with list history */}
          <Card className="lg:col-span-1 print:hidden">
            <CardHeader>
              <CardTitle className="text-sm">Your Lists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentList?.id === list.id ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => fetchListDetails(list.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{list.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(list.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteList(list.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Main list view */}
          <div className="lg:col-span-3">
            {currentList ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{currentList.name}</CardTitle>
                    <CardDescription>
                      {getCheckedItems()} of {getTotalItems()} items checked
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${getTotalItems() > 0 ? (getCheckedItems() / getTotalItems()) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {categories.map((category) => {
                  const items = getItemsByCategory(category)
                  if (items.length === 0) return null

                  return (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="text-lg capitalize flex items-center gap-2">
                          {category}
                          <Badge variant="secondary">{items.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-3 rounded-lg border"
                            >
                              <Checkbox
                                checked={item.isChecked}
                                onCheckedChange={(checked) =>
                                  handleToggleItem(item.id, checked as boolean)
                                }
                              />
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    item.isChecked ? 'line-through text-muted-foreground' : ''
                                  }`}
                                >
                                  {item.itemName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {Number(item.quantity).toFixed(1)} {item.unit}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
                  Select a list from the sidebar
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
