type DocxFile = {
  path: string;
  data: Uint8Array;
};

export type DocxParagraphStyle = 'Normal' | 'Title' | 'Heading1' | 'Heading2';
export type DocxAlignment = 'left' | 'center' | 'right';
export type DocxHighlight = 'yellow' | 'green';

export type DocxParagraph = {
  type?: 'paragraph';
  text: string;
  bold?: boolean;
  underline?: boolean;
  style?: DocxParagraphStyle;
  align?: DocxAlignment;
  bulletLevel?: number;
  spacingBefore?: number;
  spacingAfter?: number;
  highlight?: DocxHighlight;
};

export type DocxTableCell = {
  text: string;
  bold?: boolean;
  highlight?: DocxHighlight;
};

export type DocxTable = {
  type: 'table';
  headers?: DocxTableCell[];
  rows: DocxTableCell[][];
  columnWidths?: number[];
};

export type DocxContentBlock = DocxParagraph | DocxTable;

const textEncoder = new TextEncoder();

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i += 1) {
  let c = i;
  for (let j = 0; j < 8; j += 1) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    c = crcTable[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function toDosDateTime(date = new Date()) {
  const year = Math.min(Math.max(date.getFullYear(), 1980), 2107);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  return { dosTime, dosDate };
}

function uint16LE(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function uint32LE(value: number): Uint8Array {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff
  ]);
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function buildStoredZip(files: DocxFile[]): Uint8Array {
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  const { dosDate, dosTime } = toDosDateTime();

  for (const file of files) {
    const nameBytes = textEncoder.encode(file.path);
    const data = file.data;
    const crc = crc32(data);
    const size = data.length;

    const localHeader = concatBytes([
      uint32LE(0x04034b50),
      uint16LE(20),
      uint16LE(0),
      uint16LE(0),
      uint16LE(dosTime),
      uint16LE(dosDate),
      uint32LE(crc),
      uint32LE(size),
      uint32LE(size),
      uint16LE(nameBytes.length),
      uint16LE(0),
      nameBytes,
      data
    ]);
    locals.push(localHeader);

    const centralHeader = concatBytes([
      uint32LE(0x02014b50),
      uint16LE(20),
      uint16LE(20),
      uint16LE(0),
      uint16LE(0),
      uint16LE(dosTime),
      uint16LE(dosDate),
      uint32LE(crc),
      uint32LE(size),
      uint32LE(size),
      uint16LE(nameBytes.length),
      uint16LE(0),
      uint16LE(0),
      uint16LE(0),
      uint16LE(0),
      uint32LE(0),
      uint32LE(offset),
      nameBytes
    ]);
    centrals.push(centralHeader);
    offset += localHeader.length;
  }

  const centralDirectory = concatBytes(centrals);
  const localFiles = concatBytes(locals);
  const endOfCentralDirectory = concatBytes([
    uint32LE(0x06054b50),
    uint16LE(0),
    uint16LE(0),
    uint16LE(files.length),
    uint16LE(files.length),
    uint32LE(centralDirectory.length),
    uint32LE(localFiles.length),
    uint16LE(0)
  ]);

  return concatBytes([localFiles, centralDirectory, endOfCentralDirectory]);
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isDocxTable(block: DocxContentBlock): block is DocxTable {
  return (block as DocxTable).type === 'table';
}

function buildRunPropsXml(paragraph: DocxParagraph): string {
  const parts: string[] = [];
  if (paragraph.bold) {
    parts.push('<w:b/>');
  }
  if (paragraph.underline) {
    parts.push('<w:u w:val="single"/>');
  }
  if (paragraph.highlight) {
    parts.push(`<w:highlight w:val="${paragraph.highlight}"/>`);
  }
  if (!parts.length) {
    return '';
  }
  return `<w:rPr>${parts.join('')}</w:rPr>`;
}

function buildParagraphPropsXml(paragraph: DocxParagraph): string {
  const parts: string[] = [];

  if (paragraph.style) {
    parts.push(`<w:pStyle w:val="${paragraph.style}"/>`);
  }
  if (typeof paragraph.bulletLevel === 'number') {
    const safeLevel = Math.max(0, Math.floor(paragraph.bulletLevel));
    parts.push(
      `<w:numPr><w:ilvl w:val="${safeLevel}"/><w:numId w:val="1"/></w:numPr>`
    );
  }
  if (paragraph.align) {
    parts.push(`<w:jc w:val="${paragraph.align}"/>`);
  }
  if (
    typeof paragraph.spacingBefore === 'number' ||
    typeof paragraph.spacingAfter === 'number'
  ) {
    const before = Math.max(0, Math.floor(paragraph.spacingBefore ?? 0));
    const after = Math.max(0, Math.floor(paragraph.spacingAfter ?? 0));
    parts.push(`<w:spacing w:before="${before}" w:after="${after}"/>`);
  }

  if (!parts.length) {
    return '';
  }
  return `<w:pPr>${parts.join('')}</w:pPr>`;
}

function buildParagraphXml(paragraph: DocxParagraph): string {
  const paragraphProps = buildParagraphPropsXml(paragraph);

  if (!paragraph.text.trim()) {
    if (paragraphProps) {
      return `<w:p>${paragraphProps}</w:p>`;
    }
    return '<w:p/>';
  }

  const runProps = buildRunPropsXml(paragraph);
  return [
    '<w:p>',
    paragraphProps,
    '<w:r>',
    runProps,
    `<w:t xml:space="preserve">${xmlEscape(paragraph.text)}</w:t>`,
    '</w:r>',
    '</w:p>'
  ].join('');
}

function buildTableCellParagraphXml(cell: DocxTableCell, isHeader = false): string {
  const paragraph: DocxParagraph = {
    text: cell.text,
    bold: isHeader || cell.bold,
    highlight: cell.highlight,
    spacingBefore: isHeader ? 200 : 0,
    spacingAfter: isHeader ? 200 : 0
  };
  return buildParagraphXml(paragraph);
}

function buildTableCellXml(cell: DocxTableCell, isHeader = false): string {
  return ['<w:tc>', '<w:tcPr/>', buildTableCellParagraphXml(cell, isHeader), '</w:tc>'].join('');
}

function buildTableRowXml(cells: DocxTableCell[], isHeader = false): string {
  const rowCells = cells.map((cell) => buildTableCellXml(cell, isHeader)).join('');
  return ['<w:tr>', '<w:trPr><w:cantSplit w:val="0"/></w:trPr>', rowCells, '</w:tr>'].join('');
}

function buildTableXml(table: DocxTable): string {
  const headerCellCount = table.headers?.length ?? 0;
  const rowCellCount = table.rows.reduce(
    (max, row) => Math.max(max, row.length),
    0
  );
  const columnCount = Math.max(headerCellCount, rowCellCount, 1);
  const defaultWidth = Math.floor(9855 / columnCount);
  const widths = Array.from({ length: columnCount }, (_, index) => {
    if (table.columnWidths?.[index] && table.columnWidths[index] > 0) {
      return Math.floor(table.columnWidths[index]);
    }
    return defaultWidth;
  });

  const gridXml = widths.map((width) => `<w:gridCol w:w="${width}"/>`).join('');
  const headerXml = table.headers ? buildTableRowXml(table.headers, true) : '';
  const rowsXml = table.rows.map((row) => buildTableRowXml(row)).join('');

  return [
    '<w:tbl>',
    '<w:tblPr>',
    '<w:tblStyle w:val="Table1"/>',
    '<w:tblW w:w="9855" w:type="dxa"/>',
    '<w:jc w:val="left"/>',
    '<w:tblBorders>',
    '<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>',
    '<w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>',
    '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>',
    '<w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>',
    '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>',
    '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>',
    '</w:tblBorders>',
    '<w:tblLayout w:type="fixed"/>',
    '</w:tblPr>',
    `<w:tblGrid>${gridXml}</w:tblGrid>`,
    headerXml,
    rowsXml,
    '</w:tbl>'
  ].join('');
}

function buildDocumentXml(blocks: DocxContentBlock[]): string {
  const body = blocks
    .map((block) => (isDocxTable(block) ? buildTableXml(block) : buildParagraphXml(block)))
    .join('');
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
    '<w:body>',
    body,
    '<w:sectPr>',
    '<w:pgSz w:w="12240" w:h="15840" w:orient="portrait"/>',
    '<w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="720" w:footer="720" w:gutter="0"/>',
    '<w:pgNumType w:start="1"/>',
    '</w:sectPr>',
    '</w:body>',
    '</w:document>'
  ].join('');
}

function buildStylesXml(): string {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
    '<w:docDefaults>',
    '<w:rPrDefault><w:rPr>',
    '<w:rFonts w:ascii="Arial" w:cs="Arial" w:eastAsia="Arial" w:hAnsi="Arial"/>',
    '<w:sz w:val="24"/><w:szCs w:val="24"/>',
    '</w:rPr></w:rPrDefault>',
    '<w:pPrDefault><w:pPr><w:spacing w:before="240" w:after="240" w:line="279" w:lineRule="auto"/></w:pPr></w:pPrDefault>',
    '</w:docDefaults>',
    '<w:style w:type="table" w:styleId="TableNormal" w:default="1">',
    '<w:name w:val="TableNormal"/>',
    '<w:tblPr>',
    '<w:tblCellMar>',
    '<w:top w:w="100" w:type="dxa"/><w:left w:w="100" w:type="dxa"/>',
    '<w:bottom w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/>',
    '</w:tblCellMar>',
    '</w:tblPr>',
    '</w:style>',
    '<w:style w:type="paragraph" w:styleId="Normal" w:default="1">',
    '<w:name w:val="normal"/>',
    '</w:style>',
    '<w:style w:type="paragraph" w:styleId="Title">',
    '<w:name w:val="Title"/>',
    '<w:basedOn w:val="Normal"/>',
    '<w:next w:val="Normal"/>',
    '<w:pPr><w:spacing w:after="80" w:line="240" w:lineRule="auto"/></w:pPr>',
    '<w:rPr><w:b/><w:sz w:val="56"/><w:szCs w:val="56"/></w:rPr>',
    '</w:style>',
    '<w:style w:type="paragraph" w:styleId="Heading1">',
    '<w:name w:val="heading 1"/>',
    '<w:basedOn w:val="Normal"/>',
    '<w:next w:val="Normal"/>',
    '<w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="360" w:after="80" w:line="279" w:lineRule="auto"/></w:pPr>',
    '<w:rPr><w:b/><w:color w:val="005EB8"/><w:sz w:val="40"/><w:szCs w:val="40"/></w:rPr>',
    '</w:style>',
    '<w:style w:type="paragraph" w:styleId="Heading2">',
    '<w:name w:val="heading 2"/>',
    '<w:basedOn w:val="Normal"/>',
    '<w:next w:val="Normal"/>',
    '<w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="160" w:after="80" w:line="279" w:lineRule="auto"/></w:pPr>',
    '<w:rPr><w:color w:val="005EB8"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr>',
    '</w:style>',
    '<w:style w:type="table" w:styleId="Table1">',
    '<w:basedOn w:val="TableNormal"/>',
    '<w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>',
    '<w:tblPr>',
    '<w:tblStyleRowBandSize w:val="1"/><w:tblStyleColBandSize w:val="1"/>',
    '<w:tblCellMar>',
    '<w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/>',
    '<w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/>',
    '</w:tblCellMar>',
    '</w:tblPr>',
    '</w:style>',
    '</w:styles>'
  ].join('');
}

function buildNumberingXml(): string {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
    '<w:abstractNum w:abstractNumId="1">',
    '<w:lvl w:ilvl="0">',
    '<w:start w:val="1"/>',
    '<w:numFmt w:val="bullet"/>',
    '<w:lvlText w:val="●"/>',
    '<w:lvlJc w:val="left"/>',
    '<w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>',
    '</w:lvl>',
    '</w:abstractNum>',
    '<w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>',
    '</w:numbering>'
  ].join('');
}

