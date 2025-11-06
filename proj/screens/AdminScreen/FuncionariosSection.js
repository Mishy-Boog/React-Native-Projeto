import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import Toast from "react-native-toast-message";
import styles from "../../styles";

export default function FuncionariosSection({
  confirmarExclusao,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
}) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [nomeFunc, setNomeFunc] = useState("");
  const [emailFunc, setEmailFunc] = useState("");
  const [senhaFunc, setSenhaFunc] = useState("");
  const [tipoFunc, setTipoFunc] = useState("");
  const [editandoFuncId, setEditandoFuncId] = useState(null);

  async function carregarFuncionarios() {
    const docs = await getDocuments("usuarios");
    const lista = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome.stringValue,
        email: f.email.stringValue,
        senha: f.senha.stringValue,
        tipo: f.tipo?.stringValue || "",
      };
    });
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
    setFuncionarios(lista);
  }

  async function salvarFuncionario() {
    if (!nomeFunc || !emailFunc || !senhaFunc) return;

    const funcionariosDocs = await getDocuments("usuarios");
    const adminsDocs = await getDocuments("admins");
    const todos = [...funcionariosDocs, ...adminsDocs];

    const emailExiste = todos.some((doc) => {
      const f = doc.fields;
      const id = doc.name.split("/").pop();
      return (
        f.email.stringValue.toLowerCase() === emailFunc.toLowerCase() &&
        id !== editandoFuncId
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
      nome: nomeFunc,
      email: emailFunc,
      senha: senhaFunc,
      tipo: tipoFunc || "funcionario",
    };

    if (editandoFuncId) {
      await updateDocument("usuarios", editandoFuncId, dados);
    } else {
      await createDocument("usuarios", dados);
    }

    setNomeFunc("");
    setEmailFunc("");
    setSenhaFunc("");
    setTipoFunc("");
    setEditandoFuncId(null);
    carregarFuncionarios();

    Toast.show({
      type: "success",
      text1: "Sucesso",
      text2: `Funcionário ${editandoFuncId ? "atualizado" : "cadastrado"} com sucesso!`,
      position: "top",
      visibilityTime: 2000,
    });
  }

  async function excluirFuncionario(id) {
    try {
      await deleteDocument("usuarios", id);
      carregarFuncionarios();
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
    }
  }

  useEffect(() => {
    carregarFuncionarios();

    const deletar = (e) => {
      if (e.detail.tipo === "funcionario") excluirFuncionario(e.detail.id);
    };
    document.addEventListener("deleteItem", deletar);
    document.addEventListener("carregarTudo", carregarFuncionarios);
    return () => {
      document.removeEventListener("deleteItem", deletar);
      document.removeEventListener("carregarTudo", carregarFuncionarios);
    };
  }, []);

  return (
    <View>
      <Text style={styles.subtitle}>Gerenciar Funcionários</Text>
      <TextInput style={styles.input} placeholder="Nome" value={nomeFunc} onChangeText={setNomeFunc} />
      <TextInput style={styles.input} placeholder="Email" value={emailFunc} onChangeText={setEmailFunc} />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senhaFunc}
        onChangeText={setSenhaFunc}
        secureTextEntry
      />
      <Button title="Salvar" onPress={salvarFuncionario} />
      <FlatList
        data={funcionarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.nome} - {item.email}</Text>
            <View style={styles.row}>
              <Button
                title="Editar"
                onPress={() => {
                  setEditandoFuncId(item.id);
                  setNomeFunc(item.nome);
                  setEmailFunc(item.email);
                  setSenhaFunc(item.senha);
                }}
              />
              <Button
                title="Excluir"
                color="red"
                onPress={() => confirmarExclusao(item.id, "funcionario", item.nome)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
