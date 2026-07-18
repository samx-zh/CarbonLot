# CarbonLot 🌍

**An MCP-native compliance agent for the EU's Carbon Border Adjustment Mechanism (CBAM).**

Since January 2026, Indian steel, aluminium, and other CBAM-covered exporters must report *verified* embedded carbon emissions per shipment to the EU — or get charged a punitive default rate. That data currently lives scattered across shipment records, supplier declarations, and emission-factor tables, making it slow and error-prone to check compliance manually.

CarbonLot fixes this by treating carbon like a traceability problem, not a spreadsheet problem. Ask it "is shipment SHP001 CBAM-ready?" and it looks up the shipment's supplier, checks whether they've reported verified emissions data, falls back transparently to EU default values when they haven't, calculates the total embedded emissions, and drafts a ready-to-use CBAM declaration — all through natural conversation via MCP.

Built for the Manufacturing & Industry 4.0 Track — MCP Hackathon 2026.

## Tech Stack
- [NitroStack](https://nitrostack.ai) (MCP SDK + CLI)
- TypeScript
- Zod (schema validation)
- MCP Resources, Tools

## What It Does

- 🔍 **Validates CN codes** — checks whether a shipment's product code falls within CBAM's regulatory scope
- 📊 **Looks up emission sources** — checks if the shipment's supplier has reported verified emissions, or if EU default values apply
- 🧮 **Calculates embedded emissions** — computes total CO₂e per shipment using verified supplier data where available
- 🚩 **Flags fallback cases transparently** — shipments with unregistered/unreported suppliers are explicitly marked as needing review, not silently defaulted
- 📄 **Generates CBAM declarations** — auto-drafts a structured compliance document per shipment, ready for export documentation

## Project Structure
src/
├── data/
│   ├── shipments.json          # Shipment records (CN code, quantity, supplier, origin)
│   ├── suppliers.json          # Supplier-reported emissions, pricing, delivery data
│   └── emission_factors.json   # EU CBAM default emission factors by CN code
├── modules/
│   └── carbon/
│       ├── carbon.tools.ts       # validate_cn_code, lookup_emission_factor,
│       │                         # calculate_emissions, generate_declaration
│       ├── carbon.resources.ts   # Exposes shipments/suppliers/emission-factors as MCP resources
│       └── carbon.module.ts      # Registers the carbon module
├── app.module.ts                 # Root application module
└── index.ts

## MCP Architecture

**Resources** (data the agent can read):
- `data://shipments` — shipment records
- `data://suppliers` — supplier-reported emissions data
- `data://emission-factors` — CBAM default emission factors per CN code

**Tools** (actions the agent can perform):
- `validate_cn_code(shipmentId)` — checks if a shipment's product falls under CBAM scope
- `lookup_emission_factor(shipmentId)` — determines whether verified supplier data or EU defaults apply
- `calculate_emissions(shipmentId)` — computes total embedded emissions (kg CO2e)
- `generate_declaration(shipmentId)` — builds the final CBAM compliance declaration

## Getting Started
npm install
npm run dev

Then connect via [NitroStudio](https://nitrostack.ai/studio) or your preferred MCP client, and try asking:
> "Is shipment SHP001 CBAM ready?"

## Honest Note on Scope

The emissions and supplier dataset used here is a realistic, hand-modelled sample (not a live ERP/ ecosystem integration) — built to demonstrate the full compliance-agent workflow end-to-end within the hackathon timeframe. Emission factor values should be verified against official CBAM implementing regulation tables before any real-world use.

## Team
Built by 
N Samiksha
Krishna Jayakumar
Kashyap S
Muhanned Jasimkhan JL
for MCP Hackathon 2026.
