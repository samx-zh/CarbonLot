import 'dotenv/config';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';
import * as http from 'http';
import { CarbonTools } from './modules/carbon/carbon.tools.js';
import { CarbonResources } from './modules/carbon/carbon.resources.js';

// Instantiate CarbonTools and CarbonResources directly to service the HTTP endpoints
const carbonTools = new CarbonTools();
const carbonResources = new CarbonResources();

/**
 * Bootstrap the application
 */
async function bootstrap() {
    // Create and start the MCP server
    const server = await McpApplicationFactory.create(AppModule);
    await server.start();

    // Start a lightweight HTTP API on port 3002 for frontend communication
    const httpServer = http.createServer((req, res) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    let result: any = null;
                    if (req.url === '/api/validate_cn_code') {
                        result = await carbonTools.validateCnCode(parsed);
                    } else if (req.url === '/api/calculate_emissions') {
                        result = await carbonTools.calculateEmissions(parsed);
                    } else if (req.url === '/api/generate_declaration') {
                        result = await carbonTools.generateDeclaration(parsed);
                    } else if (req.url === '/api/get_shipments') {
                        const resourceResult = await carbonResources.getShipments('data://shipments');
                        result = JSON.parse(resourceResult.contents[0].text);
                    } else if (req.url === '/api/get_suppliers') {
                        const resourceResult = await carbonResources.getSuppliers('data://suppliers');
                        result = JSON.parse(resourceResult.contents[0].text);
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Not Found' }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                } catch (err: any) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
                }
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }
    });

    const PORT = 3002;
    httpServer.listen(PORT, () => {
        console.log(`🚀 HTTP API for frontend listening on port ${PORT}`);
    });
}

// Start the application
bootstrap().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
