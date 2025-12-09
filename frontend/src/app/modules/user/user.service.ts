import { inject, Injectable } from "@angular/core";
import { delay, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { tap } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly matSnackBar = inject(MatSnackBar);
  private readonly userBaseUrl = environment.userBaseUrl;

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userBaseUrl}/users`).pipe(delay(1000));
  }

  getUserById(userId: number): Observable<User> {
    return this.http
      .get<User>(`${this.userBaseUrl}/users/${userId}`)
      .pipe(delay(1000));
  }

  updateUser(userId: number, update: UserUpdate) {
    this.matSnackBar.open("Änderungen werden gespeichert...");
    return this.http
      .put<void>(`${this.userBaseUrl}/users/${userId}`, update)
      .pipe(
        delay(1000),
        tap({
          next: () => this.matSnackBar.open("Erfolgreich gespeichert"),
          error: (err) =>
            this.matSnackBar.open(
              `Fehler beim speichern: ${JSON.stringify(err)}`,
            ),
        }),
      );
  }
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
}

export interface UserUpdate {
  firstName: string;
  lastName: string;
}
