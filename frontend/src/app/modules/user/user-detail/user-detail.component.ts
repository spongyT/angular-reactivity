import { Component, inject, OnInit } from "@angular/core";
import { User, UserService } from "@app/modules/user/user.service";
import { ActivatedRoute } from "@angular/router";
import { JsonPipe } from "@angular/common";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatInput } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-user-detail",
  imports: [
    JsonPipe,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatError,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: "./user-detail.component.html",
  styleUrl: "./user-detail.component.scss",
})
export class UserDetailComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly matSnackBar = inject(MatSnackBar);

  title: string = "Benutzerdaten werden geladen";
  user: User | undefined;
  isLoading: boolean = false;
  error: Object | undefined = false;
  form: FormGroup<UserForm> = this.createFormGroup();
  userId!: number;

  ngOnInit(): void {
    this.userId = this.activatedRoute.snapshot.params["userId"] as number;
    this.loadUser();
  }

  reload(): void {
    this.loadUser();
  }

  onSubmitClicked(): void {
    if (!this.form.valid) {
      return;
    }

    this.saveFormData();
  }

  private loadUser() {
    this.title = "Benutzerdaten werden geladen";
    this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        this.title = `Benutzer: ${response.firstName} ${response.lastName}`;
        this.isLoading = false;
        this.user = response;
        this.form.setValue({
          firstName: response.firstName,
          lastName: response.lastName,
        });
      },
      error: (err) => {
        this.title = `Fehler beim Laden des Benutzers`;
        this.isLoading = false;
        this.error = err;
      },
    });
  }

  private createFormGroup(): FormGroup<UserForm> {
    return this.fb.group({ firstName: "", lastName: "" });
  }

  private saveFormData() {
    this.userService
      .updateUser(this.userId, this.form.getRawValue())
      .subscribe({
        next: () => {
          this.form.markAsPristine();
          this.matSnackBar.open("Erfolgreich gespeichert");
          this.loadUser();
        },
        error: (err) => {
          this.matSnackBar.open(
            `Fehler beim speichern: ${JSON.stringify(err)}`,
          );
        },
      });
  }
}

interface UserForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
}

interface UserFormData {
  firstName: string;
  lastName: string;
}
