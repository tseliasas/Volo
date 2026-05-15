export default function GuardianPulse() {

  return (
    <div
      className="
        mt-10

        p-6

        rounded-3xl

        bg-emerald-400/10
        border border-emerald-400/20

        backdrop-blur-xl
      "
    >

      <div className="flex items-center gap-4">

        <div className="relative">

          <div
            className="
              w-4
              h-4
              rounded-full
              bg-emerald-400
            "
          />

          <div
            className="
              absolute
              inset-0
              rounded-full
              bg-emerald-400
              animate-ping
            "
          />

        </div>

        <div>

          <h3 className="font-semibold">
            Guardian Status
          </h3>

          <p className="text-sm text-gray-300 mt-1">
            Area sentiment positive and safe for students.
          </p>

        </div>

      </div>

    </div>
  );
}