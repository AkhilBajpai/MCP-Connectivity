import { RedactionEngine } from "../engine";

describe("RedactionEngine", () => {
  let engine: RedactionEngine;

  beforeEach(() => {
    engine = new RedactionEngine();
  });

  it("replaces email addresses with placeholders", () => {
    const result = engine.redact("Contact support@acme.com for details");
    expect(result.text).toBe("Contact [EMAIL_1] for details");
    expect(result.replacements.get("[EMAIL_1]")).toBe("support@acme.com");
  });

  it("replaces phone numbers", () => {
    const result = engine.redact("Call (555) 123-4567 now");
    expect(result.text).toContain("[PHONE_1]");
  });

  it("replaces SSNs", () => {
    const result = engine.redact("SSN: 123-45-6789");
    expect(result.text).toBe("SSN: [SSN_1]");
  });

  it("deduplicates repeated values", () => {
    const result = engine.redact("a@b.com and a@b.com");
    expect(result.text).toBe("[EMAIL_1] and [EMAIL_1]");
  });

  it("rehydrates placeholders back to originals", () => {
    const result = engine.redact("Contact support@acme.com");
    const restored = engine.rehydrate(result.text);
    expect(restored).toBe("Contact support@acme.com");
  });
});
