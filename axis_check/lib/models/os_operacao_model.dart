import 'equipamento_operacao_model.dart';

class OsOperacao {
  final String id;
  final String numeroOs;
  final String cliente;
  final String unidade;
  final String descricaoOperacao;
  final String status;
  final List<EquipamentoOperacao> equipamentos;

  const OsOperacao({
    required this.id,
    required this.numeroOs,
    required this.cliente,
    required this.unidade,
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
      unidade: json['unidade']?.toString() ??
          json['unidadeOS']?.toString() ??
          'MV-24',
      descricaoOperacao: json['descricaoOperacao']?.toString() ??
          json['operacao']?.toString() ??
          json['descricao']?.toString() ??
          '',
      status: json['status']?.toString() ??
          json['situacao']?.toString() ??
          'EM ANDAMENTO',
      equipamentos: equipamentosJson is List
          ? equipamentosJson
              .map((item) => EquipamentoOperacao.fromJson(
                  Map<String, dynamic>.from(item)))
              .toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'numeroOs': numeroOs,
      'cliente': cliente,
      'unidade': unidade,
      'descricaoOperacao': descricaoOperacao,
      'status': status,
      'equipamentos': equipamentos.map((item) => item.toJson()).toList(),
    };
  }

  OsOperacao copyWith({
    String? id,
    String? numeroOs,
    String? cliente,
    String? unidade,
    String? descricaoOperacao,
    String? status,
    List<EquipamentoOperacao>? equipamentos,
  }) {
    return OsOperacao(
      id: id ?? this.id,
      numeroOs: numeroOs ?? this.numeroOs,
      cliente: cliente ?? this.cliente,
      unidade: unidade ?? this.unidade,
      descricaoOperacao: descricaoOperacao ?? this.descricaoOperacao,
      status: status ?? this.status,
      equipamentos: equipamentos ?? this.equipamentos,
    );
  }
}