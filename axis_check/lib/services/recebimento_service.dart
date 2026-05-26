import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../core/http/api_client.dart';
import '../core/storage/token_storage.dart';
import '../models/checklist_recebimento_model.dart';
import '../models/recebimento_resumo_model.dart';
import '../models/os_operacao_model.dart';
import '../models/equipamento_recebido_model.dart';

class RecebimentoService {
  final TokenStorage tokenStorage;
  late final ApiClient apiClient;

  RecebimentoService({TokenStorage? tokenStorage})
    : tokenStorage = tokenStorage ?? TokenStorage() {
    apiClient = ApiClient(tokenStorage: this.tokenStorage);
  }

  Future<String?> enviarRecebimento({
    required OsOperacao os,
    required Map<String, ChecklistRecebimento> checklistsPorEquipamento,
    bool usarMock = true,
  }) async {
    if (usarMock) {
      final payload = montarPayloadRecebimento(
        os: os,
        checklistsPorEquipamento: checklistsPorEquipamento,
      );

      debugPrint('ENVIANDO RECEBIMENTO MOCK PARA O AXIS...');
      debugPrint(payload.toString());

      await Future.delayed(const Duration(seconds: 1));

      return null;
    }

    try {
      final formData = await montarFormDataRecebimento(
        os: os,
        checklistsPorEquipamento: checklistsPorEquipamento,
      );

      await apiClient.axisDio().post(
        '/recebimentos',
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );

      return null;
    } on DioException catch (e) {
      final data = e.response?.data;
      String? mensagem;

      if (data is Map<String, dynamic>) {
        final message = data['message'];
        if (message is String && message.trim().isNotEmpty) {
          mensagem = message.trim();
        } else if (message is List && message.isNotEmpty) {
          mensagem = message.join('\n');
        } else if (data['error'] is String) {
          mensagem = data['error'].toString();
        }
      }

      debugPrint('ERRO AO ENVIAR RECEBIMENTO: ${mensagem ?? e.toString()}');
      return mensagem ?? 'Erro ao enviar recebimento. Tente novamente.';
    } catch (e) {
      debugPrint('ERRO AO ENVIAR RECEBIMENTO: $e');
      return 'Erro ao enviar recebimento. Tente novamente.';
    }
  }

  Map<String, dynamic> montarPayloadRecebimento({
    required OsOperacao os,
    required Map<String, ChecklistRecebimento> checklistsPorEquipamento,
  }) {
    final checklistsRecebidos = os.equipamentos
        .map((equipamento) => checklistsPorEquipamento[equipamento.id])
        .where(
          (checklist) => checklist != null && checklist.retornouFisicamente,
        )
        .cast<ChecklistRecebimento>()
        .toList();

    return {
      'osId': os.id,
      'numeroOs': os.numeroOs,
      'cliente': os.cliente,
      'descricaoOperacao': os.descricaoOperacao,
      'status': os.status,
      'dataRecebimento': DateTime.now().toIso8601String(),
      'equipamentos': checklistsRecebidos.map((checklist) {
        final equipamento = os.equipamentos.firstWhere(
          (item) => item.id == checklist.equipamentoId,
          orElse: () => throw StateError(
            'Equipamento ${checklist.equipamentoId} não encontrado na OS ${os.numeroOs}.',
          ),
        );

        return {
          'equipamentoId': checklist.equipamentoId,
          'equipamentoIdSynchro': checklist.equipamentoId,
          'numeroOs': os.numeroOs,
          'tag': checklist.tag,
          'numeroSerie': checklist.numeroSerie,
          'tipoEquipamento': checklist.tipoEquipamento.isNotEmpty
              ? checklist.tipoEquipamento
              : equipamento.tipoEquipamento,
          'modelo': checklist.modelo.isNotEmpty
              ? checklist.modelo
              : equipamento.modelo,
          'retornouFisicamente': checklist.retornouFisicamente,
          'equipamentoConferido': checklist.equipamentoConferido,
          'possuiAvaria': checklist.possuiAvaria,
          'observacao': checklist.observacao,
          'fotos': checklist.fotos.map((foto) {
            return {
              'path': foto.path,
              'tipo': foto.tipo,
              'criadoEm': foto.criadoEm.toIso8601String(),
            };
          }).toList(),
        };
      }).toList(),
    };
  }

