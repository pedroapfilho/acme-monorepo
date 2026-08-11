import "evlog";

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
