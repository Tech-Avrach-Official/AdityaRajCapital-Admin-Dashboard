import { Info } from "lucide-react"

const EffectiveAtNextLoginNote = ({ className = "" }) => (
  <div
    className={`flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 ${className}`}
  >
    <Info className="h-4 w-4 shrink-0 mt-0.5" />
    <p>
      Changes will take effect after the user&apos;s next login (within 7 days,
      or sooner if they log out and back in).
    </p>
  </div>
)

export default EffectiveAtNextLoginNote
