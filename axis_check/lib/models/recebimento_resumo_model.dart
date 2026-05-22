class RecebimentoResumo {
  final String id;
  final String numeroOs;
  final String cliente;
  final String descricaoOperacao;
  final String statusOperacao;
  final DateTime? dataRecebimento;
  final bool sincronizadoSynchro;
  final String statusRecebimento;
  final int totalEquipamentos;
  final int totalAvarias;

  const RecebimentoResumo({
    required this.id,
    required this.numeroOs,
    required this.cliente,
    required this.descricaoOperacao,
    required this.statusOperacao,
    required this.dataRecebimento,
    required this.sincronizadoSynchro,
    required this.statusRecebimento,
    required this.totalEquipamentos,
    required this.totalAvarias,
  });

  factory RecebimentoResumo.fromJson(Map<String, dynamic> json) {
    final equipamentos = json['equipamentos'] is List
        ? List<Map<String, dynamic>>.from(
            (json['equipamentos'] as List).map(
              (item) => Map<String, dynamic>.from(item),
            ),
          )
        : const <Map<String, dynamic>>[];

    final totalAvarias = equipamentos.where((equipamento) {
      return equipamento['possuiAvaria'] == true;
    }).length;

    return RecebimentoResumo(
      id: json['id']?.toString() ?? '',
      numeroOs: json['numeroOs']?.toString() ?? '',
      cliente: json['cliente']?.toString() ?? '',
      descricaoOperacao: json['descricaoOperacao']?.toString() ?? '',
      statusOperacao: json['statusOperacao']?.toString() ?? '',
      dataRecebimento: _parseDateTime(json['dataRecebimento']?.toString()),
      sincronizadoSynchro: json['sincronizadoSynchro'] == true,
      statusRecebimento: json['statusRecebimento']?.toString() ?? '',
      totalEquipamentos: equipamentos.length,
      totalAvarias: totalAvarias,
    );
  }

  static DateTime? _parseDateTime(String? value) {
    if (value == null || value.trim().isEmpty) {
      return null;
    }

    return DateTime.tryParse(value);
  }
}
