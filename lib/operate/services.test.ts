import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OPERATE_SERVICES } from "../../content/operate-services";
import { approvedService, serviceDescription } from "./services";

describe("approved services", () => {
  it("gives each approved service its own description", () => {
    for (const service of OPERATE_SERVICES) {
      assert.equal(serviceDescription(service.name), service.description);
      assert.equal(serviceDescription(`  ${service.name} `), service.description);
    }
  });

  it("gives any other service no description", () => {
    assert.equal(approvedService("Embedded Design Engineering"), undefined);
    assert.equal(serviceDescription("Embedded Design Engineering"), "");
    assert.equal(serviceDescription("product strategy, product design"), "");
  });
});
