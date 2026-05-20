# lesson-045 — findings

PDF pages: 98–99

## Issues

### Answer and numbered point 1 merged into one paragraph (sloth section)
- **Type:** structural drift
- **Line:** 48
- **Markdown says:** "— The virtues of diligence and zeal are opposed to sloth. 1. From the days of Adam work has been laid as an obligation on men..."
- **PDF says:** The answer "The virtues of diligence and zeal are opposed to sloth." is its own standalone paragraph; then "1. From the days of Adam..." begins as a new paragraph.
- **Suggested fix:** Split into two separate paragraphs — answer paragraph ends after "opposed to sloth." and point 1 starts on its own line: `\n\n1. From the days of Adam...`
