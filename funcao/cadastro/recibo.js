
function gerarReciboPDF() {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const halfPageHeight = pageHeight / 2;
  const pageWidth = doc.internal.pageSize.getWidth();

  const margin = 10;
  const maxWidth = pageWidth - 2 * margin;
  const imageHeight = 12;
  const imageWidth = 20;

  const motivoFiltro = document
    .getElementById('motivoAuxilioSelect')
    .value.toUpperCase();

  const comunidadeSelecionada = document
    .getElementById('comunidadeSelect')
    .value.toUpperCase();

  // FILTRO DAS FAMÍLIAS
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

  // GERAÇÃO DOS RECIBOS
  familias.forEach((familia, index) => {

    // CONTROLE DE DUAS VIAS POR PÁGINA
    if (currentHalf === 0 && index !== 0) {
      doc.setDrawColor(150);
      doc.setLineWidth(0.3);

      doc.line(
        margin,
        halfPageHeight,
        pageWidth - margin,
        halfPageHeight
      );

      yOffset = halfPageHeight + margin;
      currentHalf = 1;

    } else if (currentHalf === 1) {
      doc.addPage();
      yOffset = margin;
      currentHalf = 0;
    }

    // LOGOTIPOS
    doc.addImage(
      logoEsquerda,
      'PNG',
      margin,
      yOffset,
      imageWidth,
      imageHeight
    );

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

    yOffset += imageHeight + 8;

    // CORPO DA DECLARAÇÃO
    const declaracao =
      'EU, ____________________________________________, ' +
      'INSCRITO(A) NO CPF SOB O N°: ____________________, ' +
      'RESIDENTE NA LOCALIDADE DE ________________________________ ' +
      '____________________________________, DECLARO, PARA OS DEVIDOS ' +
      'FINS, QUE RECEBI DA SECRETARIA MUNICIPAL DE PROTEÇÃO E DEFESA ' +
      'CIVIL (SEMPDEC), NA DATA DE ____/____/______, A QUANTIDADE DE:';

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);

    const linhasDeclaracao = doc.splitTextToSize(
      declaracao,
      maxWidth
    );

    // ESPAÇAMENTO MAIOR ENTRE AS LINHAS
    doc.text(
      linhasDeclaracao,
      margin,
      yOffset,
      { lineHeightFactor: 1.8 }
    );

    yOffset += linhasDeclaracao.length * 7 + 5;

    // MATERIAIS RECEBIDOS - LADO A LADO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100);

    const materiais = [
      '( ) CESTAS BÁSICAS',
      '( ) KIT HIGIENE PESSOAL',
      '( ) KIT LIMPEZA',
      '( ) KIT DORMITÓRIO',
      '( ) COLCHÃO',
      '( ) REDE DE DESCANSO',
      '( ) KIT MULHER',
      '( ) KIT BEBÊ',
      '( ) ÁGUA MINERAL'
    ];

    const textoMateriais = materiais.join(', ');

    const linhasMateriais = doc.splitTextToSize(
      textoMateriais,
      maxWidth
    );

    doc.text(
      linhasMateriais,
      margin,
      yOffset
    );

    yOffset += linhasMateriais.length * 5 + 5;

    // INFORMAÇÕES ADICIONAIS
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);

    doc.text(
      'INFORMAÇÕES ADICIONAIS:',
      margin,
      yOffset
    );

    yOffset += 5;

    // CONTATO
    doc.text(
      'CONTATO: ______________________________________________',
      margin,
      yOffset
    );

    yOffset += 5;

    // MOTIVOS DO AUXÍLIO COM CAMPOS DE MARCAÇÃO
    const motivoAuxilioTexto =
      'MOTIVO DO AUXÍLIO: ( ) INUNDAÇÃO, ( ) CHUVAS INTENSAS, ' +
      '( ) ALAGAMENTO, ( ) VENDAVAL, ( ) INCÊNDIO FLORESTAL, ' +
      '( ) ESTIAGEM.';

    const linhasMotivo = doc.splitTextToSize(
      motivoAuxilioTexto,
      maxWidth
    );

    doc.text(
      linhasMotivo,
      margin,
      yOffset
    );

    yOffset += linhasMotivo.length * 5 + 7;

    // DECLARAÇÃO DE RECEBIMENTO
    const confirmationText =
      'DECLARO QUE OS GÊNEROS ALIMENTÍCIOS FORAM ENTREGUES EM ' +
      'PERFEITAS CONDIÇÕES E DESTINAM-SE EXCLUSIVAMENTE AO ' +
      'CONSUMO/USO FAMILIAR.';

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);

    const splitConfirmation = doc.splitTextToSize(
      confirmationText,
      maxWidth
    );

    doc.text(
      splitConfirmation,
      margin,
      yOffset
    );

    yOffset += splitConfirmation.length * 5 + 10;

    // ASSINATURAS
    const lineWidth = 80;

    const startX1 = margin;
    const startX2 = pageWidth - margin - lineWidth;

    const signatureY = yOffset;

    doc.setLineWidth(0.5);
    doc.setDrawColor(100);

    doc.line(
      startX1,
      signatureY,
      startX1 + lineWidth,
      signatureY
    );

    doc.line(
      startX2,
      signatureY,
      startX2 + lineWidth,
      signatureY
    );

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.setFont("helvetica", "bold");

    doc.text(
      'AGENTE DE DEFESA CIVIL',
      startX1 + lineWidth / 2,
      signatureY + 5,
      { align: 'center' }
    );

    doc.text(
      'BENEFICIÁRIO OU REPRESENTANTE',
      startX2 + lineWidth / 2,
      signatureY + 5,
      { align: 'center' }
    );

    // NUMERAÇÃO DO RECIBO
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
