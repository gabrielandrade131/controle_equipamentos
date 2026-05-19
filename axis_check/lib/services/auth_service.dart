import '../core/http/api_client.dart';
import '../core/storage/token_storage.dart';

class AuthService {
  final TokenStorage tokenStorage;
  late final ApiClient apiClient;

  AuthService({
    required this.tokenStorage,
  }) {
    apiClient = ApiClient(tokenStorage: tokenStorage);
  }

  Future<bool> login({
    required String email,
    required String senha,
  }) async {
    try {
      final response = await apiClient.axisDio().post(
        '/auth/login',
        data: {
          'email': email,
          'senha': senha,
        },
      );

      final token = response.data['access_token'];

      if (token == null) {
        return false;
      }

      await tokenStorage.salvarToken(token);

      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await tokenStorage.removerToken();
  }

  Future<bool> estaLogado() async {
    final token = await tokenStorage.buscarToken();
    return token != null && token.isNotEmpty;
  }
}