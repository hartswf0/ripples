const dgram = require('dgram');
const fs = require('fs');
const path = require('path');
const RipplesGridCompiler = require('../compiler/grid-compiler');

/**
 * RIPPLES // AUDIO BRIDGE
 * 
 * Connects RIPPLES to the UDP-verse (Orca, Pilot, Gull).
 */
class RipplesAudioBridge {
    constructor() {
        this.client = dgram.createSocket('udp4');
        this.compiler = new RipplesGridCompiler(32, 18); // Widescreen grid

        this.PORTS = {
            ORCA: 49160,
            PILOT: 49161,
            GULL: 49162 // Assuming Gull configured here
        };

        this.HOST = '127.0.0.1';
        this.frame = 0;
        this.entities = [];

        console.log("RIPPLES AUDIO BRIDGE // INITIALIZED");
        console.log(`Targeting: Orca:${this.PORTS.ORCA}, Pilot:${this.PORTS.PILOT}`);
    }

    /**
     * Send raw string to UDP port
     */
    send(port, msg) {
        const buffer = Buffer.from(msg);
        this.client.send(buffer, 0, buffer.length, port, this.HOST, (err) => {
            if (err) console.error(`UDP Error: ${err}`);
        });
    }

    /**
     * Handle a discrete RIPPLES event
     * @param {Object} event - { type: 'ripple', entity: 'ant', vector: 'GOAL' }
     */
    onEvent(event) {
        // 1. Send direct synth trigger to Pilot (bypass Orca for immediate feedback)
        if (event.type === 'ripple') {
            // Protocol: ch;note;vel... Pilot uses condensed strings often like "03C"
            // Or OSC style. Pilot UDP is usually simple string commands.
            // Example: "03C" -> Channel 0, Octave 3, Note C
            const notes = ['C', 'E', 'G', 'A', 'B', 'D'];
            const note = notes[Math.floor(Math.random() * notes.length)];
            const cmd = `04${note}`;
            this.send(this.PORTS.PILOT, cmd);
            console.log(`[EVENT] Sent Pilot trigger: ${cmd} (${event.entity})`);
        }

        // 2. Send generic bang to Orca listener (if set up)
        // Orca UDP format: device:op args... 
        // usually mapped in Orca via ;
        this.send(this.PORTS.ORCA, "bang");
    }

    /**
     * Update the bridge with a new frame of entities
     * Writes "Living Code" to file and (theoretically) could attempt UDP grid injection
     */
    update(entities) {
        this.entities = entities;
        this.frame++;

        // Compile Grid
        const gridStr = this.compiler.compile(entities);

        // Write to Live File (for monitoring or loading)
        // This is a concrete way to see the "Living Code"
        if (this.frame % 10 === 0) { // Throttle file writes
            const filePath = path.join(__dirname, '../../audio/live.orca');
            fs.writeFileSync(filePath, gridStr);
            // console.log(`[GRID] Wrote frame ${this.frame} to audio/live.orca`);
        }
    }

    close() {
        this.client.close();
    }
}

// ═══════════════════════════════════════════════════════════════
// MOCK ENGINE LOOP (For testing the bridge)
// ═══════════════════════════════════════════════════════════════

if (require.main === module) {
    const bridge = new RipplesAudioBridge();

    console.log("Starting Mock Input Loop... (Ctrl+C to stop)");

    // Mock Entities
    const ants = [
        { x: 10, y: 8, type: 'animate', name: 'ant', vx: 0.1, vy: 0 },
        { x: 20, y: 5, type: 'inanimate', name: 'wall' },
        { x: 15, y: 12, type: 'abstract', name: 'shadow' }
    ];

    // Loop
    setInterval(() => {
        // Move "Ant"
        ants[0].x = (ants[0].x + ants[0].vx) % 32;

        // Trigger Event randomly
        if (Math.random() < 0.05) {
            bridge.onEvent({ type: 'ripple', entity: 'ant', vector: 'GOAL' });
        }

        // Update Bridge
        bridge.update(ants);

    }, 100); // 10fps

    // Cleanup
    process.on('SIGINT', () => {
        console.log("\nClosing Bridge...");
        bridge.close();
        process.exit();
    });
}

module.exports = RipplesAudioBridge;
