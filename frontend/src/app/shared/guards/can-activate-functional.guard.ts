import { inject } from "@angular/core";
import { LoginService } from "./../services/login.service";

export const CanActivateFunctionGuard = () => {
  const service = inject(LoginService);
  // hier könnte ich natürlich auch mit Observables arbeiten ;)
  return service.isLoggedIn();
};
