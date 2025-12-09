import "./polyfills";

import { enableProdMode } from "@angular/core";

import { environment } from "./environments/environment";
import { AppComponent } from "@app/app.component";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideTranslateService } from "@ngx-translate/core";
import { APP_ROUTES } from "@app/app-routing.module";
import { provideRouter, withComponentInputBinding } from "@angular/router";

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideRouter(APP_ROUTES, withComponentInputBinding()),
    provideTranslateService({ useDefaultLang: false }),
  ],
})
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err));
