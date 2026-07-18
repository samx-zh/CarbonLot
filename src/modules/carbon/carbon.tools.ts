import { ToolDecorator as Tool, ExecutionContext } from '@nitrostack/core';

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

function loadJSON(file: string) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../../data', file), 'utf-8'));
}

export class CarbonTools {

  @Tool({
    name: 'validate_cn_code',
    description: 'Checks whether a shipment\'s CN code falls within CBAM scope',
    inputSchema: z.object({ shipmentId: z.string() })
  })
  async validateCnCode(input: { shipmentId: string }) {
    const shipments = loadJSON('shipments.json');
    const factors = loadJSON('emission_factors.json');

    const shipment = shipments.find((s: any) => s.shipmentId === input.shipmentId);
    if (!shipment) return { error: 'Shipment not found' };

    const factorEntry = factors.find((f: any) => f.cnCode === shipment.cnCode);
    return {
      shipmentId: input.shipmentId,
      cnCode: shipment.cnCode,
      material: shipment.material,
      cbam_covered: !!factorEntry
    };
  }

  @Tool({
    name: 'lookup_emission_factor',
    description: 'Checks if the shipment\'s supplier has reported actual emissions, or if EU default must be used',
    inputSchema: z.object({ shipmentId: z.string() })
  })
  async lookupEmissionFactor(input: { shipmentId: string }) {
    const shipments = loadJSON('shipments.json');
    const suppliers = loadJSON('suppliers.json');
    const factors = loadJSON('emission_factors.json');

    const shipment = shipments.find((s: any) => s.shipmentId === input.shipmentId);
    const supplier = suppliers.find((s: any) => s.supplierId === shipment.supplierId);

    if (supplier) {
      return {
        source: 'verified_supplier_data',
        supplierId: supplier.supplierId,
        company: supplier.company,
        reportedEmission_kgCO2_per_kg: supplier.reportedEmission
      };
    }

    const factorEntry = factors.find((f: any) => f.cnCode === shipment.cnCode);
    return {
      source: 'eu_default_fallback',
      default_factor_kgCO2_per_kg: factorEntry?.emissionFactor,
      material: factorEntry?.material
    };
  }

  @Tool({
    name: 'calculate_emissions',
    description: 'Calculates total embedded emissions (kg CO2e) for a shipment',
    inputSchema: z.object({ shipmentId: z.string() })
  })
  async calculateEmissions(input: { shipmentId: string }) {
    const shipments = loadJSON('shipments.json');
    const suppliers = loadJSON('suppliers.json');
    const factors = loadJSON('emission_factors.json');

    const shipment = shipments.find((s: any) => s.shipmentId === input.shipmentId);
    const supplier = suppliers.find((s: any) => s.supplierId === shipment.supplierId);

    let totalEmissions: number;
    let source: string;
    let factorUsed: number;

    if (supplier) {
      factorUsed = supplier.reportedEmission;
      source = 'verified_supplier_data';
    } else {
      const factorEntry = factors.find((f: any) => f.cnCode === shipment.cnCode);
      factorUsed = factorEntry?.emissionFactor || 0;
      source = 'eu_default_fallback';
    }

    totalEmissions = factorUsed * shipment.quantity;

    return {
      shipmentId: input.shipmentId,
      material: shipment.material,
      quantity_kg: shipment.quantity,
      factor_used_kgCO2_per_kg: factorUsed,
      total_emissions_kgCO2e: Number(totalEmissions.toFixed(2)),
      source
    };
  }

  @Tool({
    name: 'generate_declaration',
    description: 'Builds the final CBAM declaration document for a shipment',
    inputSchema: z.object({ shipmentId: z.string() })
  })
  async generateDeclaration(input: { shipmentId: string }) {
    const shipments = loadJSON('shipments.json');
    const shipment = shipments.find((s: any) => s.shipmentId === input.shipmentId);
    const emissions = await this.calculateEmissions(input);

    return {
      declarationId: `DECL-${input.shipmentId}`,
      shipment,
      emissions,
      generatedAt: new Date().toISOString(),
      status: emissions.source === 'verified_supplier_data' ? 'compliant' : 'needs_review'
    };
  }
}