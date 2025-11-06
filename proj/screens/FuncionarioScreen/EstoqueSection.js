import React from "react";
import { View, Text, Button, FlatList } from "react-native";
import Toast from "react-native-toast-message";
import { updateDocument } from "../../firestoreAPI";
import styles from "../../styles";

export default function EstoqueSection({ estoque, setEstoque }) {
  async function retirarItem(id) {
    const item = estoque.find((i) => i.id === id);
    if (!item || item.quantidade <= 0) return;

    setEstoque((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, quantidade: e.quantidade - 1 } : e
      )
    );

    try {
      await updateDocument("estoque", id, { quantidade: item.quantidade - 1 });
      Toast.show({
        type: "success",
        text1: "Item retirado com sucesso!",
        position: "bottom",
      });
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível atualizar o estoque",
        position: "bottom",
      });
      setEstoque((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, quantidade: e.quantidade + 1 } : e
        )
      );
    }
  }

  return (
    <FlatList
      data={estoque}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <Text>
            {item.nome} - {item.quantidade}
          </Text>
          {item.quantidade > 0 && (
            <Button title="Retirar 1" onPress={() => retirarItem(item.id)} />
          )}
        </View>
      )}
    />
  );
}
