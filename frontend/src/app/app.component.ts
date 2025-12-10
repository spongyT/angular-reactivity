import { Component } from "@angular/core";
import { Navigation } from "./shared/models/navigation";
import { NavigationComponent } from "./shared/components/navigation/navigation.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  imports: [NavigationComponent],
})
export class AppComponent {
  concepts: Navigation[] = [
    {
      title: "Benutzerverwaltung",
      path: "users",
      // FIXME cleanup
      // childrens: [
      //   { title: "Benutzerübersicht", path: "users" },
      //   { title: "Smart & Dumb Konzept 👍", path: "smart-dumb/with-concept" },
      // ],
    },
  ];
}
