class EquipamentoOperacao {
  final String id;
  final String tipoEquipamento;
  final String modelo;
  final String numeroSerie;
  final String tag;
  final String situacaoAtual;

  EquipamentoOperacao({
    required this.id,
    required this.tipoEquipamento,
    required this.modelo,
    required this.numeroSerie,
    required this.tag,
    required this.situacaoAtual,
  });

  factory EquipamentoOperacao.fromJson(Map<String, dynamic> json) {
    return EquipamentoOperacao(
      id: json['id']?.toString() ??
          json['equipamentoId']?.toString() ??
          json['equipamentoIdSynchro']?.toString() ??
          '',
      tipoEquipamento: json['tipoEquipamento']?.toString() ??
          json['tipoEquipamentoNome']?.toString() ??
          '',
      modelo: json['modelo']?.toString() ??
          json['modeloEquipamento']?.toString() ??
          '',
      numeroSerie: json['numeroSerie']?.toString() ?? '',
      tag: json['tag']?.toString() ?? '',
      situacaoAtual: json['situacaoAtual']?.toString() ??
          json['situacaoEquipamento']?.toString() ??
          '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tipoEquipamento': tipoEquipamento,
      'modelo': modelo,
      'numeroSerie': numeroSerie,
      'tag': tag,
      'situacaoAtual': situacaoAtual,
    };
  }
}