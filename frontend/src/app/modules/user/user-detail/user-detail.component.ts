import { Component, inject, OnInit } from "@angular/core";
import { User, UserService } from "@app/modules/user/user.service";
import { ActivatedRoute } from "@angular/router";
import { JsonPipe } from "@angular/common";

@Component({
  selector: "app-user-detail",
  imports: [JsonPipe],
  templateUrl: "./user-detail.component.html",
  styleUrl: "./user-detail.component.css",
})
export class UserDetailComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly activatedRoute = inject(ActivatedRoute);

  user: User | undefined;

  ngOnInit(): void {
    this.userService
      .getUserById(this.activatedRoute.snapshot.params["userId"])
      .subscribe({
        next: (response) => (this.user = response),
        error: (err) => {
          // FIXME handle error
          console.error(err);
        },
      });
  }
}
