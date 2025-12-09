import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

export const APP_ROUTES: Routes = [
  {
    path: "",
    redirectTo: "users",
    pathMatch: "full",
  },
  {
    path: "users",
    loadChildren: () => import("./modules/user/user.routes"),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
