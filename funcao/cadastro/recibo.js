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
