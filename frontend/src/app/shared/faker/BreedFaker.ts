import { Breed, BreedPage } from "../shared/models/breed";

export function fakeBreedPage(): BreedPage {
  return {
    data: [fakeBreed()],
  };
}

export function fakeBreed(patch?: Partial<Breed>): Breed {
  return {
    breed: "Rainbow-Cat",
    pattern: "Rainbow",
    country: "Space",
    coat: "colorful",
    origin: "Candyland",
    ...patch,
  };
}
