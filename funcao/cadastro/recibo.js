
function gerarReciboPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  function dataPorExtenso(date) {
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  }

  const dataAtual = dataPorExtenso(new Date()).toUpperCase();
  const motivoFiltro = document.getElementById('motivoAuxilioSelect').value.toUpperCase();
  const comunidadeSelecionada = document.getElementById('comunidadeSelect').value.toUpperCase();

  const pageHeight = doc.internal.pageSize.getHeight();
  const halfPageHeight = pageHeight / 2;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const maxWidth = pageWidth - 2 * margin;
  const lineSpacing = 8;
  const imageHeight = 12;
  const imageWidth = 20;

  const familias = fichasCache
    .filter(f =>
      motivoFiltro === "TODOS" ||
      (
        Array.isArray(f.motivoAuxilio)
          ? f.motivoAuxilio.map(m => m.toUpperCase()).includes(motivoFiltro)
          : (f.motivoAuxilio || '').toUpperCase() === motivoFiltro
      )
    )
    .filter(f =>
      comunidadeSelecionada === "TODAS" ||
      (f.localidade || '').toUpperCase() === comunidadeSelecionada
    );

  let yOffset = margin;
  let currentHalf = 0;

  familias.forEach((familia, index) => {

    // Controle das duas vias por página
    if (currentHalf === 0 && index !== 0) {
      doc.setDrawColor(150);
      doc.line(margin, halfPageHeight, pageWidth - margin, halfPageHeight);
      yOffset = halfPageHeight + margin;
      currentHalf = 1;

    } else if (currentHalf === 1) {
      doc.addPage();
      yOffset = margin;
      currentHalf = 0;
    }

    // LOGOTIPOS
    doc.addImage(logoEsquerda, 'PNG', margin, yOffset, imageWidth, imageHeight);
    doc.addImage(
      logoDireita,
      'PNG',
      pageWidth - margin - imageWidth,
      yOffset,
      imageWidth,
      imageHeight
    );

    // TÍTULO
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);

    doc.text(
      'TERMO DE RECEBIMENTO',
      pageWidth / 2,
      yOffset + 8,
      { align: 'center' }
    );

    yOffset += imageHeight + lineSpacing;

    // DECLARAÇÃO
    const declaracao = [
      { text: 'EU, ', color: 100, bold: false, italic: true },
      {
        text: '________________________________________',
        color: 0,
        noBreak: true,
        bold: true,
        italic: true
      },
      {
        text: ', INSCRITO(A) NO CPF SOB O N°: ',
        color: 100,
        bold: false,
        italic: true
      },
      {
        text: '________________________',
        color: 0,
        noBreak: true,
        bold: true,
        italic: true
      },
      {
        text: ', RESIDENTE NA LOCALIDADE DE ',
        color: 100,
        bold: false,
        italic: true
      },
      {
        text: '____________________________________________',
        color: 0,
        noBreak: true,
        bold: true,
        italic: true
      },
      {
        text: ', DECLARO, PARA OS DEVIDOS FINS, QUE RECEBI DA SECRETARIA MUNICIPAL DE PROTEÇÃO E DEFESA CIVIL (SEMPDEC), NA DATA DE ____/____/2026, A QUANTIDADE DE:',
        color: 100,
        bold: false,
        italic: true
      }
    ];

    function printColoredText(segments, x, y, maxWidth, lineSpacing) {
      let currY = y;
      let line = [];
      let lineWidth = 0;

      segments.forEach(segment => {
        const words = segment.noBreak
          ? [segment.text]
          : segment.text.split(/(\s+)/);

        words.forEach(word => {
          if (!word) return;

          doc.setFont(
            "helvetica",
            segment.italic
              ? (segment.bold ? "bolditalic" : "italic")
              : (segment.bold ? "bold" : "normal")
          );

          const wordWidth = doc.getTextWidth(word);

          if (lineWidth + wordWidth > maxWidth && line.length > 0) {
            let offsetX = x;

            line.forEach(seg => {
              doc.setTextColor(seg.color);
              doc.setFont(
                "helvetica",
                seg.italic
                  ? (seg.bold ? "bolditalic" : "italic")
                  : (seg.bold ? "bold" : "normal")
              );

              doc.text(seg.text, offsetX, currY);
              offsetX += doc.getTextWidth(seg.text);
            });

            currY += lineSpacing;
            line = [];
            lineWidth = 0;
          }

          line.push({
            text: word,
            color: segment.color,
            bold: segment.bold,
            italic: segment.italic
          });

          lineWidth += wordWidth;
        });
      });

      let offsetX = x;

      line.forEach(seg => {
        doc.setTextColor(seg.color);
        doc.setFont(
          "helvetica",
          seg.italic
            ? (seg.bold ? "bolditalic" : "italic")
            : (seg.bold ? "bold" : "normal")
        );

        doc.text(seg.text, offsetX, currY);
        offsetX += doc.getTextWidth(seg.text);
      });

      return currY + lineSpacing;
    }

    yOffset = printColoredText(
      declaracao,
      margin,
      yOffset,
      maxWidth,
      lineSpacing
    );

    yOffset += 3;

    // MATERIAIS RECEBIDOS
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100);

    const materiais = [
      '(   ) CESTAS BÁSICAS',
      '(   ) KIT HIGIENE PESSOAL',
      '(   ) KIT LIMPEZA',
      '(   ) KIT DORMITÓRIO',
      '(   ) COLCHÃO',
      '(   ) REDE DE DESCANSO',
      '(   ) KIT MULHER',
      '(   ) KIT BEBÊ',
      '(   ) ÁGUA MINERAL'
    ];

    materiais.forEach(item => {
      doc.text(item, margin + 5, yOffset);
      yOffset += 6;
    });

    yOffset += 3;

    // INFORMAÇÕES ADICIONAIS
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "bold");

    doc.text('INFORMAÇÕES ADICIONAIS:', margin, yOffset);
    yOffset += lineSpacing;

    doc.text(
      'CONTATO: __________________________________________',
      margin,
      yOffset
    );

    yOffset += lineSpacing;

    doc.text(
      'MOTIVO DO AUXÍLIO: INUNDAÇÃO',
      margin,
      yOffset
    );

    yOffset += lineSpacing + 3;

    // DECLARAÇÃO DE RECEBIMENTO
    const confirmationText =
      'DECLARO QUE OS GÊNEROS ALIMENTÍCIOS FORAM ENTREGUES EM PERFEITAS CONDIÇÕES E DESTINAM-SE EXCLUSIVAMENTE AO CONSUMO/USO FAMILIAR.';

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const splitConfirmation = doc.splitTextToSize(
      confirmationText,
      maxWidth
    );

    doc.text(splitConfirmation, margin, yOffset);

    yOffset += splitConfirmation.length * 6 + 12;

    // ASSINATURAS
    const pageCenter = pageWidth / 2;
    const signatureLineWidth = 55;
    const gap = 20;

    const startX1 = pageCenter - (signatureLineWidth + gap / 2);
    const startX2 = pageCenter + gap / 2;

    const signatureY = yOffset;

    doc.setLineWidth(0.5);

    doc.line(
      startX1,
      signatureY,
      startX1 + signatureLineWidth,
      signatureY
    );

    doc.line(
      startX2,
      signatureY,
      startX2 + signatureLineWidth,
      signatureY
    );

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "bold");

    doc.text(
      'AGENTE DE DEFESA CIVIL',
      startX1 + signatureLineWidth / 2,
      signatureY + 5,
      { align: 'center' }
    );

    doc.text(
      'BENEFICIÁRIO OU REPRESENTANTE',
      startX2 + signatureLineWidth / 2,
      signatureY + 5,
      { align: 'center' }
    );

    // NÚMERO DO RECIBO
    const pageHeightCurrent =
      currentHalf === 0 ? halfPageHeight : pageHeight;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.text(
      `RECIBO Nº ${index + 1}`,
      pageWidth - margin,
      pageHeightCurrent - 5,
      { align: 'right' }
    );

  });

  // SALVAR PDF
  doc.save(
    `recibos_rancho_${comunidadeSelecionada}_${motivoFiltro}.pdf`
  );
}
