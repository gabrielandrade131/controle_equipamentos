import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosConfig';
import './ListaUsuarios.css';
import AlertModal from '../components/AlertModal';
import ModalEditarUsuario from '../components/ModalEditarUsuario';
import ModalConfirmacao from '../components/ModalConfirmacao';
import { getAuthUser, isAdminUser } from '../utils/auth';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  precisaTrocarSenha: boolean;
  cSafety: boolean;
  operacional: boolean;
  verificado: boolean;
  criadoEm: string;
}

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ListaUsuarios: React.FC = () => {
  const [usuarioLogado, setUsuarioLogado] = useState(() => getAuthUser());
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarioDeletando, setUsuarioDeletando] = useState<Usuario | null>(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConfirmarDelecao, setModalConfirmarDelecao] = useState(false);

  const usuarioAdmin = Boolean(
    usuarioLogado?.email && isAdminUser(),
  );
  const podeEditarVerificacao = usuarioAdmin || Boolean(usuarioLogado?.verificado);

  const showAlert = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const titles: Record<string, string> = {
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Aviso',
      info: 'Informação',
    };

    setAlert({
      isOpen: true,
      title: titles[type],
      message,
      type,
    });
  }, []);

  const carregarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users');
      const usuariosCarregados = response.data;
      setUsuarios(usuariosCarregados);

      const usuarioSessao = getAuthUser();
      if (usuarioSessao) {
        const usuarioAtualizado = usuariosCarregados.find(
          (usuario: Usuario) =>
            usuario.id === usuarioSessao.id || usuario.email === usuarioSessao.email,
        );

        if (usuarioAtualizado) {
          const proximoUsuarioLogado = {
            ...usuarioSessao,
            nome: usuarioAtualizado.nome,
            email: usuarioAtualizado.email,
            ativo: usuarioAtualizado.ativo,
            cSafety: usuarioAtualizado.cSafety,
            operacional: usuarioAtualizado.operacional,
            verificado: usuarioAtualizado.verificado,
          };

          sessionStorage.setItem('authUser', JSON.stringify(proximoUsuarioLogado));
          setUsuarioLogado(proximoUsuarioLogado);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar usuários';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const abrirModalEditar = (usuario: Usuario) => {
    if (!podeEditarVerificacao) {
      showAlert(
        'Apenas usuários master podem alterar permissões de usuários.',
        'warning',
      );
      return;
    }

    setUsuarioEditando(usuario);
    setModalEditar(true);
  };

  const fecharModalEditar = () => {
    setModalEditar(false);
    setUsuarioEditando(null);
  };

  const salvarUsuario = async (usuarioAtualizado: Partial<Usuario>) => {
    if (!usuarioAtualizado.id) return;

    setLoadingAction(true);
    try {
      const payload = usuarioAdmin
        ? {
          nome: usuarioAtualizado.nome,
          email: usuarioAtualizado.email,
          ativo: usuarioAtualizado.ativo,
          precisaTrocarSenha: usuarioAtualizado.precisaTrocarSenha,
          cSafety: usuarioAtualizado.cSafety,
          operacional: usuarioAtualizado.operacional,
          verificado: usuarioAtualizado.verificado,
        }
        : {
          verificado: usuarioAtualizado.verificado,
        };

      await axiosInstance.put(`/users/${usuarioAtualizado.id}`, payload);

      showAlert('Usuário atualizado com sucesso!', 'success');
      fecharModalEditar();
      carregarUsuarios();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar usuário';
      showAlert(errorMessage, 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const abrirModalDelecao = (usuario: Usuario) => {
    if (!usuarioAdmin) {
      showAlert('Apenas administradores podem deletar usuários.', 'warning');
      return;
    }

    setUsuarioDeletando(usuario);
    setModalConfirmarDelecao(true);
  };

  const fecharModalDelecao = () => {
    setModalConfirmarDelecao(false);
    setUsuarioDeletando(null);
  };

  const deletarUsuario = async () => {
    if (!usuarioDeletando) return;

    setLoadingAction(true);
    try {
      await axiosInstance.delete(`/users/${usuarioDeletando.id}`);

      showAlert('Usuário deletado com sucesso!', 'success');
      fecharModalDelecao();
      carregarUsuarios();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao deletar usuário';
      showAlert(errorMessage, 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="lista-usuarios-container">
      <div className="lista-usuarios-header">
        <div>
          <h1>Gerenciamento de Usuários</h1>
          {!usuarioAdmin && podeEditarVerificacao ? (
            <p className="lista-usuarios-aviso">
              Seu perfil pode alterar apenas o status de verificação dos usuários.
            </p>
          ) : null}
          {!podeEditarVerificacao ? (
            <p className="lista-usuarios-aviso">
              Apenas usuários master podem gerenciar permissões de usuários.
            </p>
          ) : null}
        </div>
        {usuarioAdmin ? (
          <button
            className="btn-novo-usuario"
            onClick={() => window.location.href = '/usuarios/cadastro'}
          >
            + Novo Usuário
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="loading">
          <p>Carregando usuários...</p>
        </div>
      ) : usuarios.length > 0 ? (
        <div className="usuarios-table-wrapper">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>C-Safety</th>
                <th>Operacional</th>
                <th>Master</th>
                <th>Data Cadastro</th>
                {podeEditarVerificacao || usuarioAdmin ? <th>Ações</th> : null}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`status ${usuario.ativo ? 'ativo' : 'inativo'}`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{usuario.cSafety ? 'Sim' : 'Não'}</td>
                  <td>{usuario.operacional ? 'Sim' : 'Não'}</td>
                  <td>{usuario.verificado ? 'Sim' : 'Não'}</td>
                  <td>{formatarData(usuario.criadoEm)}</td>
                  {podeEditarVerificacao || usuarioAdmin ? (
                    <td>
                      <div className="acoes">
                        {podeEditarVerificacao ? (
                          <button
                            className="btn-editar"
                            title="Editar"
                            onClick={() => abrirModalEditar(usuario)}
                          >
                            ✎
                          </button>
                        ) : null}
                        {usuarioAdmin ? (
                          <button
                            className="btn-deletar"
                            title="Deletar"
                            onClick={() => abrirModalDelecao(usuario)}
                          >
                            🗑
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="vazio">
          <p>Nenhum usuário cadastrado</p>
          {usuarioAdmin ? (
            <button
              className="btn-novo-usuario-grande"
              onClick={() => window.location.href = '/usuarios/cadastro'}
            >
              Cadastrar Primeiro Usuário
            </button>
          ) : null}
        </div>
      )}

      <AlertModal
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      <ModalEditarUsuario
        isOpen={modalEditar}
        usuario={usuarioEditando}
        onClose={fecharModalEditar}
        onSave={salvarUsuario}
        loading={loadingAction}
        canEditAll={usuarioAdmin}
        canEditVerification={podeEditarVerificacao}
      />

      <ModalConfirmacao
        isOpen={modalConfirmarDelecao}
        title="Deletar Usuário"
        message={`Tem certeza que deseja deletar o usuário "${usuarioDeletando?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={deletarUsuario}
        onCancel={fecharModalDelecao}
        loading={loadingAction}
        buttonConfirmText="Deletar"
        buttonCancelText="Cancelar"
        isDanger={true}
      />
    </div>
  );
};

export default ListaUsuarios;
