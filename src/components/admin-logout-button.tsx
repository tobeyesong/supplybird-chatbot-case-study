import { LogOut } from 'lucide-react'
import { logout } from '@/app/admin/actions'

export function AdminLogoutButton() {
  return (
    <form action={logout}>
      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-bold text-background hover:bg-foreground/88 sm:w-auto"
        type="submit"
      >
        <LogOut className="size-4" aria-hidden="true" />
        Log out
      </button>
    </form>
  )
}
