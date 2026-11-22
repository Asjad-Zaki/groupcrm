import { Children, useCallback, useState } from "react";
import {
  Translate,
  useAuthProvider,
  useGetIdentity,
  useLogout,
  UserMenuContext,
} from "ra-core";
import { LogOut, UserCheck, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "@/components/atomic-crm/providers/fakerest/dataGenerator/sales";

export type UserMenuProps = {
  children?: React.ReactNode;
};

/**
 * A user menu component displayed in the top right corner of the admin layout.
 *
 * Provides access to user-related actions such as profile, settings, and logout.
 * Displays the user's avatar, role badge, company tags, and includes a quick Switch Persona selector.
 */
export function UserMenu({ children }: UserMenuProps) {
  const authProvider = useAuthProvider();
  const { data: identity } = useGetIdentity();
  const logout = useLogout();

  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSwitchPersona = async (email: string) => {
    if (authProvider) {
      try {
        await authProvider.login({ email, password: "demo" });
        window.location.hash = "#/";
        window.location.reload();
      } catch (err) {
        console.error("Failed to switch persona:", err);
      }
    }
  };

  if (!authProvider) return null;

  interface UserIdentityData {
    role?: string;
    title?: string;
    tenants?: string[];
  }

  const customIdentity = identity as UserIdentityData | undefined;
  const currentRole = customIdentity?.role || "Employee";
  const currentTitle = customIdentity?.title;
  const currentTenants = customIdentity?.tenants;

  return (
    <UserMenuContext.Provider value={{ onClose: handleClose }}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="relative h-8 w-8 ml-2 rounded-full ring-1 ring-amber-500/30 hover:ring-amber-500/60 transition"
            />
          }
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={identity?.avatar} role="presentation" />
            <AvatarFallback className="bg-amber-500/20 text-amber-300 font-semibold text-xs">
              {identity?.fullName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 py-1">
                <p className="text-sm font-semibold leading-none text-foreground flex items-center gap-1.5">
                  {identity?.fullName || "Employee"}
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {currentRole}
                </p>
                {currentTitle && (
                  <p className="text-[11px] text-muted-foreground/80 line-clamp-1">
                    {currentTitle}
                  </p>
                )}
                {/* Operating Entity Badges */}
                <div className="flex items-center gap-1 pt-1.5">
                  {!currentTenants || currentTenants.length === 3 ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      All Entities (GL · AT · CV)
                    </span>
                  ) : (
                    currentTenants.map((tid) => {
                      if (tid === "goldland")
                        return (
                          <span
                            key={tid}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/30"
                          >
                            GL
                          </span>
                        );
                      if (tid === "abbadi")
                        return (
                          <span
                            key={tid}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-600/30"
                          >
                            AT
                          </span>
                        );
                      if (tid === "casavera")
                        return (
                          <span
                            key={tid}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/30"
                          >
                            CV
                          </span>
                        );
                      return null;
                    })
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {children}
          {Children.count(children) > 0 && <DropdownMenuSeparator />}

          {/* Quick Persona Switcher Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer gap-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>Switch Employee Persona</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64 max-h-80 overflow-y-auto">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Executive & Operations
              </DropdownMenuLabel>
              {TEAM_MEMBERS.slice(0, 10).map((m) => (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => handleSwitchPersona(m.email)}
                  className="cursor-pointer flex items-center justify-between py-1.5"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">
                      {m.first_name} {m.last_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {m.role_name}
                    </span>
                  </div>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {m.tenant_ids?.length === 3
                      ? "ALL"
                      : m.tenant_ids?.[0]?.slice(0, 2).toUpperCase()}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Design & Sales
              </DropdownMenuLabel>
              {TEAM_MEMBERS.slice(10).map((m) => (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => handleSwitchPersona(m.email)}
                  className="cursor-pointer flex items-center justify-between py-1.5"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">
                      {m.first_name} {m.last_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {m.role_name}
                    </span>
                  </div>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {m.tenant_ids?.length === 3
                      ? "ALL"
                      : m.tenant_ids?.[0]?.slice(0, 2).toUpperCase()}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logout()}
            className="cursor-pointer text-red-400 focus:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <Translate i18nKey="ra.auth.logout">Log out</Translate>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </UserMenuContext.Provider>
  );
}
