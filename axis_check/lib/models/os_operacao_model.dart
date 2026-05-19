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

  factory OsOperacao.fromJson(Map<String, dynamic> json) {
    final equipamentosJson = json['equipamentos'];

    return OsOperacao(
      id: json['id']?.toString() ??
          json['osId']?.toString() ??
          json['ordemServicoId']?.toString() ??
          '',
      numeroOs: json['numeroOs']?.toString() ??
          json['numeroOS']?.toString() ??
          json['os']?.toString() ??
          '',
      cliente: json['cliente']?.toString() ?? '',
      descricaoOperacao: json['descricaoOperacao']?.toString() ??
          json['operacao']?.toString() ??
          json['descricao']?.toString() ??
          '',
      status: json['status']?.toString() ??
          json['situacao']?.toString() ??
          'EM ANDAMENTO',
      equipamentos: equipamentosJson is List
          ? equipamentosJson
              .map(
                (item) => EquipamentoOperacao.fromJson(
                  Map<String, dynamic>.from(item),
                ),
              )
              .toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'numeroOs': numeroOs,
      'cliente': cliente,
      'descricaoOperacao': descricaoOperacao,
      'status': status,
      'equipamentos': equipamentos.map((item) => item.toJson()).toList(),
    };
  }
}