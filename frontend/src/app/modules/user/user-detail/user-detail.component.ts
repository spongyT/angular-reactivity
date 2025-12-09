import {
  Component,
  effect,
  inject,
  input,
  numberAttribute,
  Resource,
  Signal,
} from "@angular/core";
import { User } from "@app/modules/user/user.service";
import { JsonPipe } from "@angular/common";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatInput } from "@angular/material/input";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { UserDetailStore } from "@app/modules/user/user-detail/user-detail.store";

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
  providers: [UserDetailStore],
})
export class UserDetailComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly userDetailStore = inject(UserDetailStore);

  readonly form: FormGroup<UserForm> = this.createFormGroup();

  readonly title: Signal<string> = this.userDetailStore.title;
  readonly userId: Signal<number> = input.required({
    transform: numberAttribute,
  });
  readonly userResource: Resource<User | undefined> =
    this.userDetailStore.userResource;

  constructor() {
    this.userDetailStore.updateUserId(this.userId);
    effect(() => {
      if (this.userResource.hasValue()) {
        this.form.setValue({
          firstName: this.userResource.value().firstName,
          lastName: this.userResource.value().lastName,
        });
        this.form.markAsPristine();
      }
    });
  }

  reload(): void {
    this.userDetailStore.reload();
  }

  onSubmitClicked(): void {
    if (!this.form.valid) {
      return;
    }

    this.saveFormData();
  }

  private createFormGroup(): FormGroup<UserForm> {
    return this.fb.group({ firstName: "", lastName: "" });
  }

  private saveFormData() {
    this.userDetailStore.updateUser(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.markAsPristine();
      },
      error: console.error,
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
