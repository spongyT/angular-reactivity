import { EMPTY, Observable, of, Subject } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { LoadingState } from "../models/loading-state-enum";

export const trackLoadingState =
  <T>(
    loadingStateSubject: Subject<LoadingState>,
  ): ((source: Observable<T>) => Observable<T>) =>
  (source: Observable<T>) =>
    of({}).pipe(
      tap(() => loadingStateSubject.next(LoadingState.LOADING)),
      switchMap(() =>
        source.pipe(
          tap({
            next: () => loadingStateSubject.next(LoadingState.LOADED),
            error: () => loadingStateSubject.next(LoadingState.ERROR),
          }),
        ),
      ),
    );

export const catchErrorWithEmpty =
  <T>(): ((source: Observable<T>) => Observable<T>) =>
  (source) =>
    source.pipe(
      catchError((err) => {
        console.error(err);
        return EMPTY;
      }),
    );
