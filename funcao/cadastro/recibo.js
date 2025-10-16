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
    .filter(f => motivoFiltro === "TODOS" || (Array.isArray(f.motivoAuxilio) ? f.motivoAuxilio.map(m => m.toUpperCase()).includes(motivoFiltro) : (f.motivoAuxilio || '').toUpperCase() === motivoFiltro))
    .filter(f => comunidadeSelecionada === "TODAS" || (f.localidade || '').toUpperCase() === comunidadeSelecionada);

  let yOffset = margin;
  let currentHalf = 0;

  familias.forEach((familia, index) => {
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

    // Logos
    doc.addImage(logoEsquerda, 'PNG', margin, yOffset, imageWidth, imageHeight);
    doc.addImage(logoDireita, 'PNG', pageWidth - margin - imageWidth, yOffset, imageWidth, imageHeight);

    // Título
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text('TERMO DE RECEBIMENTO', pageWidth / 2, yOffset + 8, { align: 'center' });
    yOffset += imageHeight + lineSpacing;

    // Declaração com cores, itálico e negrito
    const lider = (familia.liderFamilia || '____________________').toUpperCase();
    const cpfLider = (familia.cpfLider || '____________________').toUpperCase();
    const localidade = (familia.localidade || '____________________').toUpperCase();

    const declaracao = [
      { text: 'EU, ', color: 100, bold: false, italic: true },
      { text: lider, color: 0, noBreak: true, bold: true, italic: true },
      { text: ' , INSCRITO(A) NO CPF SOB O NÚMERO: ', color: 100, bold: false, italic: true },
      { text: cpfLider, color: 0, noBreak: true, bold: true, italic: true },
      { text: ', RESIDENTE NA LOCALIDADE DE ', color: 100, bold: false, italic: true },
      { text: localidade, color: 0, noBreak: true, bold: true, italic: true },
      { text: `, DECLARO, PARA OS DEVIDOS FINS, QUE RECEBI DA SECRETARIA MUNICIPAL DE PROTEÇÃO E DEFESA CIVIL (SEMPDEC), NA DATA DE ${dataAtual}, A QUANTIDADE DE _____ CESTAS BÁSICAS E ____ KITS DE HIGIÊNE.`, color: 100, bold: false, italic: true }
    ];

    function printColoredText(segments, x, y, maxWidth, lineSpacing) {
      let currY = y;
      let line = [];
      let lineWidth = 0;

      segments.forEach(segment => {
        const words = segment.noBreak ? [segment.text] : segment.text.split(/(\s+)/);

        words.forEach(word => {
          if (!word) return;
          const wordWidth = doc.getTextWidth(word);

          if (lineWidth + wordWidth > maxWidth && line.length > 0) {
            // imprime linha
            let offsetX = x;
            line.forEach(seg => {
              doc.setTextColor(seg.color);
              doc.setFont("helvetica", seg.bold ? "bold" : "normal");
              if (seg.italic) doc.setFont(undefined, seg.bold ? "bolditalic" : "italic");
              doc.text(seg.text, offsetX, currY);
              offsetX += doc.getTextWidth(seg.text);
            });
            currY += lineSpacing;
            line = [];
            lineWidth = 0;
          }

          let adjustedWord = word;
          if (!segment.noBreak) {
            adjustedWord = word.replace(/\s*,\s*/g, ', ').replace(/\s*\.\s*/g, '. ');
          }

          line.push({ text: adjustedWord, color: segment.color, bold: segment.bold, italic: segment.italic });
          lineWidth += doc.getTextWidth(adjustedWord);
        });
      });

      let offsetX = x;
      line.forEach(seg => {
        doc.setTextColor(seg.color);
        if (seg.italic) doc.setFont(undefined, seg.bold ? "bolditalic" : "italic");
        else doc.setFont("helvetica", seg.bold ? "bold" : "normal");
        doc.text(seg.text, offsetX, currY);
        offsetX += doc.getTextWidth(seg.text);
      });

      return currY + lineSpacing;
    }

    yOffset = printColoredText(declaracao, margin, yOffset, maxWidth, lineSpacing);

    // Informações adicionais em negrito
    doc.setTextColor(100);
    doc.setFont("helvetica", "bold");
    doc.text('INFORMAÇÕES ADICIONAIS:', margin, yOffset);
    yOffset += lineSpacing;

    const additionalInfo = [
      `CÔNJUGE: ${(familia.nomeEsposa || '____________________').toUpperCase()} — CPF: ${(familia.cpfEsposa || '____________________').toUpperCase()}`,
      `CONTATO: ${(familia.numeroContato || '____________________')}`,
      `MOTIVO DO AUXÍLIO: ${Array.isArray(familia.motivoAuxilio) ? familia.motivoAuxilio.map(m => m.toUpperCase()).join(', ') : (familia.motivoAuxilio || '____________________').toUpperCase()}`
    ];
    additionalInfo.forEach(line => {
      const splitLine = doc.splitTextToSize(line, maxWidth);
      doc.text(splitLine, margin, yOffset);
      yOffset += splitLine.length * lineSpacing;
    });

    yOffset += lineSpacing;

    const confirmationText = 'DECLARO QUE OS GÊNEROS ALIMENTÍCIOS/HIGIENICOS FORAM ENTREGUES EM PERFEITAS CONDIÇÕES E DESTINAM-SE EXCLUSIVAMENTE AO CONSUMO/USO FAMILIAR.';
    const splitConfirmation = doc.splitTextToSize(confirmationText, maxWidth);
    doc.setFont("helvetica", "normal"); // volta para normal
    doc.text(splitConfirmation, margin, yOffset);
    yOffset += splitConfirmation.length * lineSpacing + lineSpacing;

    // Assinaturas
    const pageCenter = pageWidth / 2;
    const lineWidth = 55;
    const gap = 20;
    const startX1 = pageCenter - (lineWidth + gap / 2);
    const startX2 = pageCenter + gap / 2;
    const signatureY = yOffset;

    doc.setLineWidth(0.5);
    doc.line(startX1, signatureY, startX1 + lineWidth, signatureY);
    doc.line(startX2, signatureY, startX2 + lineWidth, signatureY);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text('FUNCIONÁRIO RESPONSÁVEL PELA ENTREGA', startX1 + lineWidth / 2, signatureY + 5, { align: 'center' });
    doc.text('BENEFICIÁRIO OU REPRESENTANTE', startX2 + lineWidth / 2, signatureY + 5, { align: 'center' });

    yOffset += lineSpacing * 2;

    const pageHeightCurrent = currentHalf === 0 ? halfPageHeight : pageHeight;
    doc.text(`RECIBO Nº ${index + 1}`, pageWidth - margin, pageHeightCurrent - 5, { align: 'right' });
  });

  doc.save(`recibos_rancho_${comunidadeSelecionada}_${motivoFiltro}.pdf`);
}