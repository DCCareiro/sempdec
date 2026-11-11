
function gerarReciboPDF() {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // DATA ATUAL POR EXTENSO
  function dataPorExtenso(date) {
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  }

  const dataAtual = dataPorExtenso(new Date()).toUpperCase();

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

    // DADOS AUTOMÁTICOS DA FAMÍLIA
    const lider = (familia.liderFamilia || '____________________').toUpperCase();
    const cpfLider = (familia.cpfLider || '____________________').toUpperCase();
    const localidade = (familia.localidade || '____________________').toUpperCase();

    const conjuge = (familia.nomeEsposa || '____________________').toUpperCase();
    const cpfConjuge = (familia.cpfEsposa || '____________________').toUpperCase();
    const contato = (familia.numeroContato || '____________________').toUpperCase();

    const motivoAuxilio = Array.isArray(familia.motivoAuxilio)
      ? familia.motivoAuxilio.map(m => m.toUpperCase()).join(', ')
      : (familia.motivoAuxilio || '____________________').toUpperCase();

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

    // CORPO DA DECLARAÇÃO COM PREENCHIMENTO AUTOMÁTICO
    const declaracao =
      'EU, ' + lider +
      ', INSCRITO(A) NO CPF SOB O N°: ' + cpfLider +
      ', RESIDENTE NA LOCALIDADE DE ' + localidade +
      ', DECLARO, PARA OS DEVIDOS FINS, QUE RECEBI DA SECRETARIA MUNICIPAL DE PROTEÇÃO E DEFESA CIVIL (SEMPDEC), NA DATA DE ' +
      dataAtual +
      ', A QUANTIDADE DE:';

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);

    // DESTACA OS DADOS AUTOMÁTICOS EM NEGRITO
    const partesDeclaracao = [
      { text: 'EU, ', bold: false },
      { text: lider, bold: true },
      { text: ', INSCRITO(A) NO CPF SOB O N°: ', bold: false },
      { text: cpfLider, bold: true },
      { text: ', RESIDENTE NA LOCALIDADE DE ', bold: false },
      { text: localidade, bold: true },
      {
        text: ', DECLARO, PARA OS DEVIDOS FINS, QUE RECEBI DA SECRETARIA MUNICIPAL DE PROTEÇÃO E DEFESA CIVIL (SEMPDEC), NA DATA DE ' + dataAtual + ', A QUANTIDADE DE:',
        bold: false
      }
    ];

    let linhaAtual = '';
    let linhaBold = [];
    let posY = yOffset;
    const lineHeight = 7;

    function imprimirDeclaracao() {
      let x = margin;

      linhaBold.forEach(parte => {
        doc.setFont(
          'helvetica',
          parte.bold ? 'bolditalic' : 'italic'
        );

        doc.text(parte.text, x, posY);
        x += doc.getTextWidth(parte.text);
      });

      posY += lineHeight;
      linhaBold = [];
      linhaAtual = '';
    }

    partesDeclaracao.forEach(parte => {
      const palavras = parte.text.split(/(\s+)/);

      palavras.forEach(palavra => {
        if (!palavra) return;

        doc.setFont(
          'helvetica',
          parte.bold ? 'bolditalic' : 'italic'
        );

        const larguraPalavra = doc.getTextWidth(palavra);

        if (
          doc.getTextWidth(linhaAtual) + larguraPalavra > maxWidth &&
          linhaAtual.length > 0
        ) {
          imprimirDeclaracao();
        }

        linhaBold.push({
          text: palavra,
          bold: parte.bold
        });

        linhaAtual += palavra;
      });
    });

    if (linhaBold.length > 0) {
      imprimirDeclaracao();
    }

    yOffset = posY + 5;

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

    // CÔNJUGE E CPF AUTOMÁTICOS
    const informacaoConjuge =
      'CÔNJUGE: ' + conjuge + ' — CPF: ' + cpfConjuge;

    const linhasConjuge = doc.splitTextToSize(
      informacaoConjuge,
      maxWidth
    );

    doc.text(
      linhasConjuge,
      margin,
      yOffset
    );

    yOffset += linhasConjuge.length * 5;

    // CONTATO AUTOMÁTICO
    const informacaoContato = 'CONTATO: ' + contato;

    const linhasContato = doc.splitTextToSize(
      informacaoContato,
      maxWidth
    );

    doc.text(
      linhasContato,
      margin,
      yOffset
    );

    yOffset += linhasContato.length * 5;

    // MOTIVO DO AUXÍLIO AUTOMÁTICO
    const informacaoMotivo = 'MOTIVO DO AUXÍLIO: ' + motivoAuxilio;

    const linhasMotivo = doc.splitTextToSize(
      informacaoMotivo,
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

    // ASSINATURAS - FORMATAÇÃO ATUAL
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
