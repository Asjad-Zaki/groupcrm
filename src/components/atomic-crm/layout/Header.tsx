import {
  FileText,
  Import,
  Settings,
  User,
  Users,
  ChevronDown,
  MessageSquare,
  Megaphone,
  Video,
  Building2,
  Activity,
  ShieldCheck,
  Keyboard,
} from "lucide-react";
import { CanAccess, useTranslate, useUserMenu } from "ra-core";
import { Link, matchPath, useLocation } from "react-router";
import { RefreshButton } from "@/components/admin/refresh-button";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { UserMenu } from "@/components/admin/user-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanySwitcher } from "./CompanySwitcher";
import { WorktimeTrackerWidget } from "./WorktimeTrackerWidget";

import { useConfigurationContext } from "../root/ConfigurationContext";
import { ImportPage } from "../misc/ImportPage";
import { ChangelogPage } from "../misc/ChangelogPage";
import { GlobalSearchButton } from "../search/GlobalSearchButton";

const Header = () => {
  const { darkModeLogo, lightModeLogo, title } = useConfigurationContext();
  const location = useLocation();
  const translate = useTranslate();

  let currentPath: string | boolean = "/";
  if (matchPath("/", location.pathname)) {
    currentPath = "/";
  } else if (matchPath("/my-day/*", location.pathname)) {
    currentPath = "/my-day";
  } else if (matchPath("/deals/*", location.pathname)) {
    currentPath = "/deals";
  } else if (matchPath("/projects/*", location.pathname)) {
    currentPath = "/projects";
  } else if (matchPath("/quotes/*", location.pathname)) {
    currentPath = "/quotes";
  } else if (matchPath("/invoices/*", location.pathname)) {
    currentPath = "/invoices";
  } else if (matchPath("/feed/*", location.pathname)) {
    currentPath = "/feed";
  } else if (matchPath("/meetings/*", location.pathname)) {
    currentPath = "/meetings";
  } else if (matchPath("/messages/*", location.pathname)) {
    currentPath = "/messages";
  } else if (matchPath("/companies/*", location.pathname)) {
    currentPath = "/companies";
  } else if (matchPath("/contacts/*", location.pathname)) {
    currentPath = "/contacts";
  } else if (matchPath("/performance/*", location.pathname)) {
    currentPath = "/performance";
  } else if (matchPath("/portals/*", location.pathname)) {
    currentPath = "/portals";
  } else {
    currentPath = false;
  }

  const moreTabs = [
    {
      label: "Messages",
      to: "/messages",
      match: "/messages",
      icon: MessageSquare,
    },
    { label: "Feed", to: "/feed", match: "/feed", icon: Megaphone },
    { label: "Meetings", to: "/meetings", match: "/meetings", icon: Video },
    {
      label: translate("resources.companies.name", { smart_count: 2 }),
      to: "/companies",
      match: "/companies",
      icon: Building2,
    },
    {
      label: translate("resources.contacts.name", { smart_count: 2 }),
      to: "/contacts",
      match: "/contacts",
      icon: Users,
    },
    {
      label: "Performance",
      to: "/performance",
      match: "/performance",
      icon: Activity,
    },
    { label: "Portals", to: "/portals", match: "/portals", icon: ShieldCheck },
  ];

  const activeMoreItem = moreTabs.find((item) => currentPath === item.match);
  const isMoreActive = Boolean(activeMoreItem);

  return (
    <>
      <nav className="grow w-full overflow-hidden">
        <header className="bg-secondary border-b border-border/40 w-full">
          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4">
            <div className="flex justify-between items-center h-14 gap-2">
              <Link
                to="/"
                className="flex items-center gap-2 text-secondary-foreground no-underline shrink-0"
              >
                <img
                  className="[.light_&]:hidden h-6 w-auto shrink-0"
                  src={darkModeLogo}
                  alt={title}
                />
                <img
                  className="[.dark_&]:hidden h-6 w-auto shrink-0"
                  src={lightModeLogo}
                  alt={title}
                />
                <h1 className="text-base sm:text-lg font-bold shrink-0 hidden md:inline-block tracking-tight">
                  {title}
                </h1>
              </Link>

              <div className="flex-1 flex justify-center min-w-0 px-1">
                <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <NavigationTab
                    label={translate("ra.page.dashboard")}
                    to="/"
                    isActive={currentPath === "/"}
                  />
                  <NavigationTab
                    label="My Day"
                    to="/my-day"
                    isActive={currentPath === "/my-day"}
                  />
                  <NavigationTab
                    label={translate("resources.deals.name", {
                      smart_count: 2,
                    })}
                    to="/deals"
                    isActive={currentPath === "/deals"}
                  />
                  <NavigationTab
                    label="Projects"
                    to="/projects"
                    isActive={currentPath === "/projects"}
                  />
                  <NavigationTab
                    label="Quotes"
                    to="/quotes"
                    isActive={currentPath === "/quotes"}
                  />
                  <NavigationTab
                    label="Invoices"
                    to="/invoices"
                    isActive={currentPath === "/invoices"}
                  />

                  {/* Responsive More Dropdown for Secondary Modules */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={`px-2 sm:px-2.5 py-1.5 text-xs xl:px-3 xl:py-2 xl:text-sm font-medium transition-colors border-b-2 flex items-center gap-1 cursor-pointer focus:outline-none whitespace-nowrap shrink-0 ${
                        isMoreActive
                          ? "text-secondary-foreground border-secondary-foreground font-semibold"
                          : "text-secondary-foreground/70 border-transparent hover:text-secondary-foreground/80"
                      }`}
                    >
                      <span>
                        {activeMoreItem ? activeMoreItem.label : "More"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-1 z-50">
                      {moreTabs.map((item) => {
                        const Icon = item.icon;
                        const isItemActive = currentPath === item.match;
                        return (
                          <DropdownMenuItem
                            key={item.to}
                            className={`cursor-pointer rounded-md ${
                              isItemActive
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-foreground hover:bg-muted"
                            }`}
                            render={
                              <Link
                                to={item.to}
                                className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs"
                              />
                            }
                          >
                            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span>{item.label}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </nav>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <WorktimeTrackerWidget />
                <div className="hidden 2xl:block">
                  <GlobalSearchButton />
                </div>
                <div className="2xl:hidden">
                  <GlobalSearchButton variant="icon" />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("groupcrm:open-shortcuts"),
                    )
                  }
                  className="p-1.5 sm:p-2 rounded-lg text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary/60 transition-colors focus:outline-none"
                  title="Keyboard Shortcuts (?)"
                  aria-label="Keyboard shortcuts"
                >
                  <Keyboard className="w-4 h-4" />
                </button>
                <ThemeModeToggle />
                <RefreshButton />
                <CompanySwitcher />
                <UserMenu>
                  <ProfileMenu />
                  <CanAccess resource="sales" action="list">
                    <UsersMenu />
                  </CanAccess>
                  <CanAccess resource="configuration" action="edit">
                    <SettingsMenu />
                  </CanAccess>
                  <ImportFromJsonMenuItem />
                  <ChangelogMenuItem />
                </UserMenu>
              </div>
            </div>
          </div>
        </header>
      </nav>
    </>
  );
};

const NavigationTab = ({
  label,
  to,
  isActive,
}: {
  label: string;
  to: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={`px-2 sm:px-2.5 py-1.5 text-xs xl:px-3 xl:py-2 xl:text-sm font-medium transition-colors border-b-2 whitespace-nowrap shrink-0 ${
      isActive
        ? "text-secondary-foreground border-secondary-foreground font-semibold"
        : "text-secondary-foreground/70 border-transparent hover:text-secondary-foreground/80"
    }`}
  >
    {label}
  </Link>
);

const UsersMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<UsersMenu> must be used inside <UserMenu?");
  }
  return (
    <DropdownMenuItem
      onClick={userMenuContext.onClose}
      render={<Link to="/sales" className="flex items-center gap-2" />}
    >
      <Users />
      {translate("resources.sales.name", { smart_count: 2 })}
    </DropdownMenuItem>
  );
};

const ProfileMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<ProfileMenu> must be used inside <UserMenu?");
  }
  return (
    <DropdownMenuItem
      onClick={userMenuContext.onClose}
      render={<Link to="/profile" className="flex items-center gap-2" />}
    >
      <User />
      {translate("crm.profile.title")}
    </DropdownMenuItem>
  );
};

const SettingsMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<SettingsMenu> must be used inside <UserMenu>");
  }
  return (
    <DropdownMenuItem
      onClick={userMenuContext.onClose}
      render={<Link to="/settings" className="flex items-center gap-2" />}
    >
      <Settings />
      {translate("crm.settings.title")}
    </DropdownMenuItem>
  );
};

const ImportFromJsonMenuItem = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<ImportFromJsonMenuItem> must be used inside <UserMenu>");
  }
  return (
    <DropdownMenuItem
      onClick={userMenuContext.onClose}
      render={<Link to={ImportPage.path} className="flex items-center gap-2" />}
    >
      <Import />
      {translate("crm.header.import_data")}
    </DropdownMenuItem>
  );
};

const ChangelogMenuItem = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<ChangelogMenuItem> must be used inside <UserMenu>");
  }
  return (
    <DropdownMenuItem
      onClick={userMenuContext.onClose}
      render={
        <Link to={ChangelogPage.path} className="flex items-center gap-2" />
      }
    >
      <FileText />
      {translate("crm.changelog.title")}
    </DropdownMenuItem>
  );
};
export default Header;
