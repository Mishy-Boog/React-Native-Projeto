import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import styles from "../../styles";

export default function ReceitasSection({
  confirmarExclusao,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
}) {
  const [receitas, setReceitas] = useState([]);
  const [novaReceitaNome, setNovaReceitaNome] = useState("");
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [editandoReceitaId, setEditandoReceitaId] = useState(null);
  const [estoque, setEstoque] = useState([]);

  async function carregarReceitas() {
    const docs = await getDocuments("receitas");
    if (!docs || docs.length === 0) {
      
      setReceitas([]);
      return;
    }

    const recs = docs.map((doc) => {
      const f = doc.fields;
      const itens =
  Array.isArray(f.itens?.arrayValue?.values)
    ? f.itens.arrayValue.values.map((v) => {
        const campos = v.mapValue?.fields || {};
        return {
          itemId: campos.itemId?.stringValue || "",
          quantidade: parseInt(campos.quantidade?.integerValue || "0"),
        };
      })
    : [];


      return {
        id: doc.name.split("/").pop(),
        nome: f.nome?.stringValue || "Sem nome",
        itens,
      };
    });

    recs.sort((a, b) => a.nome.localeCompare(b.nome));
    setReceitas(recs);
  }

  async function carregarEstoque() {
    const docs = await getDocuments("estoque");
    const itens = docs.map((doc) => {
      const f = doc.fields || {};
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome?.stringValue || "",
        quantidade: parseInt(f.quantidade?.integerValue || "0"),
      };
    });
    itens.sort((a, b) => a.nome.localeCompare(b.nome));
    setEstoque(itens);
  }

  function toggleItemSelecionado(itemId) {
    setItensSelecionados((prev) =>
      prev.some((i) => i.itemId === itemId)
        ? prev.filter((i) => i.itemId !== itemId)
        : [...prev, { itemId, quantidade: 1 }]
    );
  }

  async function salvarReceita() {
    if (!novaReceitaNome || itensSelecionados.length === 0) return;

    const itensParaSalvar = itensSelecionados.map((i) => ({
      itemId: i.itemId,
      quantidade: i.quantidade,
    }));

    const dadosReceita = { nome: novaReceitaNome, itens: itensParaSalvar };

    if (editandoReceitaId) {
      await updateDocument("receitas", editandoReceitaId, dadosReceita);
    } else {
      await createDocument("receitas", dadosReceita);
    }

    setNovaReceitaNome("");
    setItensSelecionados([]);
    setEditandoReceitaId(null);
    carregarReceitas();
  }

  async function excluirReceita(id) {
    try {
      await deleteDocument("receitas", id);
      carregarReceitas();
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
    }
  }

  useEffect(() => {
    carregarReceitas();
    carregarEstoque();

    const deletar = (e) => {
      if (e.detail.tipo === "receita") excluirReceita(e.detail.id);
    };
    document.addEventListener("deleteItem", deletar);
    document.addEventListener("carregarTudo", carregarReceitas);
    return () => {
      document.removeEventListener("deleteItem", deletar);
      document.removeEventListener("carregarTudo", carregarReceitas);
    };
  }, []);

  return (
    <View>
      <Text style={styles.subtitle}>Gerenciar Receitas</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da receita"
        value={novaReceitaNome}
        onChangeText={setNovaReceitaNome}
      />

      <Text style={styles.bold}>Selecionar Itens e Quantidades:</Text>

      {estoque.map((item) => {
        const selecionado = itensSelecionados.find((i) => i.itemId === item.id);
        return (
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginVertical: 4,
            }}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => toggleItemSelecionado(item.id)}
            >
              <Text
                style={{
                  color: selecionado ? "green" : "black",
                  fontWeight: selecionado ? "bold" : "normal",
                }}
              >
                {item.nome}
              </Text>
            </TouchableOpacity>

            {selecionado && (
              <TextInput
                style={[styles.input, { width: 60, marginVertical: 0, textAlign: "center" }]}
                keyboardType="numeric"
                value={selecionado.quantidade.toString()}
                onChangeText={(txt) => {
                  const novaQtd = parseInt(txt) || 0;
                  setItensSelecionados((prev) =>
                    prev.map((i) =>
                      i.itemId === item.id ? { ...i, quantidade: novaQtd } : i
                    )
                  );
                }}
              />
            )}
          </View>
        );
      })}

      <Button
        title={editandoReceitaId ? "Atualizar Receita" : "Salvar Receita"}
        onPress={salvarReceita}
      />

      <Text style={[styles.bold, { marginTop: 16 }]}>Receitas cadastradas:</Text>
      <FlatList
        data={receitas}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold" }}>{item.nome}</Text>
              {item.itens.map((i) => {
                const estoqueItem = estoque.find((e) => e.id === i.itemId);
                return (
                  <Text key={i.itemId} style={{ fontSize: 12, color: "#555" }}>
                    • {estoqueItem ? estoqueItem.nome : "Item removido"}: {i.quantidade}
                  </Text>
                );
              })}
            </View>

            <View style={styles.row}>
              <Button
                title="Editar"
                onPress={() => {
                  setEditandoReceitaId(item.id);
                  setNovaReceitaNome(item.nome);
                  setItensSelecionados(item.itens);
                }}
              />
              <Button
                title="Excluir"
                color="red"
                onPress={() => confirmarExclusao(item.id, "receita", item.nome)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
