import 'foto_recebimento_model.dart';

class ChecklistRecebimento {
  final String equipamentoId;
  final String tag;
  final String numeroSerie;
  final bool retornouFisicamente;
  final bool equipamentoConferido;
  final bool possuiAvaria;
  final String observacao;
  final List<FotoRecebimento> fotos;
  final DateTime criadoEm;

  ChecklistRecebimento({
    required this.equipamentoId,
    required this.tag,
    required this.numeroSerie,
    required this.retornouFisicamente,
    required this.equipamentoConferido,
    required this.possuiAvaria,
    required this.observacao,
    required this.fotos,
    required this.criadoEm,
  });
}