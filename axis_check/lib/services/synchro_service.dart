import '../core/http/api_client.dart';
import '../core/storage/token_storage.dart';
import '../models/equipamento_operacao_model.dart';
import '../models/os_operacao_model.dart';

class SynchroService {
  final TokenStorage tokenStorage;
  late final ApiClient apiClient;

  SynchroService({required this.tokenStorage}) {
    apiClient = ApiClient(tokenStorage: tokenStorage);
  }

  Future<List<OsOperacao>> listarOsEmAndamento({bool usarMock = true}) async {
    if (usarMock) {
      return _listarOsMockadas();
    }

    try {
      final response = await apiClient.synchroDio().get(
        '/api/mobile/os-em-andamento',
      );

      final data = response.data;

      if (data is List) {
        final lista = data;

        final osConvertidas = lista
            .map((item) => OsOperacao.fromJson(Map<String, dynamic>.from(item)))
            .toList();

        final osAgrupadas = _agruparOsPorNumero(osConvertidas);

        return osAgrupadas.where((os) {
          return os.equipamentos.isNotEmpty;
        }).toList();
      }

      return [];
    } catch (_) {
      return [];
    }
  }

  Future<OsOperacao?> buscarDetalheOs({
    required String osId,
    bool usarMock = true,
  }) async {
    if (usarMock) {
      final osList = _listarOsMockadas();

      try {
        return osList.firstWhere((os) => os.id == osId);
      } catch (_) {
        return null;
      }
    }

    try {
      final response = await apiClient.synchroDio().get(
        '/api/mobile/os/$osId/equipamentos',
      );

      return OsOperacao.fromJson(Map<String, dynamic>.from(response.data));
    } catch (_) {
      return null;
    }
  }

  List<OsOperacao> _listarOsMockadas() {
    return [
      OsOperacao(
        id: '1',
        numeroOs: 'OS-001',
        cliente: 'Cliente Offshore A',
        unidade: 'MV-24',
        descricaoOperacao: 'Limpeza de tanque',
        status: 'EM ANDAMENTO',
        equipamentos: [
          EquipamentoOperacao(
            id: 'eq-1',
            tipoEquipamento: 'Exaustor',
            modelo: 'CSEX420ACM',
            numeroSerie: 'CSEX420ACM-13',
            tag: 'CSEX420ACM-13',
            situacaoAtual: 'Em operação',
          ),
          EquipamentoOperacao(
            id: 'eq-2',
            tipoEquipamento: 'Bomba Pneumática',
            modelo: 'BP-200',
            numeroSerie: 'BP-200-22',
            tag: 'BP-200-22',
            situacaoAtual: 'Em operação',
          ),
        ],
      ),
      OsOperacao(
        id: '2',
        numeroOs: 'OS-002',
        cliente: 'Cliente Industrial B',
        unidade: 'MV-24',
        descricaoOperacao: 'Operação de transferência',
        status: 'EM ANDAMENTO',
        equipamentos: [
          EquipamentoOperacao(
            id: 'eq-3',
            tipoEquipamento: 'Guincho Pneumático',
            modelo: 'GP-500',
            numeroSerie: 'GP-500-31',
            tag: 'GP-500-31',
            situacaoAtual: 'Em operação',
          ),
        ],
      ),
    ];
  }

  List<OsOperacao> _agruparOsPorNumero(List<OsOperacao> lista) {
    final Map<String, OsOperacao> mapa = {};

    for (final os in lista) {
      final chave = os.numeroOs;

      if (!mapa.containsKey(chave)) {
        mapa[chave] = os;
        continue;
      }

      final osExistente = mapa[chave]!;

      final equipamentosAgrupados = [
        ...osExistente.equipamentos,
        ...os.equipamentos,
      ];

      final equipamentosSemDuplicidade = {
        for (final equipamento in equipamentosAgrupados) equipamento.id: equipamento,
      }.values.toList();

      mapa[chave] = osExistente.copyWith(
        equipamentos: equipamentosSemDuplicidade,
      );
    }

    return mapa.values.toList();
  }
}
