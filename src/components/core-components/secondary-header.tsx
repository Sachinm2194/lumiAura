"use client";

export default function SecondaryHeader() {
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
  ];

  return (
    <nav className="w-full bg-white h-full overflow-auto">
      <ul className="flex flex-col gap-2 py-6 text-base font-medium">
        {categories.map((cat) => (
          <li
            key={cat}
            className="hover:text-black cursor-pointer uppercase tracking-wide text-gray-800 px-6 py-3"
          >
            {cat}
          </li>
        ))}
      </ul>
    </nav>
  );
}
