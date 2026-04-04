'use client'

interface AddToCartButtonProps {
  quantity: number
  onAdd: () => void
  onRemove: () => void
  disabled?: boolean
}

export default function AddToCartButton({ quantity, onAdd, onRemove, disabled }: AddToCartButtonProps) {
  if (disabled) return null

  if (quantity === 0) {
    return (
      <button
        onClick={onAdd}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-colors whitespace-nowrap"
      >
        + Add
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 bg-orange-500 rounded-lg overflow-hidden">
      <button
        onClick={onRemove}
        className="px-3 py-1.5 text-white text-lg font-bold hover:bg-orange-600 transition-colors"
      >
        −
      </button>
      <span className="text-white font-bold text-base min-w-[1.5rem] text-center">{quantity}</span>
      <button
        onClick={onAdd}
        className="px-3 py-1.5 text-white text-lg font-bold hover:bg-orange-600 transition-colors"
      >
        +
      </button>
    </div>
  )
}