  Future<FormData> montarFormDataRecebimento({
    required OsOperacao os,
    required Map<String, ChecklistRecebimento> checklistsPorEquipamento,
  }) async {
    final payload = montarPayloadRecebimento(
      os: os,
      checklistsPorEquipamento: checklistsPorEquipamento,
    );

    final formData = FormData();

    formData.fields.add(MapEntry('dados', jsonEncode(payload)));

    final checklistsRecebidos = os.equipamentos
        .map((equipamento) => checklistsPorEquipamento[equipamento.id])
        .where(
          (checklist) => checklist != null && checklist.retornouFisicamente,
        )
        .cast<ChecklistRecebimento>()
        .toList();

    for (final checklist in checklistsRecebidos) {
      for (int i = 0; i < checklist.fotos.length; i++) {
        final foto = checklist.fotos[i];

        formData.files.add(
          MapEntry(
            'fotos',
            await MultipartFile.fromFile(
              foto.path,
              filename: '${checklist.tag}_${foto.tipo}_${i + 1}.jpg',
            ),
          ),
        );

        formData.fields.add(
          MapEntry('foto_${checklist.tag}_${i + 1}_tipo', foto.tipo),
        );

        formData.fields.add(
          MapEntry(
            'foto_${checklist.tag}_${i + 1}_equipamentoId',
            checklist.equipamentoId,
          ),
        );

        formData.fields.add(
          MapEntry('foto_${checklist.tag}_${i + 1}_tag', checklist.tag),
        );

        formData.fields.add(
          MapEntry(
            'foto_${checklist.tag}_${i + 1}_numeroSerie',
            checklist.numeroSerie,
          ),
        );
      }
    }

    return formData;
  }

  Future<List<EquipamentoRecebido>> listarEquipamentosRecebidos({
    bool usarMock = true,
  }) async {
    if (usarMock) {
      return [];
    }

    try {
      final response = await apiClient.axisDio().get(
        '/recebimentos/equipamentos-recebidos',
      );

      final data = response.data;

      if (data is List) {
        return data
            .map(
              (item) =>
                  EquipamentoRecebido.fromJson(Map<String, dynamic>.from(item)),
            )
            .toList();
      }

      return [];
    } catch (e) {
      debugPrint('ERRO AO LISTAR EQUIPAMENTOS RECEBIDOS: $e');
      throw Exception('Erro ao buscar equipamentos já recebidos.');
    }
  }

  Future<bool> osJaFoiRecebida({
    required String numeroOs,
    bool usarMock = true,
  }) async {
    if (usarMock) {
      return false;
    }

    try {
      final response = await apiClient.axisDio().get(
        '/recebimentos/os/$numeroOs',
      );

      final data = response.data;

      return data['recebido'] == true;
    } catch (e) {
      debugPrint('ERRO AO CONSULTAR RECEBIMENTO DA OS: $e');

      return false;
    }
  }

  Future<List<RecebimentoResumo>> listarUltimosRecebimentos({
    bool usarMock = true,
  }) async {
    if (usarMock) {
      return [];
    }

    try {
      final response = await apiClient.axisDio().get('/recebimentos');
      final data = response.data;

      if (data is List) {
        return data
            .map(
              (item) =>
                  RecebimentoResumo.fromJson(Map<String, dynamic>.from(item)),
            )
            .toList();
      }

      return [];
    } catch (e) {
      debugPrint('ERRO AO LISTAR ULTIMOS RECEBIMENTOS: $e');
      throw Exception('Erro ao buscar historico de recebimentos.');
    }
  }
}
