import { CatFactService } from "@app/shared/services/cat-fact.service";
import { MockCatFactService } from "@app/shared/services/mock-cat-fact.service";
import { NgModule } from "@angular/core";

@NgModule({
  providers: [{ provide: CatFactService, useClass: MockCatFactService }],
  imports: [],
})
/**
 * Module that provides Mock-Implementations for all services.
 * Purpose of this module is either use in Unit-Tests or for local development purposes
 */
export class MockRequestServicesModule {}
