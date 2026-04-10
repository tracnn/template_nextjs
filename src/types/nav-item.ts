import type { TablerIconsProps } from "@tabler/icons-react";
import type { ReactElement } from "react";

export interface NavItem {
  label: string;
  icon: (props: TablerIconsProps) => ReactElement;
  link?: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  roles?: string[];
}
