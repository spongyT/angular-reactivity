import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, Input } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { Navigation } from "./../../models/navigation";
import { AsyncPipe } from "@angular/common";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { MatListItem, MatNavList } from "@angular/material/list";
import { MatToolbar } from "@angular/material/toolbar";
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from "@angular/material/sidenav";

@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.css"],
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatToolbar,
    MatNavList,
    MatListItem,
    RouterLinkActive,
    RouterLink,
    MatIcon,
    MatSidenavContent,
    MatIconButton,
    RouterOutlet,
    AsyncPipe,
  ],
})
export class NavigationComponent {
  @Input() menu: Navigation[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    public titleService: Title,
  ) {}
}
