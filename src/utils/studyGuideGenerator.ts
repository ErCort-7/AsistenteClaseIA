import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export const generateStudyGuidePdf = async (content: string, filename: string) => {
  // Procesar el contenido línea por línea de forma simple
  const lines = content.split('\n');
  const children: Paragraph[] = [];

  // Agregar título principal
  children.push(new Paragraph({
    children: [
      new TextRun({
        text: 'GUÍA DE ESTUDIO PERSONALIZADA',
        bold: true,
        size: 32,
        color: '1a365d'
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 480 }
  }));

  lines.forEach((line, index) => {
    const cleanLine = line.trim();
    
    // Líneas vacías
    if (!cleanLine) {
      children.push(new Paragraph({
        text: '',
        spacing: { before: 120, after: 120 }
      }));
      return;
    }

    // Limpiar símbolos de markdown
    let processedLine = cleanLine
      .replace(/^#+\s*/, '') // Quitar # de headers
      .replace(/^\d+\.\s*/, '') // Quitar numeración
      .replace(/^[-*•]\s*/, '') // Quitar viñetas
      .replace(/\*\*(.*?)\*\*/g, '$1'); // Quitar asteriscos de negritas

    // Determinar si es un título (línea corta sin punto final)
    const isTitle = processedLine.length < 80 && !processedLine.endsWith('.') && !processedLine.includes(':');

    if (isTitle) {
      // Título/Encabezado
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: processedLine,
            bold: true,
            size: 28,
            color: '2d3748'
          })
        ],
        spacing: { before: 360, after: 240 }
      }));
    } else if (processedLine.includes(':') && processedLine.length < 150) {
      // Definición
      const [term, ...definition] = processedLine.split(':');
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: term.trim() + ': ',
            bold: true,
            size: 24
          }),
          new TextRun({
            text: definition.join(':').trim(),
            size: 24
          })
        ],
        spacing: { before: 120, after: 120 },
        alignment: AlignmentType.JUSTIFIED
      }));
    } else {
      // Párrafo normal
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: processedLine,
            size: 24
          })
        ],
        spacing: { before: 120, after: 120 },
        alignment: AlignmentType.JUSTIFIED
      }));
    }
  });

  // Add footer with generation info
  children.push(new Paragraph({
    text: '',
    spacing: { before: 480 }
  }));

  children.push(new Paragraph({
    children: [
      new TextRun({
        text: `Generado por EduAsistent - ${new Date().toLocaleDateString('es-ES')}`,
        size: 20,
        italics: true,
        color: '718096'
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 240 }
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `guia-estudio-${filename}.docx`);
};