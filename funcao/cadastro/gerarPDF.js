function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const motivoFiltro = document.getElementById('motivoAuxilioSelect').value;
  const comunidadeSelecionada = document.getElementById('comunidadeSelect').value;

  const headers = [
    'Nº', 'Líder', 'CPF Líder', 'Contato', 'Nascimento',
    'Título', 'Zona', 'Seção', 'Cônjuge',
    'CPF Cônjuge', 'Título Cônj.', 'Zona Cônj.',
    'Seção Cônj.', 'Filhos', 'Localidade'
  ];

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const availableWidth = pageWidth - 2 * margin;

  // Define largura da primeira coluna menor e distribui o restante igualmente
  const firstColWidth = 8; // coluna Nº menor
  const remainingCols = headers.length - 1;
  const remainingWidth = availableWidth - firstColWidth;
  const otherColWidth = remainingWidth / remainingCols;

  const tableData = fichasCache
    .filter(f => motivoFiltro === "todos" || (Array.isArray(f.motivoAuxilio) ? f.motivoAuxilio.includes(motivoFiltro) : f.motivoAuxilio === motivoFiltro))
    .filter(f => comunidadeSelecionada === "todas" || f.localidade === comunidadeSelecionada)
    .sort((a, b) => (a.liderFamilia || '').localeCompare(b.liderFamilia || ''))
    .map((f, index) => [
      index + 1, // Número em série
      f.liderFamilia || '-', f.cpfLider || '-', f.numeroContato || '-', formatarDataBR(f.dataNascimentoLider || ''),
      f.tituloEleitorLider || '-', f.zonaLider || '-', f.secaoLider || '-', f.nomeEsposa || '-',
      f.cpfEsposa || '-', f.tituloEleitorEsposa || '-', f.zonaEsposa || '-', f.secaoEsposa || '-',
      f.filhos || '-', f.localidade || '-'
    ]);

  const titulo = `Cadastros - ${comunidadeSelecionada === 'todas' ? 'Todas as Comunidades' : comunidadeSelecionada} - ${motivoFiltro === 'todos' ? 'Todos os Motivos' : motivoFiltro}`;
  doc.setFontSize(14);
  doc.text(titulo, pageWidth / 2, 20, { align: "center" });

  doc.addImage(logoEsquerda, 'PNG', margin, 5, 20, 15); // Esquerda
  doc.addImage(logoDireita, 'PNG', pageWidth - margin - 20, 5, 20, 15); // Direita

  doc.autoTable({
    startY: 30,
    head: [headers],
    body: tableData,
    margin: { top: 30, left: margin, right: margin },
    styles: {
      fontSize: 6,
      cellPadding: 2,
      overflow: 'linebreak',
      lineHeight: 1.2,
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: headers.reduce((acc, _, index) => {
      acc[index] = { cellWidth: index === 0 ? firstColWidth : otherColWidth };
      return acc;
    }, {}),
    didDrawPage: function (data) {
      doc.setFontSize(8);
      const pageStr = `Página ${data.pageNumber}`;
      doc.text(pageStr, data.settings.margin.left, doc.internal.pageSize.getHeight() - 5);
      doc.text(`Emitido em: ${dataAtual}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 5);
    }
  });

  doc.save(`cadastros_${comunidadeSelecionada}_${motivoFiltro}.pdf`);
}