function buildDocxBlob(title: string, blocks: DocxContentBlock[]): Blob {
  const createdIso = new Date().toISOString();
  const safeTitle = xmlEscape(title.trim() || 'HazardWise Export');
  const documentXml = buildDocumentXml(blocks);
  const stylesXml = buildStylesXml();
  const numberingXml = buildNumberingXml();

  const contentTypesXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>',
    '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>',
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
    '</Types>'
  ].join('');

  const relsXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>',
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>',
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>',
    '</Relationships>'
  ].join('');

  const docRelsXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>',
    '</Relationships>'
  ].join('');

  const coreXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<cp:coreProperties',
    ' xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"',
    ' xmlns:dc="http://purl.org/dc/elements/1.1/"',
    ' xmlns:dcterms="http://purl.org/dc/terms/"',
    ' xmlns:dcmitype="http://purl.org/dc/dcmitype/"',
    ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
    `<dc:title>${safeTitle}</dc:title>`,
    '<dc:creator>HazardWise</dc:creator>',
    '<cp:lastModifiedBy>HazardWise</cp:lastModifiedBy>',
    `<dcterms:created xsi:type="dcterms:W3CDTF">${createdIso}</dcterms:created>`,
    `<dcterms:modified xsi:type="dcterms:W3CDTF">${createdIso}</dcterms:modified>`,
    '</cp:coreProperties>'
  ].join('');

  const appXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"',
    ' xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">',
    '<Application>HazardWise</Application>',
    '</Properties>'
  ].join('');

  const files: DocxFile[] = [
    { path: '[Content_Types].xml', data: textEncoder.encode(contentTypesXml) },
    { path: '_rels/.rels', data: textEncoder.encode(relsXml) },
    { path: 'docProps/core.xml', data: textEncoder.encode(coreXml) },
    { path: 'docProps/app.xml', data: textEncoder.encode(appXml) },
    { path: 'word/document.xml', data: textEncoder.encode(documentXml) },
    { path: 'word/styles.xml', data: textEncoder.encode(stylesXml) },
    { path: 'word/numbering.xml', data: textEncoder.encode(numberingXml) },
    { path: 'word/_rels/document.xml.rels', data: textEncoder.encode(docRelsXml) }
  ];

  const zipBytes = buildStoredZip(files);
  return new Blob([zipBytes], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

export function downloadDocx(
  fileName: string,
  title: string,
  blocks: DocxContentBlock[]
) {
  const blob = buildDocxBlob(title, blocks);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
