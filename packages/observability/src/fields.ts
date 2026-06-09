import "evlog";

// evlog augments app-specific top-level wide-event fields via `BaseWideEvent`
// (there is no `LogFields` interface in evlog 2.18.1). Augmenting it makes these
// keys type-checked on `log.set(...)` / `useLogger().set(...)` across the fleet.
declare module "evlog" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires `interface`, not `type`
  interface BaseWideEvent {
    userId?: string;
    requestId?: string;
    route?: string;
    plan?: string;
    tenantId?: string;
  }
}
