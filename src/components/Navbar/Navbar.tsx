"use client";

import { ScrollArea } from "@mantine/core";
import { UserButton } from "@/components/UserButton/UserButton";
import { useAuth } from "@/contexts/auth-context";
import type { NavItem } from "@/types/nav-item";
import { NavLinksGroup } from "./NavLinksGroup";
import classes from "./Navbar.module.css";

interface Props {
  data: NavItem[];
  hidden?: boolean;
}

export function Navbar({ data }: Props) {
  const { user } = useAuth();

  const visibleItems = data.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const links = visibleItems.map((item) => (
    <NavLinksGroup key={item.label} {...item} />
  ));

  return (
    <>
      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton
          name={user?.full_name ?? ""}
          email={user?.email ?? ""}
        />
      </div>
    </>
  );
}
