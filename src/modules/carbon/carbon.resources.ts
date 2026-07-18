import { ResourceDecorator as Resource } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';

export class CarbonResources {

  @Resource({
    uri: 'data://shipments',
    name: 'Shipments',
    description: 'All shipment records with CN code, quantity, supplier, and origin',
    mimeType: 'application/json'
  })
  async getShipments(uri: string) {
    const data = fs.readFileSync(path.join(__dirname, '../../data/shipments.json'), 'utf-8');
    return { contents: [{ uri, mimeType: 'application/json', text: data }] };
  }

  @Resource({
    uri: 'data://suppliers',
    name: 'Suppliers',
    description: 'Supplier details including reported emissions, price, delivery time, and rating',
    mimeType: 'application/json'
  })
  async getSuppliers(uri: string) {
    const data = fs.readFileSync(path.join(__dirname, '../../data/suppliers.json'), 'utf-8');
    return { contents: [{ uri, mimeType: 'application/json', text: data }] };
  }

  @Resource({
    uri: 'data://emission-factors',
    name: 'Emission Factors',
    description: 'CBAM default emission factors per CN code, used when supplier data is unavailable',
    mimeType: 'application/json'
  })
  async getEmissionFactors(uri: string) {
    const data = fs.readFileSync(path.join(__dirname, '../../data/emission_factors.json'), 'utf-8');
    return { contents: [{ uri, mimeType: 'application/json', text: data }] };
  }
}