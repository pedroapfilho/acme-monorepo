import "evlog";

// Augment evlog's BaseWideEvent (no LogFields in 2.18.1) for typed log.set() across apps.
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
