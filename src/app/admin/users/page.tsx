import Link from "next/link";
import prisma from "@/lib/prisma";
import { adminSetUserActive } from "@/app/actions";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const users = await prisma.user
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { _count: { select: { listings: true, jobPosts: true, reports: true } } },
    })
    .catch(() => []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-white">Users</h1>
          <p className="mt-1 text-[13px] text-slate-500">{users.length} accounts in the directory</p>
        </div>
        <Link href="/admin" className="text-[12px] text-slate-400 hover:text-slate-200">
          ← Back to overview
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-surface-850">
        <div className="grid grid-cols-[1.6fr_.8fr_.7fr_.7fr_.9fr] gap-3 border-b border-white/[0.05] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          <span>Account</span>
          <span>Role</span>
          <span>Listings</span>
          <span>Joined</span>
          <span className="text-right">Action</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {users.map((user) => {
            const banned = user.role === "SUSPENDED";
            return (
              <div key={user.id} className="grid grid-cols-[1.6fr_.8fr_.7fr_.7fr_.9fr] items-center gap-3 px-5 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10.5px] font-semibold text-slate-300">
                    {initials(user.displayName ?? user.name ?? user.email)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-slate-200">
                      {user.displayName ?? user.name ?? "Unnamed"}
                    </p>
                    <p className="truncate text-[10.5px] text-slate-600">{user.email}</p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${
                    banned ? "bg-rose-500/15 text-rose-400" : user.role === "SUPER_ADMIN" ? "bg-blue-500/15 text-blue-300" : "bg-white/[0.06] text-slate-300"
                  }`}
                >
                  {banned ? "Suspended" : user.role.replace("_", " ")}
                </span>

                <span className="text-[12px] text-slate-400">{user._count.listings}</span>
                <span className="text-[11.5px] text-slate-500">{formatDate(user.createdAt)}</span>

                <form action={adminSetUserActive} className="justify-self-end">
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="active" value={banned ? "1" : "0"} />
                  <button
                    type="submit"
                    className={`rounded-md border px-2.5 py-1 text-[10.5px] font-medium transition-colors ${
                      banned
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                        : "border-white/[0.08] text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                    }`}
                  >
                    {banned ? "Reinstate" : "Suspend"}
                  </button>
                </form>
              </div>
            );
          })}

          {users.length === 0 && (
            <p className="px-5 py-10 text-center text-[12.5px] text-slate-500">No users yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
