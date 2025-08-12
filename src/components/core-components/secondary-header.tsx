"use client"

interface SecondaryHeaderProps {
  show: boolean
  overlay: boolean
}

const categories = [
  "SHOP ALL",
  "OFFERS",
  "TEA",
  "FACE",
  "BODY",
  "HAIR",
  "MEN",
  "ROUTINES",
  "LEARN",
  "SHOP BY CONCERN",
  "TAYORI BLOG",
  "GIFTING",
]

export default function SecondaryHeader({ show, overlay }: SecondaryHeaderProps) {
  return (
    <nav
      className={`
        w-full bg-white border-b shadow transition-all duration-300
        ${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        ${overlay ? "fixed top-16 left-0 z-40" : ""}
        ${!overlay ? "block" : ""}
      `}
      style={{ minHeight: 56 }}
    >
      <ul className="flex w-full justify-center gap-8 py-3 text-base font-medium">
        {categories.map((cat) => (
          <li key={cat} className="hover:text-black cursor-pointer uppercase tracking-wide text-gray-800">
            {cat}
          </li>
        ))}
      </ul>
    </nav>
  )
}
