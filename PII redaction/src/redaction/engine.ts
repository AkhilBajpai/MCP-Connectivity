interface RedactionRule {
  label: string;
  pattern: RegExp;
}

interface RedactionResult {
  text: string;
  replacements: Map<string, string>;
}

const RULES: RedactionRule[] = [
  { label: "EMAIL", pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { label: "PHONE", pattern: /(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/g },
  { label: "SSN", pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { label: "CREDIT_CARD", pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
  { label: "IP_V4", pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
  { label: "AWS_KEY", pattern: /\b(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/g },
];

export class RedactionEngine {
  private counters: Map<string, number> = new Map();
  private vault: Map<string, string> = new Map();

  private nextPlaceholder(label: string): string {
    const count = (this.counters.get(label) ?? 0) + 1;
    this.counters.set(label, count);
    return `[${label}_${count}]`;
  }

  redact(input: string): RedactionResult {
    let output = input;
    const replacements = new Map<string, string>();

    for (const rule of RULES) {
      output = output.replace(rule.pattern, (match) => {
        const existing = this.vault.get(match);
        if (existing) {
          replacements.set(existing, match);
          return existing;
        }
        const placeholder = this.nextPlaceholder(rule.label);
        this.vault.set(match, placeholder);
        replacements.set(placeholder, match);
        return placeholder;
      });
    }

    return { text: output, replacements };
  }

  // For downstream services that need the original value back
  rehydrate(redacted: string): string {
    let output = redacted;
    for (const [original, placeholder] of this.vault.entries()) {
      output = output.replaceAll(placeholder, original);
    }
    return output;
  }

  reset(): void {
    this.counters.clear();
    this.vault.clear();
  }
}
