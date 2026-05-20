# lesson-091 — findings

PDF pages: 192–193

## Issues

### Ten Commandments list collapsed into single paragraph
- **Type:** structural drift
- **Line:** 10
- **Markdown says:** `— The commandments of God are these ten: 1. I am the Lord thy God; thou shalt not have strange gods before Me. 2. Thou shalt not take the name of the Lord thy God in vain. 3. Remember thou keep holy the Lord's day. 4. Honour thy father and thy mother. 5. Thou shalt not kill. 6. Thou shalt not commit adultery. 7. Thou shalt not steal. 8. Thou shalt not bear false witness against thy neighbour. 9. Thou shalt not covet thy neighbour's wife. 10. Thou shalt not covet thy neighbour's goods.`
- **PDF says:** Each commandment is a separate numbered paragraph: "1. I am the Lord thy God; thou shalt not / have strange gods before Me." / "2. Thou shalt not take the name of the Lord / thy God in vain." … through 10, each on its own line.
- **Suggested fix:** Break into a numbered list (each commandment its own line), matching the PDF's typeset layout:

```
1. I am the Lord thy God; thou shalt not have strange gods before Me.
2. Thou shalt not take the name of the Lord thy God in vain.
3. Remember thou keep holy the Lord's day.
4. Honour thy father and thy mother.
5. Thou shalt not kill.
6. Thou shalt not commit adultery.
7. Thou shalt not steal.
8. Thou shalt not bear false witness against thy neighbour.
9. Thou shalt not covet thy neighbour's wife.
10. Thou shalt not covet thy neighbour's goods.
```
