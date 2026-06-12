class EquipamentoOperacao {
  final String id;
  final String tipoEquipamento;
  final String modelo;
  final String numeroSerie;
  final String tag;
  final String situacaoAtual;
  final bool previstoRetorno;

  EquipamentoOperacao({
    required this.id,
    required this.tipoEquipamento,
    required this.modelo,
    required this.numeroSerie,
    required this.tag,
    required this.situacaoAtual,
    required this.previstoRetorno,
  });

  factory EquipamentoOperacao.fromJson(Map<String, dynamic> json) {
    final previstoRetornoRaw =
        json['previstoRetorno'] ??
        json['previsto_retorno'] ??
        json['previsaoRetorno'] ??
        json['previsao_retorno'] ??
        json['retornoPrevisto'] ??
        json['retorno_previsto'] ??
        json['previstoParaRetorno'] ??
        json['previsto_para_retorno'] ??
        json['supervisorMarcouRetorno'] ??
        json['supervisor_marcou_retorno'];

    return EquipamentoOperacao(
      id:
          json['id']?.toString() ??
          json['equipamentoId']?.toString() ??
          json['equipamentoIdSynchro']?.toString() ??
          '',
      tipoEquipamento:
          json['tipoEquipamento']?.toString() ??
          json['tipoEquipamentoNome']?.toString() ??
          '',
      modelo:
          json['modelo']?.toString() ??
          json['modeloEquipamento']?.toString() ??
          '',
      numeroSerie: json['numeroSerie']?.toString() ?? '',
      tag: json['tag']?.toString() ?? '',
      situacaoAtual:
          json['situacaoAtual']?.toString() ??
          json['situacaoEquipamento']?.toString() ??
          '',
      previstoRetorno:
          previstoRetornoRaw == true ||
          previstoRetornoRaw?.toString().toLowerCase() == 'true' ||
          previstoRetornoRaw?.toString() == '1',
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
      'previstoRetorno': previstoRetorno,
    };
  }
}
