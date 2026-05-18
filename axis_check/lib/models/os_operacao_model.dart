import 'equipamento_operacao_model.dart';

class OsOperacao {
  final String id;
  final String numeroOs;
  final String cliente;
  final String descricaoOperacao;
  final String status;
  final List<EquipamentoOperacao> equipamentos;

  OsOperacao({
    required this.id,
    required this.numeroOs,
    required this.cliente,
    required this.descricaoOperacao,
    required this.status,
    required this.equipamentos,
  });
}