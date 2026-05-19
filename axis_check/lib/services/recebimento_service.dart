import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../core/http/api_client.dart';
import '../core/storage/token_storage.dart';
import '../models/checklist_recebimento_model.dart';
import '../models/os_operacao_model.dart';

class RecebimentoService {
  final TokenStorage tokenStorage;
  late final ApiClient apiClient;

  RecebimentoService({
    TokenStorage? tokenStorage,
  }) : tokenStorage = tokenStorage ?? TokenStorage() {
    apiClient = ApiClient(tokenStorage: this.tokenStorage);
  }

  Future<bool> enviarRecebimento({
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

      return true;
    }

    try {
      final formData = await montarFormDataRecebimento(
        os: os,
        checklistsPorEquipamento: checklistsPorEquipamento,
      );

      await apiClient.axisDio().post(
            '/recebimentos',
            data: formData,
            options: Options(
              contentType: 'multipart/form-data',
            ),
          );

      return true;
    } catch (e) {
      debugPrint('ERRO AO ENVIAR RECEBIMENTO: $e');
      return false;
    }
  }

  Map<String, dynamic> montarPayloadRecebimento({
    required OsOperacao os,
    required Map<String, ChecklistRecebimento> checklistsPorEquipamento,
  }) {
    return {
      'osId': os.id,
      'numeroOs': os.numeroOs,
      'cliente': os.cliente,
      'descricaoOperacao': os.descricaoOperacao,
      'status': os.status,
      'dataRecebimento': DateTime.now().toIso8601String(),
      'equipamentos': checklistsPorEquipamento.values.map((checklist) {
        return {
          'equipamentoId': checklist.equipamentoId,
          'tag': checklist.tag,
          'numeroSerie': checklist.numeroSerie,
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

    formData.fields.add(
      MapEntry('dados', jsonEncode(payload)),
    );

    for (final checklist in checklistsPorEquipamento.values) {
      for (int i = 0; i < checklist.fotos.length; i++) {
        final foto = checklist.fotos[i];

        formData.files.add(
          MapEntry(
            'fotos',
            await MultipartFile.fromFile(
              foto.path,
              filename:
                  '${checklist.tag}_${foto.tipo}_${i + 1}.jpg',
            ),
          ),
        );

        formData.fields.add(
          MapEntry(
            'foto_${checklist.tag}_${i + 1}_tipo',
            foto.tipo,
          ),
        );

        formData.fields.add(
          MapEntry(
            'foto_${checklist.tag}_${i + 1}_equipamentoId',
            checklist.equipamentoId,
          ),
        );

        formData.fields.add(
          MapEntry(
            'foto_${checklist.tag}_${i + 1}_tag',
            checklist.tag,
          ),
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
}