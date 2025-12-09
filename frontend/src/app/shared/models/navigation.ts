import { NavItem } from "./nav-item";

export interface Navigation {
  title: string;
  path?: string;
  open?: boolean;
  childrens?: NavItem[];
}
