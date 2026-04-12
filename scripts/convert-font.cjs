// Convert a .woff/.ttf/.otf font to Three.js typeface JSON format
// Matches Three.js TTFLoader.js conversion logic exactly

const opentype = require('../node_modules/three-stdlib/libs/opentype.cjs')
const fs = require('fs')
const path = require('path')

const inputPath = process.argv[2] || '/tmp/monaspace-krypton.woff'
const outputPath = process.argv[3] || path.join(__dirname, '..', 'public', 'fonts', 'monaspace-krypton.typeface.json')

const buffer = fs.readFileSync(inputPath)
const font = opentype.parse(buffer.buffer)

if (!font) {
  console.error('Failed to parse font')
  process.exit(1)
}

// Exactly mirrors Three.js TTFLoader.convert()
const round = Math.round
const scale = 100000 / ((font.unitsPerEm || 2048) * 72)
const glyphs = {}

const glyphIndexMap = font.encoding.cmap.glyphIndexMap
const unicodes = Object.keys(glyphIndexMap)

for (let i = 0; i < unicodes.length; i++) {
  const unicode = unicodes[i]
  const glyph = font.glyphs.glyphs[glyphIndexMap[unicode]]

  if (unicode !== undefined) {
    const token = {
      ha: round(glyph.advanceWidth * scale),
      x_min: round((glyph.xMin || 0) * scale),
      x_max: round((glyph.xMax || 0) * scale),
      o: ''
    }

    // Use glyph.path.commands directly (raw font coordinates, no getPath)
    glyph.path.commands.forEach(function (command) {
      const type = command.type.toLowerCase() === 'c' ? 'b' : command.type.toLowerCase()
      token.o += type + ' '

      if (command.x !== undefined && command.y !== undefined) {
        token.o += round(command.x * scale) + ' ' + round(command.y * scale) + ' '
      }
      if (command.x1 !== undefined && command.y1 !== undefined) {
        token.o += round(command.x1 * scale) + ' ' + round(command.y1 * scale) + ' '
      }
      if (command.x2 !== undefined && command.y2 !== undefined) {
        token.o += round(command.x2 * scale) + ' ' + round(command.y2 * scale) + ' '
      }
    })

    glyphs[String.fromCodePoint(glyph.unicode)] = token
  }
}

const result = {
  glyphs: glyphs,
  familyName: font.names?.fullName?.en || font.names?.fontFamily?.en || 'Unknown',
  ascender: round(font.ascender * scale),
  descender: round(font.descender * scale),
  underlinePosition: font.tables?.post?.underlinePosition || -100,
  underlineThickness: font.tables?.post?.underlineThickness || 50,
  boundingBox: {
    xMin: font.tables?.head?.xMin || 0,
    xMax: font.tables?.head?.xMax || 0,
    yMin: font.tables?.head?.yMin || 0,
    yMax: font.tables?.head?.yMax || 0,
  },
  resolution: 1000,
  original_font_information: font.tables?.name || {},
}

fs.writeFileSync(outputPath, JSON.stringify(result))
console.log(`Converted ${Object.keys(result.glyphs).length} glyphs to ${outputPath}`)
console.log(`Family: ${result.familyName}`)
console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)}KB`)
