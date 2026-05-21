class EquipamentoRecebido {
  final String numeroOs;
  final String tag;
  final String numeroSerie;

  EquipamentoRecebido({
    required this.numeroOs,
    required this.tag,
    required this.numeroSerie,
  });

  factory EquipamentoRecebido.fromJson(Map<String, dynamic> json) {
    return EquipamentoRecebido(
      numeroOs: json['numeroOs']?.toString() ?? '',
      tag: json['tag']?.toString() ?? '',
      numeroSerie: json['numeroSerie']?.toString() ?? '',
    );
  }
}