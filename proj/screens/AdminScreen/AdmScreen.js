import React, { useState, useEffect } from "react";
import { View, Text, Button, ScrollView, Dimensions } from "react-native";
import Toast from "react-native-toast-message";
import styles from "../../styles";

import EstoqueSection from "./EstoqueSection";
import ReceitasSection from "./ReceitasSection";
import FuncionariosSection from "./FuncionariosSection";
import AdminsSection from "./AdminsSection";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  findDocumentByName,
} from "../../firestoreAPI";

export default function AdmScreen({ user, onLogout }) {
  const [telaAtual, setTelaAtual] = useState("estoque");
  const [modalVisivel, setModalVisivel] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  const [tipoItem, setTipoItem] = useState("");
  const [itemParaExcluirNome, setItemParaExcluirNome] = useState("");
  const { height } = Dimensions.get("window");

  // Função central de confirmação de exclusão
  function confirmarExclusao(id, tipo, nome) {
    setItemParaExcluir(id);
    setTipoItem(tipo);
    setItemParaExcluirNome(nome);
    setModalVisivel(true);
  }

  async function confirmarExcluir() {
    document.dispatchEvent(
      new CustomEvent("deleteItem", {
        detail: { id: itemParaExcluir, tipo: tipoItem, nome: itemParaExcluirNome },
      })
    );
    setModalVisivel(false);
  }

  // Carregar tudo uma vez ao montar (como antes)
  useEffect(() => {
    document.dispatchEvent(new Event("carregarTudo"));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Painel Administrativo</Text>
      <Text style={styles.subtitle}>Olá, {user.nome}</Text>

      <View style={styles.row}>
        <Button title="Estoque" onPress={() => setTelaAtual("estoque")} />
        <Button title="Receitas" onPress={() => setTelaAtual("receitas")} />
        <Button title="Funcionários" onPress={() => setTelaAtual("funcionarios")} />
        <Button title="Admins" onPress={() => setTelaAtual("admins")} />
        <Button title="Sair" color="red" onPress={onLogout} />
      </View>

      {telaAtual === "estoque" && (
        <EstoqueSection
          confirmarExclusao={confirmarExclusao}
          height={height}
          getDocuments={getDocuments}
          createDocument={createDocument}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
          findDocumentByName={findDocumentByName}
        />
      )}

      {telaAtual === "receitas" && (
        <ReceitasSection
          confirmarExclusao={confirmarExclusao}
          getDocuments={getDocuments}
          createDocument={createDocument}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
        />
      )}

      {telaAtual === "funcionarios" && (
        <FuncionariosSection
          confirmarExclusao={confirmarExclusao}
          getDocuments={getDocuments}
          createDocument={createDocument}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
        />
      )}

      {telaAtual === "admins" && (
        <AdminsSection
          confirmarExclusao={confirmarExclusao}
          user={user}
          getDocuments={getDocuments}
          createDocument={createDocument}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
        />
      )}

      <ConfirmDeleteModal
        visible={modalVisivel}
        nome={itemParaExcluirNome}
        onCancel={() => setModalVisivel(false)}
        onConfirm={confirmarExcluir}
      />

      <Toast />
    </ScrollView>
  );
}
