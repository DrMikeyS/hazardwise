type DocxFile = {
  path: string;
  data: Uint8Array;
};

export type DocxParagraph = {
  text: string;
  bold?: boolean;
};

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

function buildParagraphXml(paragraph: DocxParagraph): string {
  if (!paragraph.text.trim()) {
    return '<w:p/>';
  }

  const runProps = paragraph.bold ? '<w:rPr><w:b/></w:rPr>' : '';
  return [
    '<w:p>',
    '<w:r>',
    runProps,
    `<w:t xml:space="preserve">${xmlEscape(paragraph.text)}</w:t>`,
    '</w:r>',
    '</w:p>'
  ].join('');
}

function buildDocumentXml(paragraphs: DocxParagraph[]): string {
  const body = paragraphs.map(buildParagraphXml).join('');
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
    '<w:body>',
    body,
    '<w:sectPr>',
    '<w:pgSz w:w="12240" w:h="15840"/>',
    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>',
    '</w:sectPr>',
    '</w:body>',
    '</w:document>'
  ].join('');
}

function buildDocxBlob(title: string, paragraphs: DocxParagraph[]): Blob {
  const createdIso = new Date().toISOString();
  const safeTitle = xmlEscape(title.trim() || 'HazardWise Export');
  const documentXml = buildDocumentXml(paragraphs);

  const contentTypesXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
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
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>'
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
  paragraphs: DocxParagraph[]
) {
  const blob = buildDocxBlob(title, paragraphs);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
