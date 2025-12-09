import {
  signalMethod,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { updateState } from "@angular-architects/ngrx-toolkit";
import { rxResource } from "@angular/core/rxjs-interop";
import { computed, inject } from "@angular/core";
import { UserService, UserUpdate } from "../user.service";
import { tap } from "rxjs/operators";

export const UserDetailStore = signalStore(
  withState({ userId: -1 }),
  withProps(() => ({ _userService: inject(UserService) })),
  withProps((store) => ({
    _userResource: rxResource({
      params: () => store.userId(),
      stream: (params) => store._userService.getUserById(params.params),
    }),
  })),
  withProps((store) => ({
    userResource: store._userResource.asReadonly(),
  })),
  withMethods((store) => ({
    updateUserId: signalMethod<number>((userId: number) =>
      updateState(store, "updateUserId", { userId }),
    ),
    reload: () => store._userResource.reload(),
    updateUser: (update: UserUpdate) => {
      return store._userService.updateUser(store.userId(), update).pipe(
        tap({
          next: () =>
            store._userResource.set({
              id: store.userId(),
              ...update,
            }),
        }),
      );
    },
  })),
  withComputed((store) => ({
    title: computed(() => {
      if (store._userResource.isLoading()) {
        return "Benutzerdaten werden geladen";
      }

      return store._userResource.hasValue()
        ? `Benutzer: ${store._userResource.value().firstName} ${store._userResource.value().lastName}`
        : `Fehler beim Laden des Benutzers`;
    }),
  })),
);
