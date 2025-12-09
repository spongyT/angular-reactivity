import { Component, inject, OnInit } from "@angular/core";
import { User, UserService } from "@app/modules/user/user.service";
import { MatButton } from "@angular/material/button";
import { Router } from "@angular/router";

@Component({
  selector: "app-user-list",
  imports: [MatButton],
  templateUrl: "./user-list.component.html",
  styleUrl: "./user-list.component.css",
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  users: User[] = [];

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (response) => (this.users = response),
      error: (err) => {
        // FIXME handle error
        console.error(err);
      },
    });
  }

  protected navigateToUser(user: User) {
    this.router.navigate([`users/${user.id}`]);
  }
}
