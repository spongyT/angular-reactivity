import { Routes } from "@angular/router";
import { UserListComponent } from "./user-list/user-list.component";
import { UserDetailComponent } from "./user-detail/user-detail.component";

export default [
  {
    path: "",
    children: [
      {
        path: "",
        title: "Benutzerübersicht",
        component: UserListComponent,
      },
      {
        path: ":userId",
        title: "Benutzer",
        component: UserDetailComponent,
      },
    ],
  },
] satisfies Routes;
