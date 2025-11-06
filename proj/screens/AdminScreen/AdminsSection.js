import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import Toast from "react-native-toast-message";
import styles from "../../styles";

export default function AdminsSection({
  confirmarExclusao,
  user,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
}) {
  const [admins, setAdmins] = useState([]);
  const [nomeAdm, setNomeAdm] = useState("");
  const [emailAdm, setEmailAdm] = useState("");
  const [senhaAdm, setSenhaAdm] = useState("");
  const [tipoAdm, setTipoAdm] = useState("");
  const [editandoAdmId, setEditandoAdmId] = useState(null);

  async function carregarAdmins() {
    const docs = await getDocuments("admins");
    const lista = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome.stringValue,
        email: f.email.stringValue,
        senha: f.senha.stringValue,
        tipo: f.tipo?.stringValue || "adm",
      };
    });
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
    setAdmins(lista);
  }

  async function salvarAdm() {
    if (!nomeAdm || !emailAdm || !senhaAdm) return;

    const adminsDocs = await getDocuments("admins");
    const funcionariosDocs = await getDocuments("usuarios");
    const todos = [...adminsDocs, ...funcionariosDocs];

    const emailExiste = todos.some((doc) => {
      const f = doc.fields;
      const id = doc.name.split("/").pop();
      return (
        f.email.stringValue.toLowerCase() === emailAdm.toLowerCase() &&
        id !== editandoAdmId
      );
    });

    if (emailExiste) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Este email já está cadastrado!",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    const dados = {
      nome: nomeAdm,
      email: emailAdm,
      senha: senhaAdm,
      tipo: tipoAdm || "adm",
    };

    if (editandoAdmId) {
      await updateDocument("admins", editandoAdmId, dados);
    } else {
      await createDocument("admins", dados);
    }

    setNomeAdm("");
    setEmailAdm("");
    setSenhaAdm("");
    setTipoAdm("");
    setEditandoAdmId(null);
    carregarAdmins();

    Toast.show({
      type: "success",
      text1: "Sucesso",
      text2: `Adm ${editandoAdmId ? "atualizado" : "cadastrado"} com sucesso!`,
      position: "top",
      visibilityTime: 2000,
    });
  }

  async function excluirAdm(id) {
    if (id === user.id) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Você não pode excluir sua própria conta!",
      });
      return;
    }

    try {
      await deleteDocument("admins", id);
      carregarAdmins();
    } catch (error) {
      console.error("Erro ao excluir adm:", error);
    }
  }

  useEffect(() => {
    carregarAdmins();

    const deletar = (e) => {
      if (e.detail.tipo === "adm") excluirAdm(e.detail.id);
    };
    document.addEventListener("deleteItem", deletar);
    document.addEventListener("carregarTudo", carregarAdmins);
    return () => {
      document.removeEventListener("deleteItem", deletar);
      document.removeEventListener("carregarTudo", carregarAdmins);
    };
  }, []);

  return (
    <View>
      <Text style={styles.subtitle}>Gerenciar Administradores</Text>
      <TextInput style={styles.input} placeholder="Nome" value={nomeAdm} onChangeText={setNomeAdm} />
      <TextInput style={styles.input} placeholder="Email" value={emailAdm} onChangeText={setEmailAdm} />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senhaAdm}
        onChangeText={setSenhaAdm}
        secureTextEntry
      />
      <Button title="Salvar" onPress={salvarAdm} />
      <FlatList
        data={admins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.nome} - {item.email}</Text>
            <View style={styles.row}>
              <Button
                title="Editar"
                onPress={() => {
                  setEditandoAdmId(item.id);
                  setNomeAdm(item.nome);
                  setEmailAdm(item.email);
                  setSenhaAdm(item.senha);
                }}
              />
              <Button
                title="Excluir"
                color="red"
                onPress={() => confirmarExclusao(item.id, "adm", item.nome)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
