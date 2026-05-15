export default function FloatingNavbar() {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 px-8 py-6">
      <div className="flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-400 blur-[2px]" />

          <div>
            <h1 className="text-xl font-bold tracking-wide">
              E-Travels
            </h1>

            <p className="text-xs text-gray-400">
              AI Travel and Holiday Intelligence
            </p>
          </div>
        </div>

      </div>
    </nav>
  );
}