import { OPERATE_SERVICES, type OperateService } from "../../content/operate-services";

// Descriptions are approved with their service. A line only shows one by naming an approved service.
export function approvedService(name: string): OperateService | undefined {
  const key = name.trim();
  return OPERATE_SERVICES.find((service) => service.name === key);
}

export function serviceDescription(name: string): string {
  return approvedService(name)?.description ?? "";
}
