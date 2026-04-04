'use client'

interface AddToCartButtonProps {
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export default function AddToCartButton({ quantity, onAdd, onRemove }: AddToCartButtonProps) {
  if (quantity === 0) {
    return (
      <button
        onClick={onAdd}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
      >
        Add
      </button>
    )
  }

  return (
    <div className="flex items-center justify-between bg-orange-500 rounded-xl overflow-hidden">
      <button
        onClick={onRemove}
        className="px-4 py-2 text-white text-xl font-bold hover:bg-orange-600 transition-colors min-w-[44px]"
      >
        −
      </button>
      <span className="text-white font-bold text-lg">{quantity}</span>
      <button
        onClick={onAdd}
        className="px-4 py-2 text-white text-xl font-bold hover:bg-orange-600 transition-colors min-w-[44px]"
      >
        +
      </button>
    </div>
  )
}
