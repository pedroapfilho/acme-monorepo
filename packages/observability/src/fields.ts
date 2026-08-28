import "evlog";

declare module "evlog" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires `interface`, not `type`
  interface BaseWideEvent {
    plan?: string;
    requestId?: string;
    route?: string;
    tenantId?: string;
    userId?: string;
  }
}
