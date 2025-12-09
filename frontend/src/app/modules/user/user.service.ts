import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly userBaseUrl = environment.userBaseUrl;

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userBaseUrl}/users`);
  }

  getUserById(userid: number): Observable<User> {
    return this.http.get<User>(`${this.userBaseUrl}/users/${userid}`);
  }
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
}
