/**
 * RIPPLES // GRID COMPILER
 * 
 * "The ecosystem is the source code."
 * 
 * This module translates a frame of RIPPLES entity data into an ORCA grid string.
 * It implements the theoretical framework defined in ORCA_RIPPLE_THEORY.md.
 */

class RipplesGridCompiler {
    constructor(width = 32, height = 32) {
        this.width = width;
        this.height = height;
        this.grid = new Array(width * height).fill('.');

        // MAPPING: Entity Type -> Orca Operator
        this.operatorMap = {
            'animate': ['N', 'S', 'E', 'W'], // Movement operators
            'inanimate': ['H', '*', '+', '-'], // Structure/Math
            'abstract': ['Y', 'J', 'V', 'T']   // Teleportation/Variables
        };

        // MAPPING: Entity Name -> Specific Operator logic (optional overrides)
        this.specialMap = {
            'ant': 'N',      // North-moving logic carrier
            'spider': 'E',   // East-moving logic carrier
            'crumb': 'I',    // Incrementer (Resource)
            'wall': 'H',     // Halt (Obstacle)
            'shadow': 'V',   // Variable (Global State)
            'ripple': '@'    // The custom RADIAL BANG operator
        };
    }

    /**
     * Clear the internal grid buffer
     */
    clear() {
        this.grid.fill('.');
    }

    /**
     * Compile a RIPPLES frame into an ORCA string
     * @param {Array} entities - List of RIPPLES entities {x, y, type, name, value}
     * @returns {String} The raw encoded ORCA grid string
     */
    compile(entities) {
        this.clear();

        entities.forEach(entity => {
            // 1. Quantize Position
            // RIPPLES is float-based; ORCA is integer-grid.
            const gx = Math.floor(entity.x) % this.width;
            const gy = Math.floor(entity.y) % this.height;
            const idx = gy * this.width + gx;

            // 2. Determine Operator
            let char = '.';

            // Check specific overrides first
            if (this.specialMap[entity.name.toLowerCase()]) {
                char = this.specialMap[entity.name.toLowerCase()];
            } else {
                // Fallback to type-based mapping
                const possibleOps = this.operatorMap[entity.type] || ['?'];
                // Use hash of name or ID to pick deterministic operator
                const hash = entity.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                char = possibleOps[hash % possibleOps.length];
            }

            // 3. Write to Grid
            // In ORCA, we often want to preserve existing ops if they are vital,
            // but here the "Living Code" theory says the Entity IS the code.
            // So we overwrite.
            if (idx >= 0 && idx < this.grid.length) {
                this.grid[idx] = char;

                // 4. Inject Value (if entity carries state)
                if (entity.value !== undefined) {
                    // Place value to the right of operator, if within bounds
                    const valIdx = idx + 1;
                    if (valIdx % this.width !== 0) { // Don't wrap lines
                        // Convert to base36 (0-Z)
                        const valChar = Math.min(35, Math.floor(entity.value)).toString(36).toUpperCase();
                        this.grid[valIdx] = valChar;
                    }
                }
            }
        });

        return this.toString();
    }

    /**
     * Convert grid array to 2D string representation
     */
    toString() {
        let output = '';
        for (let y = 0; y < this.height; y++) {
            const row = this.grid.slice(y * this.width, (y + 1) * this.width);
            output += row.join('') + '\n';
        }
        return output;
    }

    /**
     * Inject a "Radial Bang" (Ripple) at a specific coordinate
     * @param {Number} x 
     * @param {Number} y 
     */
    injectRipple(x, y) {
        const gx = Math.floor(x) % this.width;
        const gy = Math.floor(y) % this.height;
        const idx = gy * this.width + gx;
        if (idx >= 0 && idx < this.grid.length) {
            this.grid[idx] = '@';
        }
    }
}

// Export for use in Node.js or Browser
if (typeof module !== 'undefined') module.exports = RipplesGridCompiler;
